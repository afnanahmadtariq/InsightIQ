# InsightIQ — Hackathon Submission (Alibaba Cloud & Qoder AI Hackathon 2026)

Status: submitted — this is the source-of-truth copy of the submission draft. It supersedes
the discovery-stage architecture proposal in [architecture/README.md](../architecture/README.md)
where the two disagree; see [ADR 0005](../architecture/decisions/0005-event-driven-microservices-pivot.md)
for how that reconciliation is handled.

_Source: Google Doc "InsightIQ Hackathon Submission Draft (Final Version)"_

## Page 1 of 3 — Applicant details

| Field | Value |
| --- | --- |
| Email | afnanahmadtariq@gmail.com |
| Full name | Afnan Ahmad Tariq |
| Registered email address | afnanahmadtariq@gmail.com |
| Project name | InsightIQ |

## Page 2 of 3 — Revised project submission

### Problem statement and proposed solution

**The problem.** Sales professionals in B2B SaaS, agents in high-ticket B2C (real estate, luxury,
wealth management), and solopreneurs spend up to 30% of their week manually hunting for background
context on their prospects. Existing tools only provide generic contact data. Salespeople also
struggle to manually connect what they're selling to a prospect's current situation, and when they
turn to generic AI tools for help, those tools often hallucinate facts without verifiable sources —
leading to poorly prepared meetings and embarrassing factual errors in front of high-value clients.

**The solution.** InsightIQ is an "Evidence-First" AI Sales Intelligence Agent. It takes two inputs
from the user: (1) the prospect's identifiers (email, name, or social profiles like LinkedIn), and
(2) the context of the product/service the user is trying to sell. The system asynchronously
scrapes the web using OSINT to gather real-time data about the prospect and their company, then
synthesizes it into comprehensive Deal Briefs tailored to the use case — hyper-personalized outreach
messages, or meeting prep with strategic talking points, tailored questions, and objection handling.
Every AI-generated claim is backed by a clickable citation mapping back to the raw source.

### Detailed project description

InsightIQ acts as a highly personalized, asynchronous research pipeline and intelligence synthesizer.

**Core features**

- **Multi-faceted ingestion** — accepts the prospect's identifiers (LinkedIn URLs, X/Twitter handles,
  emails, company domains) *and* the specific value proposition/offer the user intends to pitch.
- **Asynchronous multi-source OSINT** — gathers open-source intelligence from company news, hiring
  trends, and public social profiles in parallel.
- **Context-aware intelligence** — cross-references gathered OSINT data with the user's specific
  offer to find entry points and value alignment.
- **Dynamic output generation** — produces multi-section Briefs containing customized outreach
  drafts, or deep-dive meeting preparations (intelligent questions, objections and how to tackle
  them, and strategic follow-up plans), depending on the goal.
- **Evidence-first citation engine** — every piece of data is stored as a verifiable Fact or Signal,
  ensuring full transparency and trust.

**End-to-end user flow**

1. The user inputs prospect identifiers and a brief context of what they want to sell via the
   Next.js dashboard.
2. The system queues a Research Run (the UI stays unblocked).
3. Background workers resolve identity, scrape public data, and run multi-agent AI synthesis.
4. Within a few minutes, the user receives a notification.
5. The user reviews their dynamic Deal Brief, verifies cited sources, and uses the tailored
   questions, objection-handling strategies, or email drafts to close the deal.

### Technical approach and technologies

To ensure enterprise-grade scalability, fault tolerance, and independent scaling of the OSINT
scraping and AI workloads, InsightIQ uses a highly decoupled event-driven microservices architecture.

- **Frontend client** — Next.js and TailwindCSS, for a responsive, server-side-rendered UI.
- **Load balancing & routing** — Nginx as reverse proxy and load balancer, routing traffic to the
  appropriate backend microservices.
- **Microservices ecosystem**
  - **Auth & User Management Service (Node.js)** — authentication, workspace/tenant isolation, core
    synchronous API requests.
  - **Pricing & Billing Service (Node.js)** — research credit ledgers, tier limits, and Qoder
    Enterprise Plan integrations.
  - **OSINT Worker Nodes (Go/Golang)** — extreme-concurrency parallel workers for high-speed data
    extraction, rate-limiting, and web scraping across multiple public sources.
  - **AI & Synthesis Service (Python)** — orchestrates multi-agent frameworks (LangGraph/CrewAI),
    processes raw OSINT data, leverages Alibaba Cloud AI models and the Qoder API to execute the
    strict "Evidence-First" structured (JSON) outputs.
- **Asynchronous message broker** — Apache Kafka decouples the synchronous Node.js services from
  the heavy, long-running Go and Python workloads, so no requests get dropped.
- **Database & caching layer** — PostgreSQL (via Drizzle ORM) as the primary relational store for
  evidence, tenants, and research runs; Redis for high-speed caching and worker state management.
- **Infrastructure** — the stack is containerized with Docker and deployed on Alibaba Cloud, using
  the Qoder Free Tier / Qoder API for model inference and toolchain integrations.

### Delivery plan to the close of the build phase

| Dates | Milestone |
| --- | --- |
| Aug 28 – Aug 29 | **Foundation & architecture.** Finalize microservices repository structure. Set up PostgreSQL schema (Tenants, Evidence, Runs). Deploy Nginx, Kafka, and configure Docker environments on Alibaba Cloud. |
| Aug 30 – Aug 31 | **Intake & Go OSINT workers.** Build Node.js API services for user/offer ingestion. Develop Golang-based OSINT worker nodes to scrape public profiles and company data, normalizing it into the database. |
| Sept 1 – Sept 2 | **Python AI synthesis.** Integrate the Qoder API / LLM layer within the Python service. Develop strict prompting and validation logic enforcing the Evidence-First citation rules. Generate the first dynamic Deal Briefs. |
| Sept 3 | **Frontend & end-to-end flow.** Connect the Next.js frontend to the Nginx reverse proxy. Build the user dashboard for submitting research runs with offer contexts and viewing cited reports. |
| Sept 4 | **Polish & submission.** Conduct E2E testing, generate realistic demo profiles, finalize UI presentation, record the final demo video for the regional round. |

### Repository or demo link

- Demo link: https://insightiq.zerotools.online/

## Page 3 of 3 — Qoder Enterprise Plan consideration

### Training attendance

*(Aap log jis din session main gaye thay usko tick kar dein:)*

- [ ] 19 August
- [ ] 20 August
- [ ] Both sessions
- [ ] Neither session

### Declarations

- [x] I have read and accept the Statement on responsible use set out above.
- [x] The project described is my own work or that of my declared team.
- [x] I understand the Qoder Enterprise Plan is awarded at your discretion and depends on this
      submission.
- [x] My registered email address is correct and I will watch it for the outcome.

### Alternate email address for Qoder access

`ranadanyalarshad@gmail.com`

---

## How this maps onto the repository

This submission describes the target architecture and delivery plan; the `init` branch tracks the
actual implementation against it. As of this writing:

- The Next.js/Tailwind frontend (landing page, custom 404, demo persona picker, and dashboards for
  the B2B SaaS / high-ticket B2C / solopreneur personas) is scaffolded on `init` with seeded/dummy
  data — no backend services are wired up yet.
- The Node.js Auth/Billing services, Go OSINT workers, Python AI/Synthesis service, Kafka, and the
  Alibaba Cloud/Qoder integrations described above are not yet implemented; they follow the delivery
  plan's Aug 30 – Sept 2 milestones.
- Per the [branch and worktree guide](../WORKTREE-AND-BRANCH-GUIDE.md), this `docs` branch carries
  only documentation changes. Application code, Docker, and deployment configuration for the stack
  above belong on `init`/`main`, not here.
