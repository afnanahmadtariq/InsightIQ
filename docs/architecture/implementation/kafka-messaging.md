# Kafka (Messaging Backbone)

Status: planning · Part of [Implementation Plans](./README.md)

## Purpose

Kafka is what [ADR 0005](../decisions/0005-event-driven-microservices-pivot.md) uses to replace
ADR 0001's "undecided durable queue": it decouples the synchronous Node.js services (Auth, Billing)
from the long-running, failure-prone Go/Python workloads (OSINT workers, AI synthesis), so a slow or
failed downstream stage never blocks or drops a user-facing API request.

## Topics

| Topic | Producer | Consumer(s) | Payload (see [shared envelope](./README.md#shared-conventions-across-services)) |
| --- | --- | --- | --- |
| `research.run.requested` | Auth & User Service | OSINT Worker Nodes | `{ runId, workspaceId, requesterId, identifiers, offer, depth }` |
| `research.evidence.collected` | OSINT Worker Nodes | (observability only, no service consumes it for logic yet) | `{ runId, connector, sourceDocumentIds, evidenceIds, status }` |
| `research.osint.completed` | OSINT Worker Nodes | AI & Synthesis Service | `{ runId, workspaceId, evidenceIds, failedConnectors }` |
| `research.brief.ready` | AI & Synthesis Service | Auth & User Service | `{ runId, workspaceId, briefId }` |
| `research.run.failed` | Auth Service, OSINT Workers, AI Service (any stage) | Auth & User Service, Billing Service | `{ runId, workspaceId, reason, failedStage }` |
| `research.osint.dlq` | OSINT Worker Nodes | (manual inspection only) | original message + failure reason |

## Partitioning & ordering

Every topic is partitioned by `runId` (or `workspaceId` where a topic has no `runId`, like a future
`credits.*` topic if one is added). This guarantees all events for one research run land on the same
partition and are processed in order by one consumer instance, while still letting Kafka spread
*different* runs across partitions and consumer-group instances for parallelism. Start with 6
partitions per topic — comfortably more than the hackathon's expected concurrent-run volume, cheap
to over-provision up front since partition count is awkward to change later.

## Consumer groups

One consumer group per service, so scaling a service (more replicas) automatically shares its topic
partitions, and one service being down doesn't block another's consumption:

- `osint-workers` (Go) — consumes `research.run.requested`.
- `ai-synthesis` (Python) — consumes `research.osint.completed`.
- `auth-service` (Node.js) — consumes `research.brief.ready`, `research.run.failed`.
- `billing-service` (Node.js) — consumes `research.run.failed`.

## Delivery guarantees & idempotency

Kafka here is configured for **at-least-once** delivery (not exactly-once transactions — the setup
cost isn't justified for a hackathon timeline). Every consumer is therefore responsible for its own
idempotency, as detailed in each service's plan:

- OSINT workers key on `(runId, connector, connectorVersion)`.
- Billing keys on `runId` per ledger operation.
- Auth service's status updates are naturally idempotent (setting `status = completed` twice is a
  no-op).

## Local development

- **Broker:** Kafka in **KRaft mode** (no separate Zookeeper container) — one broker is enough for
  local dev and even for the initial production deployment; this is explicitly not a
  highly-available multi-broker cluster for the hackathon.
- **Compose service:** `kafka` in `docker-compose.yml`, using the `apache/kafka` (or
  `bitnami/kafka`) image, with a `kafka-init` one-shot container (or an app-level "ensure topics
  exist on boot" call) to create the topics above with 6 partitions each on first startup.
- **No schema registry.** JSON envelopes, versioned by the `version` field — see the shared
  conventions doc. Revisit only if a real multi-team API contract problem shows up.
- **Inspection:** `kafka-console-consumer`/`kafka-console-producer` (bundled with the image) or a
  lightweight UI like `redpanda-console` (optional, added only if debugging via CLI proves painful).

## Build order

1. **Aug 28–29:** Single-broker Kafka running in Docker Compose; topics created on boot; a trivial
   producer/consumer smoke test (publish a `ping` message, confirm a stub consumer logs it) proves
   the wiring before any service depends on it.
2. **Aug 30–31:** Real `research.run.requested` → `research.osint.completed` traffic once Auth and
   OSINT Worker Nodes are ready.
3. **Sept 1–2:** `research.brief.ready`/`research.run.failed` traffic once AI Synthesis and Billing
   are consuming.

## Testing plan

- Each service's own tests (see its plan) cover its producer/consumer logic in isolation, typically
  against an in-memory fake or a short-lived Testcontainers Kafka broker — Kafka itself isn't
  "tested" independently beyond the boot-time smoke test above.
- A manual end-to-end check before the Sept 4 demo: submit one real research run through the UI and
  watch it traverse every topic via the console consumer, confirming the full chain works together,
  not just each service's unit tests.

## Open risks

- No dead-letter handling exists yet for stages other than OSINT workers (`research.osint.dlq`) —
  decide before Sept 4 whether Auth/Billing/AI failures need their own DLQ topics or whether
  `research.run.failed` is a sufficient signal for this build's scope.
- Single-broker Kafka has no failover; acceptable for a hackathon demo, explicitly flagged as not
  production-hardened if this goes further.
