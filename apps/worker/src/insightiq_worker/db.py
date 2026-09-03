from __future__ import annotations

import datetime
import logging
import os
import time
from pathlib import Path
from typing import Callable
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from uuid import uuid4

from insightiq_worker import evidence
from insightiq_worker.model_gateway import ModelGatewayConfig, StructuredOutputError, build_client
from insightiq_worker.pipeline import (
    BACKOFF_SQL,
    CLAIM_SQL,
    COUNTS_SQL,
    FAIL_SQL,
    FETCH_SOURCES_SQL,
    INSERT_EVIDENCE_SQL,
    next_stage,
)

log = logging.getLogger('insightiq.worker')


def _generate_evidence_id() -> str:
    return uuid4().hex


def _is_blank_excerpt(excerpt: str | None) -> bool:
    return excerpt is None or not excerpt.strip()


def _prefer_source_published_at(
    source: dict, claims: list[evidence.ExtractedClaim]
) -> list[evidence.ExtractedClaim]:
    # The source's own publishedAt is a trustworthy, non-nullable-format Postgres
    # date/datetime. Prefer it over an LLM-invented observedAt when the source has one.
    published_at = source.get('publishedAt')
    if published_at is None:
        return claims
    observed_at = _format_source_published_at(published_at)
    return [claim.model_copy(update={'observedAt': observed_at}) for claim in claims]


def _format_source_published_at(value: datetime.date | datetime.datetime) -> str:
    if isinstance(value, datetime.datetime):
        return value.date().isoformat()
    return value.isoformat()


def postgres_url(url: str) -> str:
    parsed = urlparse(url)
    query = [(key, value) for key, value in parse_qsl(parsed.query, keep_blank_values=True) if key.lower() != 'schema']
    return urlunparse(parsed._replace(query=urlencode(query)))


def load_database_url() -> str:
    if url := os.environ.get('DATABASE_URL', '').strip():
        return postgres_url(url)
    for start in (Path.cwd(), Path(__file__).resolve().parent):
        for folder in [start, *start.parents]:
            env_file = folder / '.env'
            if not env_file.is_file():
                continue
            for raw in env_file.read_text().splitlines():
                line = raw.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                if key.strip() == 'DATABASE_URL':
                    return postgres_url(value.strip().strip('"').strip("'"))
    raise RuntimeError('DATABASE_URL is required')


class Worker:
    def __init__(
        self,
        database_url: str,
        worker_id: str | None = None,
        model_client_factory: Callable[[ModelGatewayConfig], object] | None = None,
    ):
        self.database_url = database_url
        self.worker_id = worker_id or uuid4().hex[:12]
        self.lock_for = os.environ.get('WORKER_LOCK_INTERVAL', '10 minutes')
        self.backoff_for = os.environ.get('WORKER_BACKOFF_INTERVAL', '30 seconds')
        self._model_client_factory = model_client_factory or build_client

    @classmethod
    def from_env(cls) -> Worker:
        return cls(load_database_url())

    def check_connection(self) -> None:
        import psycopg

        with psycopg.connect(self.database_url) as connection:
            connection.execute('SET statement_timeout = 15000')
            connection.execute('SELECT 1').fetchone()

    def poll_once(self) -> bool:
        import psycopg

        with psycopg.connect(self.database_url) as connection:
            connection.execute('SET statement_timeout = 15000')
            claimed = connection.execute(CLAIM_SQL, (self.lock_for, self.worker_id)).fetchone()
            if not claimed:
                connection.commit()
                log.debug('poll finished worker_id=%s outcome=idle', self.worker_id)
                return False
            started_at = time.monotonic()
            run_id, organization_id, status, attempt_count = claimed
            log.info(
                'job claimed worker_id=%s run_id=%s workspace_id=%s status=%s attempt=%s',
                self.worker_id,
                run_id,
                organization_id,
                status,
                attempt_count,
            )
            try:
                sources, evidence_count, has_brief = connection.execute(
                    COUNTS_SQL,
                    (run_id, organization_id, run_id, organization_id, run_id, organization_id),
                ).fetchone()
                stage = next_stage(status, sources, evidence_count, bool(has_brief))
                log.info(
                    'job inspected worker_id=%s run_id=%s workspace_id=%s sources=%s evidence=%s has_brief=%s next_stage=%s',
                    self.worker_id,
                    run_id,
                    organization_id,
                    sources,
                    evidence_count,
                    bool(has_brief),
                    stage or 'none',
                )
                if stage is None:
                    connection.execute(BACKOFF_SQL, (self.backoff_for, run_id, organization_id))
                    connection.commit()
                    elapsed_ms = round((time.monotonic() - started_at) * 1000)
                    log.info(
                        'job cycle finished worker_id=%s run_id=%s workspace_id=%s outcome=deferred reason=no_pending_stage retry_in=%s duration_ms=%s',
                        self.worker_id,
                        run_id,
                        organization_id,
                        self.backoff_for,
                        elapsed_ms,
                    )
                    return True
                if stage == 'evidence':
                    self._run_evidence_stage(connection, run_id, organization_id)
                    connection.execute(BACKOFF_SQL, (self.backoff_for, run_id, organization_id))
                    connection.commit()
                    elapsed_ms = round((time.monotonic() - started_at) * 1000)
                    log.info(
                        'job cycle finished worker_id=%s run_id=%s workspace_id=%s stage=%s outcome=advanced duration_ms=%s',
                        self.worker_id,
                        run_id,
                        organization_id,
                        stage,
                        elapsed_ms,
                    )
                    return True
                # ponytail: the brief model is not in this worker yet; hold the row briefly so the loop does not spin.
                connection.execute(BACKOFF_SQL, (self.backoff_for, run_id, organization_id))
                connection.commit()
                elapsed_ms = round((time.monotonic() - started_at) * 1000)
                log.info(
                    'job cycle finished worker_id=%s run_id=%s workspace_id=%s stage=%s outcome=deferred reason=processor_not_implemented retry_in=%s duration_ms=%s',
                    self.worker_id,
                    run_id,
                    organization_id,
                    stage,
                    self.backoff_for,
                    elapsed_ms,
                )
                return True
            except Exception as error:
                message = str(error)[:1000]
                log.exception(
                    'job failed worker_id=%s run_id=%s workspace_id=%s error=%s',
                    self.worker_id,
                    run_id,
                    organization_id,
                    message,
                )
                # A DB error raised inside the try block (e.g. a constraint violation
                # from the evidence-stage INSERT loop) leaves the connection in an
                # aborted-transaction state. Roll back first, or FAIL_SQL itself raises
                # InFailedSqlTransaction and the run never gets marked failed.
                connection.rollback()
                connection.execute(FAIL_SQL, (message, run_id, organization_id))
                connection.commit()
                return True

    def _run_evidence_stage(self, connection, run_id: str, organization_id: str) -> None:
        source_rows = connection.execute(FETCH_SOURCES_SQL, (run_id, organization_id)).fetchall()
        sources = [
            {
                'id': source_id,
                'url': url,
                'title': title,
                'publisher': publisher,
                'excerpt': excerpt,
                'publishedAt': published_at,
            }
            for source_id, url, title, publisher, excerpt, published_at in source_rows
        ]
        config = ModelGatewayConfig.from_env()
        client = self._model_client_factory(config)
        claims_by_source = []
        for source in sources:
            if _is_blank_excerpt(source['excerpt']):
                log.warning(
                    'evidence extraction skipped for source with no excerpt worker_id=%s run_id=%s workspace_id=%s source_id=%s',
                    self.worker_id,
                    run_id,
                    organization_id,
                    source['id'],
                )
                claims_by_source.append((source['id'], []))
                continue
            try:
                claims = evidence.extract_claims_for_source(client, config, source)
            except StructuredOutputError as error:
                message = str(error)[:1000]
                log.warning(
                    'evidence extraction failed for source worker_id=%s run_id=%s workspace_id=%s source_id=%s error=%s',
                    self.worker_id,
                    run_id,
                    organization_id,
                    source['id'],
                    message,
                )
                claims = []
            claims = _prefer_source_published_at(source, claims)
            claims_by_source.append((source['id'], claims))
        resolvable_source_ids = {source['id'] for source in sources}
        evidence_rows = evidence.assemble_evidence_rows(claims_by_source, resolvable_source_ids)
        if not evidence_rows:
            raise RuntimeError('no evidence claims survived extraction')
        for row in evidence_rows:
            connection.execute(
                INSERT_EVIDENCE_SQL,
                (
                    _generate_evidence_id(),
                    organization_id,
                    run_id,
                    row.source_id,
                    row.claim,
                    row.signal_type,
                    row.confidence,
                    row.observed_at,
                ),
            )
        log.info(
            'evidence stage complete worker_id=%s run_id=%s workspace_id=%s sources=%s evidence_rows=%s',
            self.worker_id,
            run_id,
            organization_id,
            len(sources),
            len(evidence_rows),
        )
