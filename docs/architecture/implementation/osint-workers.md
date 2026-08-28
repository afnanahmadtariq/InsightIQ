# OSINT Worker Nodes (Go)

Status: planning · Part of [Implementation Plans](./README.md)

## Responsibilities

- Consume `research.run.requested`, resolve the prospect/account identity per
  [ADR 0003](../decisions/0003-flexible-intake-and-progressive-resolution.md) (deterministic
  normalization first, then candidate matching), and fan out to source connectors in parallel.
- Run each connector as a bounded-concurrency task, respecting the source's rate limit and
  [source policy](../decisions/0004-differentiation-through-derived-osint.md) (public/licensed
  sources only, no logged-in scraping in this build).
- Persist raw `SourceDocument`s and extracted `Evidence` with provenance (source URL, retrieval
  timestamp) — never a `Fact`/`Signal`, which are the AI & Synthesis Service's job.
- Emit progress per connector and a single "all connectors for this run are done" completion event
  that hands off to the Python service.

## Interfaces

### Kafka

- **Consumes** `research.run.requested` — `{ runId, workspaceId, identifiers, offer, depth }`.
  Consumer group: `osint-workers` (scales horizontally by adding pod/process replicas in the same
  group — Kafka partitions the work across them automatically).
- **Produces**
  - `research.evidence.collected` (one per finished connector task) — `{ runId, connector, sourceDocumentIds, evidenceIds, status }`, mainly for observability/debugging.
  - `research.osint.completed` (one per run, once every connector task has finished or been marked
    failed/skipped) — `{ runId, workspaceId, evidenceIds, failedConnectors }`. This is the trigger
    the AI & Synthesis Service waits for.
  - `research.run.failed` — if identity resolution fails outright (no usable candidate above the
    confidence threshold) or every connector fails.

### No public API

OSINT workers have no HTTP surface exposed anywhere, public or internal — Kafka is their only
input/output. A `/healthz` endpoint exists only for container orchestration liveness checks.

## Connector scope (MVP → stretch)

| Connector | Priority | Notes |
| --- | --- | --- |
| Company website | MVP (Aug 30–31) | About/team/press pages; simplest ToS story. |
| Public job listings | MVP (Aug 30–31) | Hiring-surge signal source, matches the seeded Deal Brief example on `init`. |
| News / search coverage | Stretch (Sept 1–2 if time allows) | Needs a licensed search API — evaluate options against the source-policy rule before wiring it in. |
| Public social profile (LinkedIn/X post text the user already supplied a URL for) | Stretch | Only the URL/profile the user explicitly supplied — no discovery scraping of profiles the user didn't name. |

Each connector is its own Go package behind a shared `Connector` interface (`Fetch(ctx, task)
([]Evidence, error)`) so adding one doesn't touch the orchestration/idempotency code.

## Data owned

`source_documents`, `evidence`, plus `research_tasks` (one row per `(runId, connector)` pair,
carrying status and the idempotency key described below).

## Concurrency & idempotency model

- A worker pulls a `research.run.requested` message, writes one `research_tasks` row per applicable
  connector (`status = pending`), then launches each as a goroutine behind a per-source-type
  semaphore (bounded concurrency so one run can't monopolize a shared rate limit).
- Idempotency key: `(runId, connector, connectorVersion)`. Before starting a task the worker checks
  for an existing `research_tasks` row with that key already `completed` — if found, it skips
  redoing the work (handles Kafka's at-least-once redelivery without double-scraping).
- Retries: exponential backoff, max 3 attempts per connector task, then mark `failed` and continue —
  one failed connector doesn't block the run; `research.osint.completed` reports which connectors
  failed so the AI service (and eventually the UI) can be honest about gaps, per the "surface
  contradictions and missing evidence instead of guessing" principle in the architecture overview.
- Dead-letter topic `research.osint.dlq` receives the original message plus the failure reason for
  anything that exhausts retries, for manual inspection.

## Tech stack

- Go 1.23+, `segmentio/kafka-go` (simpler dependency footprint than the Confluent client, no cgo,
  good fit for a short build window) for the consumer/producer.
- `net/http` + `goquery` for HTML parsing; `golang.org/x/time/rate` for per-source rate limiting.
- `pgx` for Postgres writes (Go doesn't use Drizzle — that's the Node/TS ORM; Go talks to the same
  schema via generated SQL or hand-written queries, kept in sync with the Drizzle-owned migrations).

## Local development

New `osint-worker` service in `docker-compose.yml`, depending on `kafka` and `postgres`. Runnable
standalone with `go run ./cmd/worker` against `docker compose up postgres kafka` for fast iteration
without rebuilding the container each time.

## Build order

1. **Aug 28–29:** Kafka consumer/producer skeleton; `research_tasks` table; health check.
2. **Aug 30–31:** Company-website + job-listings connectors; identity resolution v1 (deterministic
   normalization only, candidate scoring deferred); full
   `research.run.requested → research.osint.completed` round trip working locally.
3. **Sept 1–2:** Add whichever stretch connector(s) time allows; tune rate limits against real
   target sites without tripping their bot defenses.

## Testing plan

- Unit tests per connector against recorded HTML fixtures (no live network calls in CI).
- An idempotency test: publish the same `research.run.requested` message twice, assert only one set
  of `evidence` rows exists.
- A "partial failure" test: force one connector to fail, assert `research.osint.completed` still
  fires with the successful connectors' evidence and a non-empty `failedConnectors` list.

## Open risks

- Identity-resolution confidence scoring (ADR 0003's "ask the user to disambiguate" path) has no UI
  hook yet on `init` — for this build, low-confidence runs proceed with the best candidate and the
  Deal Brief states the uncertainty, rather than blocking on a disambiguation screen.
- Source ToS/robots.txt compliance needs a real per-connector review before the demo goes live
  publicly, not just before code review.
