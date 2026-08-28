# Implementation Plans

Status: planning — companion to [ADR 0005](../decisions/0005-event-driven-microservices-pivot.md)

ADR 0005 records *what* was decided (event-driven microservices: Node.js Auth + Billing, Go OSINT
workers, Python AI & Synthesis, Kafka, Nginx, Postgres/Drizzle, Redis). These documents record *how*
each piece gets built: responsibilities, interfaces, data ownership, libraries, local dev setup, and
the build order mapped onto the [delivery plan](../../submission/hackathon-submission.md#delivery-plan-to-the-close-of-the-build-phase).

| Component | Plan |
| --- | --- |
| Auth & User Management Service (Node.js) | [auth-user-service.md](./auth-user-service.md) |
| Pricing & Billing Service (Node.js) | [billing-service.md](./billing-service.md) |
| OSINT Worker Nodes (Go) | [osint-workers.md](./osint-workers.md) |
| AI & Synthesis Service (Python) | [ai-synthesis-service.md](./ai-synthesis-service.md) |
| Kafka (messaging backbone) | [kafka-messaging.md](./kafka-messaging.md) |
| Nginx (load balancer / reverse proxy) | [nginx-load-balancer.md](./nginx-load-balancer.md) |

## Shared conventions across services

- **Event envelope.** Every Kafka message uses the same JSON envelope so any consumer can log,
  route, and dead-letter uniformly:

  ```json
  {
    "eventId": "uuid",
    "eventType": "research.run.requested",
    "occurredAt": "2026-08-30T09:04:00Z",
    "version": 1,
    "workspaceId": "uuid",
    "runId": "uuid",
    "payload": { "...": "event-specific fields" }
  }
  ```

  JSON (not Avro/Protobuf) on purpose — no schema registry to stand up under hackathon time
  pressure. `version` lets a consumer reject or branch on an envelope shape it doesn't understand
  yet, which is the cheap substitute for a registry.

- **Idempotency.** Per [domain-model.md](../domain-model.md) invariant 4, every consumer treats
  `(runId, stage, connectorVersion)` — or just `(runId, stage)` where there's one implementation —
  as an idempotency key. Reprocessing the same message (at-least-once delivery) must not double-bill
  credits or duplicate Evidence rows; each service's plan below says what that key is concretely.

- **One Postgres, service-owned tables.** For hackathon scope there is one PostgreSQL instance
  (`docker-compose.yml`'s `postgres` service), not one database per microservice. Each service only
  reads/writes the tables it owns per the [domain model](../domain-model.md); cross-service reads go
  through Kafka events or a narrow internal HTTP call, never a direct foreign read of another
  service's tables. This is a deliberate shortcut (a real deployment would split databases) — call
  it out in the demo if asked "is this a true microservices architecture."

- **Local dev.** `docker-compose.yml` gains `kafka`, `redis`, `osint-worker`, `ai-synthesis`, and
  `web` services alongside the existing `postgres`, `api` (renamed/split into `auth-service` and
  `billing-service`), and `nginx`. That compose file change is product/deployment work and belongs
  on `init`/`main`, not on this `docs` branch — see the
  [worktree and branch guide](../../WORKTREE-AND-BRANCH-GUIDE.md).

## Build order

This follows the submission's delivery plan, service by service:

1. **Aug 28–29 — Foundation.** Postgres schema for Tenants/Evidence/Runs; Kafka and Nginx running in
   Docker Compose; empty service skeletons that can produce/consume a health-check event.
2. **Aug 30–31 — Intake & Go OSINT workers.** Auth & User Management Service reaches
   [auth-user-service.md](./auth-user-service.md)'s MVP endpoints; OSINT Worker Nodes reach
   [osint-workers.md](./osint-workers.md)'s single-connector MVP (company website only), proving the
   `research.run.requested → research.osint.completed` round trip end to end.
3. **Sept 1–2 — Python AI synthesis.** AI & Synthesis Service consumes `research.osint.completed`
   and produces a real, cited Deal Brief per [ai-synthesis-service.md](./ai-synthesis-service.md).
   Billing Service's credit reservation/consumption wires in alongside it.
4. **Sept 3 — Frontend & end-to-end flow.** The `init` branch's dashboard (currently on seeded data)
   swaps its fixtures for live calls to the Auth & User Management Service's API.
5. **Sept 4 — Polish & submission.** Load-test the Kafka path with the seeded demo personas'
   accounts, fix whatever breaks, record the demo.

Each per-service plan below repeats the relevant slice of this timeline in its own "Build order"
section so it can be read standalone.
