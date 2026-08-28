# ADR 0005: Pivot to an event-driven microservices architecture for the hackathon build

- Status: accepted
- Date: 2026-08-28
- Supersedes: [ADR 0001](./0001-modular-monolith-and-workers.md)

## Context

ADR 0001 proposed a single NestJS codebase running in API and worker process roles, with Prisma
over PostgreSQL and an undecided queue. The hackathon submission (see
[../../submission/hackathon-submission.md](../../submission/hackathon-submission.md)) commits to a
specific, more decoupled shape instead — driven by the Aug 28 – Sept 4 delivery plan, the choice to
target Alibaba Cloud and the Qoder API/toolchain, and a desire for the OSINT scraping workload (high
concurrency, bursty, failure-prone) and the AI synthesis workload (long-running, provider-bound) to
scale and fail independently of each other and of the synchronous API.

## Decision

Replace the modular-monolith proposal with an event-driven microservices architecture:

- **Frontend** — Next.js + TailwindCSS (`apps/web`), served through Nginx.
- **Auth & User Management Service (Node.js)** — authentication, workspace/tenant isolation,
  synchronous API requests.
- **Pricing & Billing Service (Node.js)** — research credit ledger, tier limits, Qoder Enterprise
  Plan integration.
- **OSINT Worker Nodes (Go)** — high-concurrency scraping/extraction across public sources, with
  rate-limiting per source policy.
- **AI & Synthesis Service (Python)** — orchestrates multi-agent synthesis (LangGraph/CrewAI) over
  Alibaba Cloud AI models and the Qoder API, enforcing the Evidence-First structured-output contract
  from [ADR 0002](./0002-evidence-first-intelligence.md).
- **Apache Kafka** as the asynchronous message broker between the synchronous Node.js services and
  the Go/Python workloads, replacing ADR 0001's "undecided queue."
- **PostgreSQL via Drizzle ORM** (replacing the Prisma proposal) as the system of record for
  tenants, evidence, and research runs; **Redis** for caching and worker state.
- **Docker** containers for every service, deployed to **Alibaba Cloud**.

The domain model in [domain-model.md](../domain-model.md) and the evidence-provenance rules in
ADR 0002 are unchanged by this pivot — only the process/service boundaries and the messaging and
persistence technology choices change. `ResearchRun` and `ResearchTask` map onto Kafka topics and
consumer groups instead of an in-process queue; `SourceDocument`/`Evidence`/`Fact`/`Signal` are
still owned by the AI & Synthesis Service pipeline stage, now implemented in Python rather than
NestJS.

## Consequences

- More deployables and moving parts than ADR 0001's two-process design: five services plus Kafka,
  Redis, PostgreSQL, and Nginx. This trades MVP simplicity for independent scaling and language fit
  (Go for concurrent I/O-bound scraping, Python for the AI/agent ecosystem).
- Module-boundary discipline is now enforced by service and network boundaries instead of by
  in-process code review, which lowers the risk of a distributed monolith that ADR 0001 flagged as
  a hazard of the alternative.
- Kafka becomes required operational infrastructure immediately, rather than a queue choice deferred
  as "open" under ADR 0001.
- Cross-service contracts (event schemas, evidence/citation payload shapes) must be versioned
  explicitly since services are now independently deployable; this responsibility was implicit
  within a single codebase under ADR 0001.
- Deployment, Docker, and infrastructure changes implied by this ADR belong on the `init`/`main`
  branches per the [branch and worktree guide](../../WORKTREE-AND-BRANCH-GUIDE.md); this document
  records the decision only.

## Open choices

- Exact Kafka topic/partition design and consumer-group ownership per pipeline stage.
- Whether the Auth and Billing services stay separate Node.js deployables long-term or later merge,
  once real traffic and team-ownership pressure (the same bar ADR 0001 set for module extraction)
  materializes.
