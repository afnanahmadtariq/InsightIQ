from __future__ import annotations

import logging
import os
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from uuid import uuid4

from insightiq_worker.pipeline import BACKOFF_SQL, CLAIM_SQL, COUNTS_SQL, FAIL_SQL, next_stage

log = logging.getLogger('insightiq.worker')


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
    def __init__(self, database_url: str, worker_id: str | None = None):
        self.database_url = database_url
        self.worker_id = worker_id or uuid4().hex[:12]
        self.lock_for = os.environ.get('WORKER_LOCK_INTERVAL', '10 minutes')
        self.backoff_for = os.environ.get('WORKER_BACKOFF_INTERVAL', '30 seconds')

    @classmethod
    def from_env(cls) -> Worker:
        return cls(load_database_url())

    def poll_once(self) -> bool:
        import psycopg

        with psycopg.connect(self.database_url) as connection:
            connection.execute('SET statement_timeout = 15000')
            claimed = connection.execute(CLAIM_SQL, (self.lock_for, self.worker_id)).fetchone()
            if not claimed:
                connection.commit()
                return False
            run_id, organization_id, status, _attempt_count = claimed
            try:
                sources, evidence, has_brief = connection.execute(
                    COUNTS_SQL,
                    (run_id, organization_id, run_id, organization_id, run_id, organization_id),
                ).fetchone()
                stage = next_stage(status, sources, evidence, bool(has_brief))
                if stage is None:
                    connection.execute(BACKOFF_SQL, (self.backoff_for, run_id, organization_id))
                    connection.commit()
                    return True
                # ponytail: evidence/brief models are not in this worker yet; hold the row briefly so the loop does not spin.
                log.info('deferred %s for run %s in workspace %s', stage, run_id, organization_id)
                connection.execute(BACKOFF_SQL, (self.backoff_for, run_id, organization_id))
                connection.commit()
                return True
            except Exception as error:
                message = str(error)[:1000]
                log.exception('worker failed on run %s', run_id)
                connection.execute(FAIL_SQL, (message, run_id, organization_id))
                connection.commit()
                return True
