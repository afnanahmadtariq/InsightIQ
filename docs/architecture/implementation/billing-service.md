# Pricing & Billing Service (Node.js)

Status: planning · Part of [Implementation Plans](./README.md)

## Responsibilities

- Own the research credit ledger: reserve a credit when a run starts, consume it on success,
  release it on failure, and support manual adjustments.
- Enforce plan/tier limits (Solo 40, Pro 150, Team 400 credits/month, per the
  [architecture overview](../README.md#recommended-experience-and-economics)).
- Track Qoder Enterprise Plan integration state for the workspace (a flag/record for now — the
  actual Qoder Enterprise onboarding is outside this hackathon's scope).
- Serve the invoice-history view the `init` branch's `/dashboard/billing` page currently renders
  from `data/usage.ts`.

This is an **internal service** — it is not exposed through Nginx. The Auth & User Management
Service is its only caller, over a private network call (plain HTTP+JSON is enough at this scale;
gRPC is not worth the setup cost this week).

## Interfaces

### Internal HTTP API (called by the Auth & User Management Service only)

| Method & path | Purpose |
| --- | --- |
| `POST /internal/credits/reserve` | `{ workspaceId, runId, amount }` → reserve `amount` credits for a run; 402-style error if insufficient balance. |
| `POST /internal/credits/consume` | `{ workspaceId, runId }` → convert a reservation into a spend on success. |
| `POST /internal/credits/release` | `{ workspaceId, runId }` → return a reservation to the balance on failure/cancellation. |
| `GET /internal/workspaces/:id/credits` | Current balance, monthly allowance, renewal date — what `GET /me` on the Auth service proxies. |
| `GET /internal/workspaces/:id/invoices` | Invoice history for the Billing dashboard page. |

### Kafka

- **Consumes** `research.run.failed` — releases the reservation for that `runId` if the Auth
  service's own call didn't already do so (belt-and-suspenders; whichever happens first wins,
  guarded by the idempotency key below).
- Does **not** consume `research.brief.ready` directly — credit consumption on success is driven by
  the synchronous `POST /internal/credits/consume` call from the Auth service, since that path
  already knows the run succeeded and keeps the ledger's "spent" transition explicit and testable
  rather than inferred from an event race.

## Data owned

`usage_ledger_entries` (append-only: reserved / consumed / released / adjusted, each row carrying
`runId` as its idempotency key so a duplicate reserve/consume/release call is a no-op, not a double
charge), plus the plan/allowance columns on `workspaces` (co-owned with Auth for the plan *name*,
but the credit *balance* arithmetic lives here).

## Tech stack

- Node.js 24, TypeScript, Express — deliberately the same stack as the Auth service so the two can
  share `packages/db` and a common HTTP client/middleware setup, minimizing the amount of new
  tooling the team has to learn under time pressure.
- Drizzle ORM for the ledger table; a single `SERIALIZABLE`-isolation transaction (or a Postgres
  advisory lock keyed by `workspaceId`) around reserve/consume to avoid a race where two concurrent
  runs both pass a balance check that only one of them should.

## Local development

A second `docker-compose.yml` entry (`billing-service`), same Postgres instance as Auth, no Kafka
consumer required until the `research.run.failed` safety-net listener is built.

## Build order

1. **Aug 28–29:** `usage_ledger_entries` table; `reserve`/`consume`/`release` endpoints with the
   concurrency-safe balance check, unit-tested in isolation from Kafka.
2. **Aug 30–31:** Auth service wires `POST /research-runs` to call `reserve` for real.
3. **Sept 1–2:** `consume` wired to the real run-completion path; `research.run.failed` consumer
   added as the safety net.
4. **Sept 3:** `GET /internal/workspaces/:id/invoices` backs the `/dashboard/billing` page, replacing
   `data/usage.ts`'s seeded invoices.

## Testing plan

- Unit tests for the reserve/consume/release state machine, including the "insufficient balance"
  and "double consume is a no-op" cases explicitly (these are the bugs most likely to demo badly).
- A small load test (a handful of concurrent `reserve` calls against one workspace) to confirm the
  balance check doesn't race — cheap insurance given credits are a customer-facing number.

## Open risks

- Whether plan changes mid-cycle (upgrade/downgrade) need proration logic for the hackathon demo —
  current plan is **no**, plan changes just take effect next cycle, to keep scope small.
- Real Qoder Enterprise Plan billing integration is out of scope for the build window; only a
  workspace-level flag is modeled.
