# InsightIQ Glossary

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
| OSINT Worker | A Go-implemented, high-concurrency process that performs source connector scraping and extraction; introduced by [ADR 0005](./decisions/0005-event-driven-microservices-pivot.md). |
| AI & Synthesis Service | The Python service that orchestrates multi-agent synthesis (e.g. LangGraph/CrewAI) and enforces the evidence-first structured-output contract; see [ADR 0005](./decisions/0005-event-driven-microservices-pivot.md). |
| Kafka topic | The asynchronous message-broker channel connecting the synchronous Node.js services to the Go/Python worker services; replaces the "durable queue" placeholder from [ADR 0001](./decisions/0001-modular-monolith-and-workers.md). |
| Alibaba Cloud | The cloud provider hosting the containerized service stack and the AI model inference used by the AI & Synthesis Service. |
| Qoder | The API/toolchain (and associated Enterprise Plan) used for AI model inference and developer toolchain integration; see the [hackathon submission](../submission/hackathon-submission.md). |
