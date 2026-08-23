# InsightIQ Architecture

Status: discovery — product direction confirmed, workflow under validation

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

## MVP slice (recommended)

- Primary user: B2B SaaS account executives preparing for prospect conversations; agency SDRs are the adjacent segment.
- Primary job: turn whatever identifiers the user has into a cited deal-preparation brief. Outreach drafting is a downstream artifact, not the product's organizing object.
- Flexible intake: accept a person name, work email, company name/domain, public profile URL, CRM record, calendar event, or any useful combination. A resolution stage determines what is known, ambiguous, or missing.
- Sources: company website, allowed news/search results, public job listings, and a technology-data provider.
- Output: cited one-page meeting brief plus an editable outreach draft.
- Citations are always recorded and available, but collapsed by default in the main reading experience.
- Workspace roles: owner and member.
- Usage: metered research runs with per-workspace limits.
- No autonomous sending, browser scraping behind logins, CRM write-back, or custom agent workflows in the first release.

## Intelligence advantage

InsightIQ should not compete on possession of a larger contact database. Its advantage is the transformation of individually ordinary evidence into timely, workflow-specific intelligence:

- Compare current and historical pages or provider snapshots to detect change.
- Combine hiring composition, leadership changes, expansion news, technology changes, reviews, and public messaging.
- Separate observed facts from inferred implications.
- Explain why each signal matters to the user's offer and meeting objective.
- Surface contradictions, ambiguity, freshness, and missing evidence instead of silently guessing.

This remains public or properly licensed OSINT. Differentiation comes from triangulation, history, and reasoning—not bypassing authentication or source restrictions.

## Recommended experience and economics

- Show the first useful facts within 30–60 seconds.
- Complete a standard brief in 2–5 minutes and a deep refresh in 5–10 minutes.
- Target a blended direct cost no higher than $0.35 per standard brief at meaningful volume; enforce a temporary MVP hard cap of $0.75.
- Meter research credits rather than individual provider calls. A standard brief costs one credit; an expensive deep refresh costs three.
- Initial pricing hypothesis: Solo $49/month for 40 credits, Pro $129/month for 150 credits, and Team $299/month for 400 credits and three seats.

These values are hypotheses to validate with usage and willingness-to-pay interviews. Provider lookup budgets must be decided before each run, not discovered after an uncontrolled agent loop.

## Decisions still being grilled

See [discovery-questions.md](./discovery-questions.md). Proposed architectural decisions are tracked in [decisions](./decisions/), and shared language is tracked in [glossary.md](./glossary.md).
