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


class FakeConnection:
    def __init__(self, *, claimed_row, counts_row, sources_rows=None):
        self.claimed_row = claimed_row
        self.counts_row = counts_row
        self.sources_rows = sources_rows if sources_rows is not None else []
        self.actions: list[tuple] = []
        self.commit_count = 0

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, sql, params=None):
        self.actions.append(('execute', sql, params))
        if sql == 'SET statement_timeout = 15000':
            return FakeCursor()
        if sql == CLAIM_SQL:
            return FakeCursor(fetchone_result=self.claimed_row)
        if sql == COUNTS_SQL:
            return FakeCursor(fetchone_result=self.counts_row)
        if sql == FETCH_SOURCES_SQL:
            return FakeCursor(fetchall_result=self.sources_rows)
        if sql in (BACKOFF_SQL, FAIL_SQL, INSERT_EVIDENCE_SQL):
            return FakeCursor()
        raise AssertionError(f'unexpected SQL executed: {sql}')

    def commit(self):
        self.actions.append(('commit', None, None))
        self.commit_count += 1

    def executed_sql(self) -> list[str]:
        return [sql for kind, sql, _params in self.actions if kind == 'execute']


RUN_ID = 'run-1'
ORGANIZATION_ID = 'org-1'
CLAIMED_ROW = (RUN_ID, ORGANIZATION_ID, 'running', 0)
SOURCE_ROW = ('source-1', 'https://example.test/a', 'A Title', 'A Publisher', 'A Excerpt')


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
        )
        worker = Worker(database_url='postgresql://x', model_client_factory=factory)
        with patch('psycopg.connect', return_value=connection):
            result = worker.poll_once()

        self.assertTrue(result)
        self.assertIn(BACKOFF_SQL, connection.executed_sql())
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


if __name__ == '__main__':
    unittest.main()
