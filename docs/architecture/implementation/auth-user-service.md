# Auth & User Management Service (Node.js)

Status: planning · Part of [Implementation Plans](./README.md)

## Responsibilities

- Authenticate users (email/password to start; social login is a stretch goal, not MVP).
- Own `Workspace`, `User`, and `Membership` (owner/member role) per the
  [domain model](../domain-model.md).
- Serve as the **public API gateway** the `init` branch frontend calls — it is the only backend
  service exposed to the internet through Nginx; Billing is called internally, OSINT/AI services are
  reached only via Kafka.
- Accept `ResearchRequest`s, create the corresponding `ResearchRun` row, reserve a credit via the
  Billing Service, and publish `research.run.requested` to Kafka.
- Consume `research.brief.ready` / `research.run.failed` to update `ResearchRun.status` so the
  frontend's polling picks up completion.

## Interfaces

### REST API (public, behind Nginx)

| Method & path | Purpose |
| --- | --- |
| `POST /auth/signup` | Create a user + first workspace. |
| `POST /auth/login` | Issue a session (JWT, httpOnly cookie). |
| `POST /auth/logout` | Invalidate the session. |
| `GET /me` | Current user + workspace summary (credits, plan — proxied from Billing). |
| `POST /workspaces/:id/members` | Invite/add a member (owner only). |
| `POST /research-runs` | Create a `ResearchRequest`, reserve a credit, enqueue the run. |
| `GET /research-runs` | List runs for the workspace (mirrors `data/runs.ts` on `init` today). |
| `GET /research-runs/:id` | Run detail + Deal Brief once ready (mirrors `data/briefs.ts`). |
| `GET /accounts` | Accounts/prospects grouped view (mirrors the `init` branch's Accounts page). |

These paths are chosen to match the `init` branch's dummy-data shape as closely as possible so
swapping fixtures for live fetches (the Sept 3 milestone) is close to a drop-in replacement.

### Kafka

- **Produces** `research.run.requested` — `{ runId, workspaceId, requesterId, identifiers, offer,
  depth }` — after the row is persisted and the credit reservation succeeds.
- **Consumes** `research.brief.ready` and `research.run.failed` — updates `ResearchRun.status` and
  `completedAt`. Consumer group: `auth-service`.

## Data owned

`workspaces`, `users`, `memberships`, `research_requests`, `research_runs` (status/lifecycle
columns only — the brief content itself is owned by the AI & Synthesis Service, referenced by
`briefId`).

## Tech stack

- Node.js 24, TypeScript, Express (chosen over NestJS/Fastify for hackathon build speed and a
  smaller learning curve across the team) with `zod` for request validation.
- `jsonwebtoken` + `bcrypt` for auth; `pg`/Drizzle ORM (per ADR 0005) for Postgres access, sharing
  the `packages/db` workspace package's connection setup.
- `kafkajs` for the Kafka producer/consumer.
- Reuses `packages/db` and, where useful, `packages/contracts` (DTOs shared with the frontend) —
  both already exist in the repository's package boundaries.

## Local development

Runs as the `api` (or a renamed `auth-service`) entry in `docker-compose.yml`; connects to the
`postgres` and `kafka` compose services. `npm run dev --workspace=@insightiq/api` for local
iteration without Docker, pointed at a local Postgres/Kafka via `.env`.

## Build order

1. **Aug 28–29:** signup/login/session issuance; `workspaces`/`memberships` tables migrated.
2. **Aug 30–31:** `POST /research-runs` end to end against a stub Billing call and a real Kafka
   publish; `GET /research-runs` reading real rows (status stuck at `queued` until OSINT/AI land).
3. **Sept 1–2:** consume `research.brief.ready`/`research.run.failed`; `GET /research-runs/:id`
   returns the real Deal Brief payload.
4. **Sept 3:** frontend (`init`) points at this service instead of `data/*.ts` fixtures.

## Testing plan

- Unit tests for request validation and JWT issuance/verification.
- Integration test for `POST /research-runs` → Kafka publish, using a Testcontainers Kafka broker
  or an in-memory Kafka mock — decide based on remaining time budget; an in-memory mock is the
  fallback if Testcontainers setup risks the Aug 30–31 window.
- Contract test asserting `GET /research-runs` response shape matches the `ResearchRun` TypeScript
  type already defined in `apps/web/data/runs.ts` on `init`, so the frontend swap in step 4 doesn't
  silently break.

## Open risks

- Session strategy (JWT vs. server session in Redis) isn't finalized; JWT is simpler to ship by
  Aug 29 but harder to revoke — acceptable for a hackathon demo, flagged for post-hackathon review.
- Whether workspace invites need real email delivery, or a copyable invite link suffices for the
  demo (link is the fallback if there's no time for transactional email).
