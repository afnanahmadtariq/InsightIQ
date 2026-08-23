# InsightIQ Architecture

Status: discovery

InsightIQ is planned as a workflow-focused sales intelligence product. A user supplies a prospect or account, InsightIQ gathers permitted public and connected-source evidence, turns that evidence into cited signals, and produces an actionable brief and outreach suggestions.

## Architecture principles

1. Evidence before inference: every material claim must retain source, retrieval time, and confidence.
2. Research is asynchronous: the API accepts work; workers gather, normalize, analyze, and assemble results.
3. Human review before external action: the first release drafts outreach but does not send it automatically.
4. Provider independence: source connectors and AI models sit behind internal interfaces.
5. Tenant isolation and auditability are foundational, not later add-ons.
6. Start as a modular monolith plus worker processes; split services only when scaling or ownership proves the need.

## Proposed system shape

```text
Next.js web app
      |
      v
NestJS API ---- PostgreSQL
      |             |
      v             v
 Durable queue   source evidence / normalized facts / reports
      |
      v
Research workers
  |-- company and person resolution
  |-- source connectors
  |-- extraction and normalization
  |-- signal detection
  |-- AI synthesis with citations
  `-- brief and outreach generation

Object storage: raw documents and large artifacts
Observability: traces, structured logs, job metrics, model/provider cost
```

## Proposed repository boundaries

```text
apps/
  web/                 customer-facing Next.js application
  api/                 synchronous NestJS API and webhook receiver
  worker/              asynchronous research pipeline consumers
packages/
  db/                  Prisma schema, migrations, and database client
  contracts/           API events, DTOs, and validation schemas
  domain/              source-independent business rules
  connectors/          normalized interfaces and provider implementations
  ai/                  prompts, model gateway, structured outputs, evaluations
  observability/       logging, tracing, metrics, and cost attribution
```

Each deployable remains under `apps/`; reusable code has one purpose per package under `packages/`. Package scripts own their work and the root delegates orchestration to `turbo run`.

## Main runtime flow

1. A user creates or imports a prospect and requests research.
2. The API creates an immutable research run and enqueues it idempotently.
3. Workers resolve the person and company, then execute permitted connectors in parallel.
4. Raw evidence is stored with provenance; normalized facts and time-bound signals are derived from it.
5. The synthesis stage produces claims only from captured evidence and attaches citations and confidence.
6. A meeting brief, talking points, likely objections, and outreach draft are versioned as report artifacts.
7. The user reviews, edits, exports, or reruns stale sections.

## MVP slice (proposed)

- One initial customer profile: B2B SaaS account executives preparing for meetings.
- One input path: prospect name, company, company URL, and optional LinkedIn URL.
- Sources: company website, allowed news/search results, public job listings, and a technology-data provider.
- Output: cited one-page meeting brief plus an editable outreach draft.
- Workspace roles: owner and member.
- Usage: metered research runs with per-workspace limits.
- No autonomous sending, browser scraping behind logins, CRM write-back, or custom agent workflows in the first release.

## Decisions still being grilled

See [discovery-questions.md](./discovery-questions.md). Proposed architectural decisions are tracked in [decisions](./decisions/), and shared language is tracked in [glossary.md](./glossary.md).

