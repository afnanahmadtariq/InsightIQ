from __future__ import annotations

import json
import logging
import os
from typing import Any

from insightiq_worker.graph_brief import build_brief_graph, new_id
from insightiq_worker.graph_evidence import build_evidence_graph
from insightiq_worker.models import RunContext, SourceBundle

log = logging.getLogger('insightiq.worker.stages')

LOAD_RUN_SQL = """
SELECT
  r.id,
  r."organizationId",
  r.goal,
  r."createdById",
  p.name,
  p."companyName",
  o.name,
  o."valueProposition"
FROM research_run r
JOIN prospect p
  ON p.id = r."prospectId" AND p."organizationId" = r."organizationId"
JOIN offer o
  ON o.id = r."offerId" AND o."organizationId" = r."organizationId"
WHERE r.id = %s AND r."organizationId" = %s
"""

LOAD_SOURCES_SQL = """
SELECT id, url, title, excerpt, metadata
FROM evidence_source
WHERE "researchRunId" = %s AND "organizationId" = %s
ORDER BY "retrievedAt" ASC
"""

LOAD_EVIDENCE_SQL = """
SELECT e.id, e.claim, e."signalType", e.confidence, s.url, s.title
FROM evidence e
JOIN evidence_source s
  ON s.id = e."sourceId" AND s."organizationId" = e."organizationId"
WHERE e."researchRunId" = %s AND e."organizationId" = %s
ORDER BY e.confidence DESC, e."createdAt" ASC
"""

INSERT_EVIDENCE_SQL = """
INSERT INTO evidence (
  id, "organizationId", "researchRunId", "sourceId", claim, "signalType", confidence, "createdAt"
) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
"""

INSERT_BRIEF_SQL = """
INSERT INTO deal_brief (
  id, "organizationId", "researchRunId", title, status, sections, "generatedAt", "updatedAt"
) VALUES (%s, %s, %s, %s, 'ready', %s::jsonb, NOW(), NOW())
"""

INSERT_NOTIFICATION_SQL = """
INSERT INTO notification (
  id, "organizationId", "userId", "researchRunId", type, title, body, "createdAt"
) VALUES (%s, %s, %s, %s, 'brief-ready', %s, %s, NOW())
"""

RELEASE_LOCK_SQL = """
UPDATE research_run
SET "lockedAt" = NULL, "lockExpiresAt" = NULL, "workerId" = NULL, "attemptCount" = "attemptCount" + 1
WHERE id = %s AND "organizationId" = %s AND status = 'running'
"""

COMPLETE_RUN_SQL = """
UPDATE research_run
SET
  status = 'completed',
  "completedAt" = NOW(),
  "lockedAt" = NULL,
  "lockExpiresAt" = NULL,
  "workerId" = NULL,
  "attemptCount" = "attemptCount" + 1,
  "errorMessage" = NULL
WHERE id = %s AND "organizationId" = %s AND status = 'running'
"""


def _source_score(metadata: Any) -> float:
    if not isinstance(metadata, dict):
        return 0.0
    matches = metadata.get('matches')
    if not isinstance(matches, list) or not matches:
        return 0.0
    scores = [float(item.get('score', 0)) for item in matches if isinstance(item, dict)]
    return max(scores) if scores else 0.0


def run_context_from_row(row: tuple[Any, ...]) -> RunContext:
    return RunContext(
        run_id=row[0],
        organization_id=row[1],
        goal=row[2],
        created_by_id=row[3],
        prospect_name=row[4],
        company_name=row[5],
        offer_name=row[6],
        value_proposition=row[7],
    )


def process_evidence_stage(connection, run_id: str, organization_id: str) -> int:
    row = connection.execute(LOAD_RUN_SQL, (run_id, organization_id)).fetchone()
    if not row:
        raise RuntimeError('research run not found')
    existing = connection.execute(
        'SELECT COUNT(*)::int FROM evidence WHERE "researchRunId" = %s AND "organizationId" = %s',
        (run_id, organization_id),
    ).fetchone()[0]
    if existing > 0:
        connection.execute(RELEASE_LOCK_SQL, (run_id, organization_id))
        log.info('evidence stage skipped run_id=%s existing_claims=%s', run_id, existing)
        return existing
    context = run_context_from_row(row)
    source_rows = connection.execute(LOAD_SOURCES_SQL, (run_id, organization_id)).fetchall()
    if not source_rows:
        raise RuntimeError('no sources to normalize')

    bundles = [
        SourceBundle(
            source_id=source_id,
            url=url,
            title=title,
            text=(excerpt or '').strip(),
            score=_source_score(metadata),
        )
        for source_id, url, title, excerpt, metadata in source_rows
    ]
    prefer_crawl4ai = os.environ.get('WORKER_USE_CRAWL4AI', '').lower() in {'1', 'true', 'yes'}
    result = build_evidence_graph().invoke(
        {'context': context, 'sources': bundles, 'drafts': [], 'prefer_crawl4ai': prefer_crawl4ai}
    )
    drafts = result['drafts']
    if not drafts:
        raise RuntimeError('evidence normalization produced zero claims')

    inserted = 0
    for draft in drafts:
        connection.execute(
            INSERT_EVIDENCE_SQL,
            (
                new_id(),
                organization_id,
                run_id,
                draft.source_id,
                draft.claim,
                draft.signal_type,
                draft.confidence,
            ),
        )
        inserted += 1
    connection.execute(RELEASE_LOCK_SQL, (run_id, organization_id))
    log.info('evidence stage complete run_id=%s claims=%s', run_id, inserted)
    return inserted


def process_brief_stage(connection, run_id: str, organization_id: str) -> str:
    row = connection.execute(LOAD_RUN_SQL, (run_id, organization_id)).fetchone()
    if not row:
        raise RuntimeError('research run not found')
    existing = connection.execute(
        'SELECT id FROM deal_brief WHERE "researchRunId" = %s AND "organizationId" = %s',
        (run_id, organization_id),
    ).fetchone()
    if existing:
        connection.execute(COMPLETE_RUN_SQL, (run_id, organization_id))
        log.info('brief stage skipped run_id=%s existing_brief_id=%s', run_id, existing[0])
        return str(existing[0])
    context = run_context_from_row(row)
    evidence_rows = connection.execute(LOAD_EVIDENCE_SQL, (run_id, organization_id)).fetchall()
    if not evidence_rows:
        raise RuntimeError('no evidence to synthesize')

    stored = [
        {
            'id': evidence_id,
            'claim': claim,
            'signal_type': signal_type,
            'confidence': confidence,
            'source_url': source_url,
            'source_title': source_title,
        }
        for evidence_id, claim, signal_type, confidence, source_url, source_title in evidence_rows
    ]
    result = build_brief_graph().invoke({'context': context, 'evidence': stored, 'sections': None, 'error': None})
    if result.get('error'):
        raise RuntimeError(str(result['error']))
    sections = result['sections']
    if sections is None:
        raise RuntimeError('brief synthesis returned no sections')

    brief_id = new_id()
    title = f"Deal brief · {context.prospect_name}"
    connection.execute(
        INSERT_BRIEF_SQL,
        (brief_id, organization_id, run_id, title, json.dumps(sections.model_dump())),
    )
    if context.created_by_id:
        connection.execute(
            INSERT_NOTIFICATION_SQL,
            (
                new_id(),
                organization_id,
                context.created_by_id,
                run_id,
                f'Brief ready for {context.prospect_name}',
                f'{len(stored)} cited claim(s) are ready to review.',
            ),
        )
    connection.execute(COMPLETE_RUN_SQL, (run_id, organization_id))
    log.info('brief stage complete run_id=%s brief_id=%s', run_id, brief_id)
    return brief_id
