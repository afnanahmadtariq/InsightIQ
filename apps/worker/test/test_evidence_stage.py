import json
import os
import unittest
from unittest.mock import patch

from insightiq_worker.db import Worker
from insightiq_worker.pipeline import (
    BACKOFF_SQL,
    CLAIM_SQL,
    COUNTS_SQL,
    FAIL_SQL,
    FETCH_SOURCES_SQL,
    INSERT_EVIDENCE_SQL,
)


class _FakeMessage:
    def __init__(self, content: str):
        self.content = content


class _FakeChoice:
    def __init__(self, content: str):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content: str):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, contents: list[str]):
        self._contents = list(contents)
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        content = self._contents.pop(0)
        return _FakeResponse(content)


class _FakeChat:
    def __init__(self, contents: list[str]):
        self.completions = _FakeCompletions(contents)


class FakeModelClient:
    def __init__(self, contents: list[str]):
        self.chat = _FakeChat(contents)


class FakeCursor:
    def __init__(self, fetchone_result=None, fetchall_result=None):
        self._fetchone_result = fetchone_result
        self._fetchall_result = fetchall_result if fetchall_result is not None else []

    def fetchone(self):
        return self._fetchone_result

    def fetchall(self):
        return self._fetchall_result


RUN_ID = 'run-1'
ORGANIZATION_ID = 'org-1'
CLAIMED_ROW = (RUN_ID, ORGANIZATION_ID, 'running', 0)
SOURCE_ROW = ('source-1', 'https://example.test/a', 'A Title', 'A Publisher', 'A Excerpt', None)
RUN_CONTEXT_ROW = (RUN_ID, ORGANIZATION_ID, 'meeting', 'user-1', 'Jane Doe', 'Acme', 'Platform', 'Better conversations.')
EVIDENCE_ROW = ('evidence-1', 'Acme raised $5M', 'funding', 0.9, 'https://example.test/a', 'A Title')


class FakeConnection:
    def __init__(
        self,
        *,
        claimed_row,
        counts_row,
        sources_rows=None,
        existing_evidence_count=0,
        evidence_rows=None,
        raise_on_sql=None,
        raise_error=None,
    ):
        self.claimed_row = claimed_row
        self.counts_row = counts_row
        self.sources_rows = sources_rows if sources_rows is not None else []
        self.existing_evidence_count = existing_evidence_count
        self.evidence_rows = evidence_rows if evidence_rows is not None else []
        self.raise_on_sql = raise_on_sql
        self.raise_error = raise_error
        self.actions: list[tuple] = []
        self.commit_count = 0
        self.rollback_count = 0

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, sql, params=None):
        self.actions.append(('execute', sql, params))
        if self.raise_on_sql is not None and sql == self.raise_on_sql:
            raise self.raise_error
        if sql == 'SET statement_timeout = 15000':
            return FakeCursor()
        if sql == CLAIM_SQL:
            return FakeCursor(fetchone_result=self.claimed_row)
        if sql == COUNTS_SQL:
            return FakeCursor(fetchone_result=self.counts_row)
        if sql == FETCH_SOURCES_SQL:
            return FakeCursor(fetchall_result=self.sources_rows)
        if 'FROM research_run r' in sql and 'JOIN prospect p' in sql:
            return FakeCursor(fetchone_result=RUN_CONTEXT_ROW)
        if 'SELECT COUNT(*)::int FROM evidence WHERE' in sql:
            return FakeCursor(fetchone_result=(self.existing_evidence_count,))
        if 'SELECT id FROM deal_brief WHERE' in sql:
            return FakeCursor(fetchone_result=None)
        if 'FROM evidence e' in sql and 'JOIN evidence_source s' in sql:
            return FakeCursor(fetchall_result=self.evidence_rows)
        if sql in (BACKOFF_SQL, FAIL_SQL, INSERT_EVIDENCE_SQL):
            return FakeCursor()
        if 'INSERT INTO deal_brief' in sql or 'INSERT INTO notification' in sql:
            return FakeCursor()
        if '"completedAt" = NOW()' in sql:
            return FakeCursor()
        raise AssertionError(f'unexpected SQL executed: {sql}')

    def commit(self):
        self.actions.append(('commit', None, None))
        self.commit_count += 1

    def rollback(self):
        self.actions.append(('rollback', None, None))
        self.rollback_count += 1

    def executed_sql(self) -> list[str]:
        return [sql for kind, sql, _params in self.actions if kind == 'execute']


class _RaisingCompletions:
    def __init__(self, error: Exception):
        self._error = error
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        raise self._error


class _RaisingChat:
    def __init__(self, error: Exception):
        self.completions = _RaisingCompletions(error)


class RaisingModelClient:
    def __init__(self, error: Exception):
        self.chat = _RaisingChat(error)


class EvidenceSqlInvariantsTest(unittest.TestCase):
    def test_fetch_sources_sql_scoped_by_organization_id(self):
        self.assertIn('"organizationId"', FETCH_SOURCES_SQL)

    def test_insert_evidence_sql_scoped_by_organization_id(self):
        self.assertIn('"organizationId"', INSERT_EVIDENCE_SQL)


class EvidenceStageIdempotencyTest(unittest.TestCase):
    def test_evidence_already_present_never_builds_a_model_client(self):
        def factory(_config):
            raise AssertionError('should not be called')

        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(2, 1, False),
            existing_evidence_count=1,
            evidence_rows=[EVIDENCE_ROW],
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=factory)
        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        self.assertNotIn(FETCH_SOURCES_SQL, connection.executed_sql())
        self.assertNotIn(INSERT_EVIDENCE_SQL, connection.executed_sql())
        self.assertEqual(connection.commit_count, 1)


class EvidenceStageHappyPathTest(unittest.TestCase):
    def test_extracted_claim_is_inserted_and_committed_after_insert(self):
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[SOURCE_ROW],
        )
        fake_client = FakeModelClient(
            [json.dumps({'claims': [{'claim': 'Acme raised $5M', 'signalType': 'funding', 'confidence': 0.9, 'observedAt': None}]})]
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        insert_calls = [
            (sql, params) for kind, sql, params in connection.actions if kind == 'execute' and sql == INSERT_EVIDENCE_SQL
        ]
        self.assertEqual(len(insert_calls), 1)
        _sql, params = insert_calls[0]
        self.assertEqual(params[1], ORGANIZATION_ID)
        self.assertEqual(params[2], RUN_ID)
        self.assertEqual(params[3], 'source-1')

        insert_index = connection.actions.index(('execute', INSERT_EVIDENCE_SQL, params))
        commit_indices = [index for index, action in enumerate(connection.actions) if action[0] == 'commit']
        self.assertTrue(commit_indices)
        self.assertGreater(commit_indices[-1], insert_index)


class EvidenceStageAllClaimsDroppedTest(unittest.TestCase):
    def test_zero_surviving_claims_fails_the_run_instead_of_backing_off(self):
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[SOURCE_ROW],
        )
        fake_client = FakeModelClient([json.dumps({'claims': []})])
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        self.assertIn(FAIL_SQL, connection.executed_sql())
        self.assertNotIn(BACKOFF_SQL, connection.executed_sql())
        self.assertNotIn(INSERT_EVIDENCE_SQL, connection.executed_sql())


class EvidenceStageSuccessBackoffTest(unittest.TestCase):
    def test_backoff_sql_executed_after_evidence_stage_succeeds_so_run_becomes_pollable_soon(self):
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[SOURCE_ROW],
        )
        fake_client = FakeModelClient(
            [json.dumps({'claims': [{'claim': 'Acme raised $5M', 'signalType': 'funding', 'confidence': 0.9, 'observedAt': None}]})]
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        executed_sql = connection.executed_sql()
        self.assertIn(BACKOFF_SQL, executed_sql)
        self.assertGreater(executed_sql.index(BACKOFF_SQL), executed_sql.index(INSERT_EVIDENCE_SQL))
        self.assertEqual(connection.commit_count, 1)


class EvidenceStageInsertFailureRollsBackTest(unittest.TestCase):
    def test_rollback_called_before_fail_sql_when_insert_raises(self):
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[SOURCE_ROW],
            raise_on_sql=INSERT_EVIDENCE_SQL,
            raise_error=RuntimeError('constraint violation'),
        )
        fake_client = FakeModelClient(
            [json.dumps({'claims': [{'claim': 'Acme raised $5M', 'signalType': 'funding', 'confidence': 0.9, 'observedAt': None}]})]
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        rollback_indices = [index for index, action in enumerate(connection.actions) if action[0] == 'rollback']
        fail_indices = [
            index
            for index, (kind, sql, _params) in enumerate(connection.actions)
            if kind == 'execute' and sql == FAIL_SQL
        ]
        self.assertTrue(rollback_indices, 'rollback() was never called')
        self.assertTrue(fail_indices, 'FAIL_SQL was never executed')
        self.assertLess(rollback_indices[0], fail_indices[0])
        self.assertEqual(connection.rollback_count, 1)


class EvidenceStageBlankExcerptTest(unittest.TestCase):
    def test_source_with_blank_excerpt_is_skipped_and_run_fails_with_no_surviving_claims(self):
        blank_source = ('source-blank', 'https://example.test/b', 'B Title', 'B Publisher', '   ', None)
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[blank_source],
        )
        fake_client = FakeModelClient([])
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        self.assertEqual(len(fake_client.chat.completions.calls), 0)
        self.assertIn(FAIL_SQL, connection.executed_sql())
        self.assertNotIn(INSERT_EVIDENCE_SQL, connection.executed_sql())

    def test_source_with_null_excerpt_is_skipped_while_other_sources_still_process_normally(self):
        null_excerpt_source = ('source-null', 'https://example.test/n', 'N Title', 'N Publisher', None, None)
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(2, 0, False),
            sources_rows=[null_excerpt_source, SOURCE_ROW],
        )
        fake_client = FakeModelClient(
            [json.dumps({'claims': [{'claim': 'Acme raised $5M', 'signalType': 'funding', 'confidence': 0.9, 'observedAt': None}]})]
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        self.assertEqual(len(fake_client.chat.completions.calls), 1)
        insert_calls = [
            (sql, params) for kind, sql, params in connection.actions if kind == 'execute' and sql == INSERT_EVIDENCE_SQL
        ]
        self.assertEqual(len(insert_calls), 1)
        self.assertEqual(insert_calls[0][1][3], 'source-1')
        self.assertNotIn(FAIL_SQL, connection.executed_sql())


class EvidenceStageDegradeOneSourceTest(unittest.TestCase):
    def test_structured_output_error_on_one_source_degrades_it_but_run_still_succeeds(self):
        failing_source = ('source-fail', 'https://example.test/f', 'Fail Title', 'Fail Publisher', 'Fail excerpt', None)
        ok_source = ('source-ok', 'https://example.test/ok', 'OK Title', 'OK Publisher', 'OK excerpt', None)
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(2, 0, False),
            sources_rows=[failing_source, ok_source],
        )
        fake_client = FakeModelClient(
            [
                'not json',
                'not json',
                json.dumps({'claims': [{'claim': 'Acme raised $5M', 'signalType': 'funding', 'confidence': 0.9, 'observedAt': None}]}),
            ]
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        insert_calls = [
            (sql, params) for kind, sql, params in connection.actions if kind == 'execute' and sql == INSERT_EVIDENCE_SQL
        ]
        self.assertEqual(len(insert_calls), 1)
        self.assertEqual(insert_calls[0][1][3], 'source-ok')
        self.assertNotIn(FAIL_SQL, connection.executed_sql())
        self.assertEqual(connection.commit_count, 1)

    def test_a_different_exception_type_still_propagates_and_fails_the_run(self):
        connection = FakeConnection(
            claimed_row=CLAIMED_ROW,
            counts_row=(1, 0, False),
            sources_rows=[SOURCE_ROW],
        )
        fake_client = RaisingModelClient(ConnectionError('network down'))
        worker = Worker(database_url='postgresql://x', model_client_factory=lambda _config: fake_client)

        with patch.dict(os.environ, {'DASHSCOPE_API_KEY': 'test-key'}):
            with patch('psycopg.connect', return_value=connection):
                result = worker.poll_once()

        self.assertTrue(result)
        self.assertIn(FAIL_SQL, connection.executed_sql())
        self.assertNotIn(INSERT_EVIDENCE_SQL, connection.executed_sql())


if __name__ == '__main__':
    unittest.main()
