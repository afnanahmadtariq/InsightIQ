# InsightIQ Documentation

This is the consolidated documentation index for InsightIQ. The source documents remain in their original locations; this file brings them together in a consistent reading order.

## Contents

1. [Worktree and Branch Guide](#1-worktree-and-branch-guide)
2. [Architecture Overview](#2-architecture-overview)
3. [Architecture Discovery Questions](#3-architecture-discovery-questions)
4. [Domain Model](#4-domain-model)
5. [Glossary](#5-glossary)
6. [ADR 0001: Modular Monolith and Workers](#6-adr-0001-modular-monolith-and-workers)
7. [ADR 0002: Evidence-First Intelligence](#7-adr-0002-evidence-first-intelligence)
8. [ADR 0003: Flexible Intake and Progressive Resolution](#8-adr-0003-flexible-intake-and-progressive-resolution)
9. [ADR 0004: Derived OSINT Differentiation](#9-adr-0004-derived-osint-differentiation)
10. [ADR 0005: Event-Driven Microservices Pivot](#10-adr-0005-event-driven-microservices-pivot)
11. [Hackathon Submission](#11-hackathon-submission)
12. [Implementation Plans](#12-implementation-plans)

---

## 1. Worktree and Branch Guide

_Source: [WORKTREE-AND-BRANCH-GUIDE.md](./WORKTREE-AND-BRANCH-GUIDE.md)_

### InsightIQ branch and worktree guide

This repository keeps internal working instructions separate from product
code and other user-facing content. The `docs` branch is the dedicated home
for internal documents.

### Required repository layout

Maintain these two sibling worktrees:

| Purpose | Path | Branch |
| --- | --- | --- |
| Main project checkout | `/path/to/InsightIQ` | `main` |
| Internal documentation checkout | `/path/to/InsightIQ-docs` | `docs` |

The exact parent directory may differ on another machine, but the two
worktrees must remain separate and the branch-to-purpose mapping must not
change.

### Branch isolation rules

1. Only internal project documentation and documentation-specific maintenance
   may be changed on `docs`.
2. Do not merge, rebase, cherry-pick, or otherwise bring commits from `docs`
   into `main` or any other branch.
3. Do not merge, rebase, cherry-pick, or otherwise bring commits from `main`
   or another branch into `docs`.
4. The `main` branch must not contain internal operating instructions. Keep it
   limited to user-facing product content and project implementation.
5. Do not make code, deployment, dependency, schema, configuration, or other
   product changes in the `docs` worktree.
6. Do not make internal-only documentation changes in the `main` worktree.
7. Before editing, confirm both the current path and branch. If either does
   not match the intended purpose, stop and correct the checkout first.

These are intentionally separate histories of work, not a workflow where one
branch is periodically synchronized with the other. The `docs` branch may be
published to the public repository as a separate branch, but its commits must
remain on that branch.

### Where to work

For application work, use the main checkout:

```bash
cd /path/to/InsightIQ
git switch main
```

For internal documentation work, use the documents checkout:

```bash
cd /path/to/InsightIQ-docs
git switch docs
```

Useful checks:

```bash
pwd
git branch --show-current
git status --short --branch
git worktree list
```

### Creating the layout on a new machine

Starting from the main clone, create the sibling documents worktree with:

```bash
cd /path/to/InsightIQ
git switch main
git worktree add ../InsightIQ-docs docs
```

If Git reports that `docs` is already checked out, another worktree owns the
branch. Use `git worktree list` to find it; do not force a second checkout.

### Commit and review expectations

Commit documentation changes from the `docs` worktree and push them to the
`docs` branch only:

```bash
cd /path/to/InsightIQ-docs
git add docs/
git commit -m "docs: update internal guidance"
git push origin docs
```

Reviewers and agents should inspect the branch and worktree before making any
change. If a task asks for both product changes and internal documentation,
perform them as separate changes in their respective worktrees. Do not use a
merge or cherry-pick to combine them; keep the commits and branches isolated.

### Recovery if the layout is wrong

If the main checkout is accidentally on `docs`, and it is clean, switch it
back to `main` and ensure the sibling worktree owns `docs`:

```bash
cd /path/to/InsightIQ
git status
git switch main
git worktree list
```

If there are uncommitted changes, do not reset or discard them. Stop and get
the owner’s direction before moving or saving them.

---

## 2. Architecture Overview

_Source: [architecture/README.md](./architecture/README.md)_

### InsightIQ Architecture

Status: discovery — product direction confirmed, workflow under validation

> **Stack update (2026-08-28):** the system shape and repository boundaries below describe the
> original modular-monolith discovery proposal (ADR 0001). The hackathon build instead follows an
> event-driven microservices architecture — see [ADR 0005](#10-adr-0005-event-driven-microservices-pivot)
> and the [Hackathon Submission](#11-hackathon-submission) for the current source of truth on
> services, messaging, and infrastructure. The product principles, MVP slice, domain model, and
> evidence-first rules below are unaffected and still apply.

InsightIQ is planned as a workflow-focused sales intelligence product. A user supplies a prospect or account, InsightIQ gathers permitted public and connected-source evidence, turns that evidence into cited signals, and produces an actionable brief and outreach suggestions.

### Architecture principles

1. Evidence before inference: every material claim must retain source, retrieval time, and confidence.
2. Research is asynchronous: the API accepts work; workers gather, normalize, analyze, and assemble results.
3. Human review before external action: the first release drafts outreach but does not send it automatically.
4. Provider independence: source connectors and AI models sit behind internal interfaces.
5. Tenant isolation and auditability are foundational, not later add-ons.
6. Start as a modular monolith plus worker processes; split services only when scaling or ownership proves the need.

### Proposed system shape

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

### Proposed repository boundaries

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

### Main runtime flow

1. A user creates or imports a prospect and requests research.
2. The API creates an immutable research run and enqueues it idempotently.
3. Workers resolve the person and company, then execute permitted connectors in parallel.
4. Raw evidence is stored with provenance; normalized facts and time-bound signals are derived from it.
5. The synthesis stage produces claims only from captured evidence and attaches citations and confidence.
6. A meeting brief, talking points, likely objections, and outreach draft are versioned as report artifacts.
7. The user reviews, edits, exports, or reruns stale sections.

### MVP slice (recommended)

- Primary user: B2B SaaS account executives preparing for prospect conversations; agency SDRs are the adjacent segment.
- Primary job: turn whatever identifiers the user has into a cited deal-preparation brief. Outreach drafting is a downstream artifact, not the product's organizing object.
- Flexible intake: accept a person name, work email, company name/domain, public profile URL, CRM record, calendar event, or any useful combination. A resolution stage determines what is known, ambiguous, or missing.
- Sources: company website, allowed news/search results, public job listings, and a technology-data provider.
- Output: cited one-page meeting brief plus an editable outreach draft.
- Citations are always recorded and available, but collapsed by default in the main reading experience.
- Workspace roles: owner and member.
- Usage: metered research runs with per-workspace limits.
- No autonomous sending, browser scraping behind logins, CRM write-back, or custom agent workflows in the first release.

### Intelligence advantage

InsightIQ should not compete on possession of a larger contact database. Its advantage is the transformation of individually ordinary evidence into timely, workflow-specific intelligence:

- Compare current and historical pages or provider snapshots to detect change.
- Combine hiring composition, leadership changes, expansion news, technology changes, reviews, and public messaging.
- Separate observed facts from inferred implications.
- Explain why each signal matters to the user's offer and meeting objective.
- Surface contradictions, ambiguity, freshness, and missing evidence instead of silently guessing.

This remains public or properly licensed OSINT. Differentiation comes from triangulation, history, and reasoning—not bypassing authentication or source restrictions.

### Recommended experience and economics

- Show the first useful facts within 30–60 seconds.
- Complete a standard brief in 2–5 minutes and a deep refresh in 5–10 minutes.
- Target a blended direct cost no higher than $0.35 per standard brief at meaningful volume; enforce a temporary MVP hard cap of $0.75.
- Meter research credits rather than individual provider calls. A standard brief costs one credit; an expensive deep refresh costs three.
- Initial pricing hypothesis: Solo $49/month for 40 credits, Pro $129/month for 150 credits, and Team $299/month for 400 credits and three seats.

These values are hypotheses to validate with usage and willingness-to-pay interviews. Provider lookup budgets must be decided before each run, not discovered after an uncontrolled agent loop.

### Decisions still being grilled

See [discovery-questions.md](./architecture/discovery-questions.md). Proposed architectural decisions are tracked in [decisions](./architecture/decisions/), and shared language is tracked in [glossary.md](./architecture/glossary.md).

---

## 3. Architecture Discovery Questions

_Source: [architecture/discovery-questions.md](./architecture/discovery-questions.md)_

### Architecture Discovery Questions

Status: round 1 partly resolved

### Confirmed on 2026-08-24

- Primary audience: salespeople responsible for closing deals, initially B2B SaaS account executives with agency SDRs as an adjacent segment.
- Intake: flexible and incomplete; InsightIQ begins with whatever identifiers the user supplies and expands them through permitted OSINT.
- Provenance: citations and retrieval timestamps are always recorded. The interface may collapse them until the user enables evidence details.
- Acquisition: begin with operationally simple methods, but create differentiated intelligence beyond merely restating easy-to-find public data.
- Automation: data retrieval and decision support come first. External actions such as sending and CRM updates remain a later goal.
- Economics: InsightIQ should propose initial latency, cost, and plan targets.

These questions are ordered by architectural impact. Decisions should be recorded as answers arrive.

### Round 1: product wedge and trust boundary

1. Who is the first paying user: B2B SaaS account executive, agency SDR, recruiter, consultant, or another specific role?
2. What is the first repeated job: prepare for a scheduled meeting, qualify a cold lead, draft outbound email, or monitor named accounts for changes?
3. What exact input must reliably start a research run: email address, LinkedIn URL, person plus company, company domain, CRM record, or calendar event?
4. Must every claim in the deliverable show a clickable source and retrieval date, even if that reduces the number of insights?
5. Which jurisdictions and data rules must the MVP support? In particular, may it use only public/provider-licensed data, or is logged-in browser automation expected?
6. Should InsightIQ stop at reviewable drafts, or send emails/update CRMs automatically in the MVP?
7. What is the acceptable target for one brief: latency, maximum provider/AI cost, and selling price or credit charge?

### Round 2: workflow and integrations

1. Is the primary object a person, an account, or a scheduled meeting containing several people?
2. Which destination matters first: the InsightIQ web app, email, Slack, a CRM, or a downloadable document?
3. Does a team share accounts, evidence, and reports, or is each user's research private by default?
4. How should users correct wrong entity matches or unsupported inferences?
5. When is existing research stale enough to refresh, and should refreshes be manual or scheduled?
6. Are outreach templates fixed by segment or configurable per workspace?

### Recommended answers awaiting confirmation

- Primary job: prepare a cited deal brief before a prospect conversation; cold-outreach drafting consumes that same intelligence afterward.
- Primary subject: an account plus the people and opportunity context attached to it. A scheduled meeting is a trigger, not the canonical data object.
- Standard latency: first results in 30–60 seconds and completion in 2–5 minutes.
- Standard direct-cost target: $0.35 or less at volume, with a temporary MVP hard cap of $0.75.
- Plans: Solo $49/40 credits, Pro $129/150 credits, Team $299/400 credits and three seats; deep research consumes three credits.

### Round 3: scale and operations

1. Expected research runs per day at launch, after six months, and at the first enterprise customer?
2. Required retention periods for raw evidence, generated reports, and audit logs?
3. Required authentication and enterprise controls: password/social login, SSO, SCIM, data residency, customer-managed keys?
4. What failure behavior is acceptable when one source is slow, blocked, expensive, or contradictory?
5. Which metrics define a successful brief: time saved, user rating, factual precision, reply rate, meeting conversion, or revenue influence?

---

## 4. Domain Model

_Source: [architecture/domain-model.md](./architecture/domain-model.md)_

### InsightIQ Domain Model

Status: proposed after discovery round 1

### Domain boundaries

#### Identity and tenancy

- `Workspace`: tenant, billing, policy, and sharing boundary.
- `User`: a human who belongs to one or more workspaces.
- `Membership`: a user's role and state within a workspace.

#### Revenue context

- `Account`: the canonical company being sold to.
- `Prospect`: a person associated with an account.
- `Opportunity`: the user's commercial context for an account, including objective, stage, value, offer, and known risks.
- `Interaction`: a scheduled or completed meeting, call, email, or other touchpoint.

#### Intake and resolution

- `ResearchRequest`: the user's intent, supplied identifiers, desired depth, and target use.
- `Identifier`: an email, domain, name, profile URL, CRM ID, or other resolution clue.
- `EntityCandidate`: a possible account or prospect match with evidence and score.
- `ResolutionDecision`: an accepted, rejected, or user-corrected match.

#### Research and provenance

- `ResearchRun`: one immutable execution for a request, with budget, policy, status, and pipeline version.
- `ResearchTask`: an idempotent unit of connector or analysis work within a run.
- `SourceDocument`: retrieved raw material or provider response.
- `Evidence`: a bounded excerpt or structured datum with provenance.
- `Fact`: a normalized source-backed statement.
- `Signal`: a time-bound fact or detected change with sales relevance.
- `Inference`: an explicit interpretation derived from facts or signals; never stored as an observed fact.
- `Contradiction`: incompatible evidence that requires ranking, explanation, or user review.

#### Delivery

- `Claim`: a versioned statement selected for an artifact and linked to supporting evidence or inferences.
- `Brief`: the versioned deal-preparation deliverable for an account, opportunity, or interaction.
- `BriefSection`: company context, people, recent changes, likely priorities, talking points, objections, questions, and risks.
- `OutreachDraft`: reviewable message content generated from a brief and offer context.
- `UserFeedback`: correction, usefulness rating, evidence challenge, or outcome signal.

#### Metering and governance

- `UsageLedgerEntry`: an immutable record of credits reserved, consumed, released, or adjusted.
- `ProviderCall`: provider, purpose, latency, monetary cost, outcome, and terms-policy version.
- `AuditEvent`: security- and user-relevant activity.
- `SourcePolicy`: allowed acquisition method, retention, display, and derivative-use rules for a source type.

### Important relationships

```text
Workspace
  |-- Accounts -- Prospects
  |       |-- Opportunities -- Interactions
  |       `-- ResearchRequests -- ResearchRuns -- ResearchTasks
  |                                      |
  |                                      v
  |                          SourceDocuments -> Evidence
  |                                      |
  |                                      v
  |                            Facts -> Signals -> Inferences
  |                                      |
  |                                      v
  `-- Briefs -> Claims -> citations -----+
          `-- OutreachDrafts
```

### Invariants

1. Every tenant-owned record carries a workspace boundary, directly or through an unambiguous parent.
2. A material claim must cite evidence; an inference must also identify the facts or signals from which it was derived.
3. A research run is immutable after completion; refreshes create new runs and artifact versions.
4. A connector task is idempotent for its run, subject, source, parameters, and connector version.
5. Provider calls cannot exceed the run's reserved monetary and request budgets.
6. Raw evidence and derivative data follow the applicable source policy and retention schedule.
7. External side effects require explicit user approval until a future automation policy says otherwise.

---

## 5. Glossary

_Source: [architecture/glossary.md](./architecture/glossary.md)_

### InsightIQ Glossary

| Term | Meaning |
| --- | --- |
| Account | A company or organization being researched or sold to. |
| Prospect | A person associated with an account and considered for outreach or a meeting. |
| Opportunity | The workspace's commercial context for an account, including offer, stage, objective, value, and risks. |
| Interaction | A scheduled or completed meeting, call, email, or other prospect touchpoint. |
| Research run | One immutable attempt to collect evidence and generate intelligence for a defined subject and purpose. |
| Source connector | An adapter that retrieves permitted data from a website, API, uploaded file, or connected system. |
| Source document | A retrieved unit of raw evidence, such as a page, article, job post, or provider response. |
| Evidence | A preserved excerpt or structured value from a source document, including provenance and retrieval time. |
| Fact | A normalized, source-backed statement about a prospect or account. |
| Signal | A time-bound fact or pattern that may affect sales relevance, such as hiring growth, funding, expansion, or technology adoption. |
| Insight | A reasoned interpretation of one or more signals for a particular sales workflow. |
| Inference | An interpretation derived from facts or signals and clearly distinguished from directly observed evidence. |
| Contradiction | Two or more pieces of evidence that cannot all be treated as simultaneously accurate without qualification. |
| Claim | A statement included in a generated artifact; material claims must reference supporting evidence. |
| Brief / Deal Brief | A versioned, human-reviewable artifact containing account context, signals, talking points, risks, objections, and citations. "Deal Brief" is the customer-facing name used in product and submission material; "Brief" is the domain-model term for the same artifact. |
| Outreach draft | Generated message content that a user can review and edit before sending. |
| Research subject | The requested target: an account, prospect, or meeting context. |
| Workspace | The tenant boundary containing users, settings, usage, accounts, and artifacts. |
| Resolution | Matching user input to canonical prospect and account records. |
| Research credit | The customer-facing usage unit reserved for a bounded research depth; it is not identical to a provider API call. |
| Source policy | Versioned rules governing how a source may be acquired, retained, displayed, and used for derivatives. |
| Confidence | A calibrated indication of support quality, not a substitute for source evidence. |
| Freshness | The time window during which a fact, signal, or artifact is considered current enough for its use. |
| OSINT Worker | A Go-implemented, high-concurrency process that performs source connector scraping and extraction; introduced by ADR 0005. |
| AI & Synthesis Service | The Python service that orchestrates multi-agent synthesis (e.g. LangGraph/CrewAI) and enforces the evidence-first structured-output contract; see ADR 0005. |
| Kafka topic | The asynchronous message-broker channel connecting the synchronous Node.js services to the Go/Python worker services; replaces the "durable queue" placeholder from ADR 0001. |
| Alibaba Cloud | The cloud provider hosting the containerized service stack and the AI model inference used by the AI & Synthesis Service. |
| Qoder | The API/toolchain (and associated Enterprise Plan) used for AI model inference and developer toolchain integration; see the Hackathon Submission section. |

---

## 6. ADR 0001: Modular Monolith and Workers

_Source: [architecture/decisions/0001-modular-monolith-and-workers.md](./architecture/decisions/0001-modular-monolith-and-workers.md)_

### ADR 0001: Begin with a modular monolith and asynchronous workers

- Status: superseded by ADR 0005 (below)
- Date: 2026-08-23

### Context

InsightIQ has distinct capabilities—identity resolution, data acquisition, normalization, signal detection, synthesis, and report generation—but the current codebase and likely MVP team do not justify independent microservices. Research work is slow, failure-prone, and provider-rate-limited, so it must not execute inside synchronous request handling.

### Decision

Keep one NestJS application codebase with explicit domain-module boundaries and deploy it in two process roles:

- API: synchronous commands, queries, authentication, webhooks, and job submission.
- Worker: durable asynchronous research orchestration and stage execution.

Use PostgreSQL as the source of truth. Introduce a durable queue for job delivery, retries, scheduling, concurrency controls, and dead-letter handling. Keep connectors and model providers behind internal interfaces.

### Consequences

- The MVP has fewer deployables and simpler transactions than a microservice design.
- Long-running research can scale independently from request traffic.
- Module boundaries must be enforced in code to prevent a distributed monolith later.
- A queue becomes required operational infrastructure.
- Individual modules may be extracted only after measured scaling, reliability, security, or ownership pressure.

### Open choice

The queue implementation remains undecided pending hosting, latency, and operational constraints.

---

## 7. ADR 0002: Evidence-First Intelligence

_Source: [architecture/decisions/0002-evidence-first-intelligence.md](./architecture/decisions/0002-evidence-first-intelligence.md)_

### ADR 0002: Make evidence and provenance first-class domain data

- Status: proposed
- Date: 2026-08-23

### Context

Sales intelligence becomes harmful when generated claims are stale, misattributed, or invented. A report-only schema cannot explain where a claim came from, support targeted refreshes, resolve contradictions, or evaluate quality.

### Decision

Persist the lineage from source document to evidence to normalized fact or signal to generated claim. Store retrieval time, source URL or provider reference, applicable timestamps, extraction method, and confidence. Generated artifacts reference claim versions rather than embedding unverifiable prose as the only record.

### Consequences

- The product can show citations, support corrections, and measure factual quality.
- Storage and pipeline complexity are higher than saving a single generated report.
- Raw source retention must follow provider terms and privacy policy.
- Synthesis prompts and outputs require structured schemas and validation.

---

## 8. ADR 0003: Flexible Intake and Progressive Resolution

_Source: [architecture/decisions/0003-flexible-intake-and-progressive-resolution.md](./architecture/decisions/0003-flexible-intake-and-progressive-resolution.md)_

### ADR 0003: Use flexible intake with progressive entity resolution

- Status: proposed
- Date: 2026-08-24

### Context

Users will possess different starting data: a name, email, domain, profile URL, CRM record, meeting, or incomplete combination. Requiring one perfect identifier would add friction, while silently accepting weak matches would contaminate all later intelligence.

### Decision

Represent supplied values as typed identifiers on a research request. Run deterministic normalization first, then provider-assisted candidate discovery and scored matching. Preserve alternative candidates and the evidence supporting each match. Ask the user to disambiguate only when confidence or consequence warrants it.

Resolution produces canonical account and prospect identities, but it never erases the original user input. User corrections become durable decisions that influence later runs in the same workspace.

### Consequences

- Research can begin from almost any useful clue.
- The pipeline needs a first-class ambiguous state and resumable user-review step.
- Downstream tasks must wait for the minimum required identity confidence.
- Resolution accuracy and user corrections become measurable product quality metrics.

---

## 9. ADR 0004: Derived OSINT Differentiation

_Source: [architecture/decisions/0004-differentiation-through-derived-osint.md](./architecture/decisions/0004-differentiation-through-derived-osint.md)_

### ADR 0004: Differentiate through temporal and cross-source OSINT synthesis

- Status: proposed
- Date: 2026-08-24

### Context

Restating company pages and public profiles provides little advantage. Attempting to obtain inaccessible personal data by bypassing authentication or source restrictions introduces legal, security, platform, and product risk.

### Decision

Use public, user-provided, or properly licensed evidence, then create differentiation through:

- historical snapshots and change detection;
- cross-source corroboration and contradiction handling;
- structured signal extraction;
- relevance scoring against the user's offer, opportunity stage, and meeting objective;
- explicit separation of observed facts from inferred implications.

Each connector has a versioned source policy governing acquisition, retention, display, and permitted derivative use. Logged-in or browser-assisted acquisition may be evaluated later only with explicit user action and source-specific review.

### Consequences

- The core moat becomes accumulated evidence history, evaluation data, and workflow-specific reasoning.
- Source-policy enforcement and provenance are platform capabilities.
- Some attractive data will be unavailable or expensive; the product must communicate gaps honestly.
- Signal quality can improve without depending on a single proprietary database.

---

## 10. ADR 0005: Event-Driven Microservices Pivot

_Source: [architecture/decisions/0005-event-driven-microservices-pivot.md](./architecture/decisions/0005-event-driven-microservices-pivot.md)_

### ADR 0005: Pivot to an event-driven microservices architecture for the hackathon build

- Status: accepted
- Date: 2026-08-28
- Supersedes: ADR 0001

### Context

ADR 0001 proposed a single NestJS codebase running in API and worker process roles, with Prisma over PostgreSQL and an undecided queue. The hackathon submission commits to a specific, more decoupled shape instead — driven by the Aug 28 – Sept 4 delivery plan, the choice to target Alibaba Cloud and the Qoder API/toolchain, and a desire for the OSINT scraping workload and the AI synthesis workload to scale and fail independently of each other and of the synchronous API.

### Decision

Replace the modular-monolith proposal with an event-driven microservices architecture: a Next.js frontend behind Nginx; Auth & User Management and Pricing & Billing services in Node.js; OSINT Worker Nodes in Go; an AI & Synthesis Service in Python orchestrating multi-agent synthesis (LangGraph/CrewAI) over Alibaba Cloud AI models and the Qoder API; Apache Kafka as the asynchronous message broker; PostgreSQL via Drizzle ORM as the system of record; Redis for caching and worker state; Docker containers deployed to Alibaba Cloud.

The domain model and the evidence-provenance rules from ADR 0002 are unchanged by this pivot — only the process/service boundaries and the messaging and persistence technology choices change.

### Consequences

- More deployables and moving parts than ADR 0001's two-process design, trading MVP simplicity for independent scaling and language fit.
- Module-boundary discipline is now enforced by service and network boundaries instead of in-process code review.
- Kafka becomes required operational infrastructure immediately, rather than a queue choice deferred as "open" under ADR 0001.
- Cross-service contracts must be versioned explicitly since services are now independently deployable.
- Deployment, Docker, and infrastructure changes implied by this ADR belong on the `init`/`main` branches per the Worktree and Branch Guide above; this document records the decision only.

### Open choices

- Exact Kafka topic/partition design and consumer-group ownership per pipeline stage.
- Whether the Auth and Billing services stay separate Node.js deployables long-term or later merge.

---

## 11. Hackathon Submission

_Source: [submission/hackathon-submission.md](./submission/hackathon-submission.md)_

The full applicant details, problem statement, technical approach, delivery plan, and demo link for
the Alibaba Cloud & Qoder AI Hackathon 2026 submission are kept in their own document rather than
duplicated here, since that page also tracks Qoder Enterprise Plan declarations. See
[submission/hackathon-submission.md](./submission/hackathon-submission.md).

In summary: InsightIQ is an "Evidence-First" AI Sales Intelligence Agent for B2B SaaS, high-ticket
B2C, and solopreneur sellers, built as the event-driven microservices architecture described in
ADR 0005 above, with a delivery plan running Aug 28 – Sept 4, 2026 and a live demo at
https://insightiq.zerotools.online/.

---

## 12. Implementation Plans

_Source: [architecture/implementation/](./architecture/implementation/)_

ADR 0005 records *what* was decided; these documents record *how* each piece gets built —
responsibilities, REST/Kafka interfaces, data ownership, tech stack, local dev setup, build order,
and testing plan for each service. They are kept as standalone files rather than duplicated in full
here, since together they run long; read them directly:

- [Implementation Plans index](./architecture/implementation/README.md) — shared conventions
  (event envelope, idempotency, one-Postgres-many-owners) and the overall build order.
- [Auth & User Management Service (Node.js)](./architecture/implementation/auth-user-service.md)
- [Pricing & Billing Service (Node.js)](./architecture/implementation/billing-service.md)
- [OSINT Worker Nodes (Go)](./architecture/implementation/osint-workers.md)
- [AI & Synthesis Service (Python)](./architecture/implementation/ai-synthesis-service.md)
- [Kafka (messaging backbone)](./architecture/implementation/kafka-messaging.md)
- [Nginx (load balancer / reverse proxy)](./architecture/implementation/nginx-load-balancer.md)
