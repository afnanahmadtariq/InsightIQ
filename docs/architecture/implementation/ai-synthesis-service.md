# AI & Synthesis Service (Python)

Status: planning · Part of [Implementation Plans](./README.md)

## Responsibilities

- Consume `research.osint.completed`, load the run's `Evidence` (and any prior `Fact`s), and derive
  `Signal`s and the final `DealBrief` — the customer-facing artifact seeded on `init` in
  `apps/web/data/briefs.ts`.
- Enforce the [Evidence-First rule](../decisions/0002-evidence-first-intelligence.md): every
  `Claim` in the brief (a talking point, an objection response, a line in the outreach draft that
  states a fact) must carry a citation to a real `Evidence`/`Signal` id. No citation, no claim — the
  service drops or rewrites the claim rather than shipping it uncited.
- Call the Alibaba Cloud AI model(s) and the Qoder API for generation, behind an internal "model
  gateway" abstraction so the provider can change without touching the pipeline logic (per the
  architecture overview's "provider independence" principle).
- Emit `research.brief.ready` on success, `research.run.failed` on unrecoverable failure (e.g. the
  model refuses to ground every claim after retries, or the provider call errors out repeatedly).

## Interfaces

### Kafka

- **Consumes** `research.osint.completed` — `{ runId, workspaceId, evidenceIds, failedConnectors }`.
  Consumer group: `ai-synthesis`.
- **Produces**
  - `research.brief.ready` — `{ runId, workspaceId, briefId }` (the brief content itself is read
    from Postgres by the Auth service, not embedded in the event, to keep messages small).
  - `research.run.failed` — `{ runId, workspaceId, reason }`.

### Internal API

A small FastAPI app exposes `GET /healthz` for orchestration and `GET /internal/runs/:id/debug` (a
non-production debug view of the raw agent trace) — useful while iterating on prompts Sept 1–2, not
something the frontend ever calls.

## Pipeline stages

1. **Load evidence.** Pull all `Evidence` rows for `runId`, grouped by connector/source.
2. **Fact & signal extraction.** An agent step turns raw evidence into normalized `Fact`s, then
   `Signal`s (time-bound, sales-relevant patterns), each still carrying its source `Evidence` id(s).
   This is where "hiring surge" or "just raised funding" gets recognized as a pattern rather than a
   single fact.
3. **Context-aware relevance scoring.** Cross-reference signals against the `offer` text from the
   `ResearchRequest` to rank which signals are worth surfacing — the "context-aware intelligence"
   feature from the submission doc.
4. **Structured brief generation.** Generate the `DealBrief` JSON (company summary, signals,
   talking points, objections, questions, outreach draft) via the model gateway, using a strict
   Pydantic schema mirroring the `DealBrief` TypeScript type in `apps/web/data/briefs.ts` on `init`.
5. **Citation validation.** Walk every claim-bearing field, reject the whole brief generation if any
   claim lacks a `citationId`/`signalId` that resolves to something loaded in step 1, and retry
   generation (bounded retries) with the validator's rejection reason fed back into the prompt.
6. **Persist & publish.** Save the validated `DealBrief` + `Claim` rows, publish
   `research.brief.ready`.

## Data owned

`facts`, `signals`, `claims`, `deal_briefs` (the versioned artifact — see
[domain-model.md](../domain-model.md) for `Brief`/`BriefSection`/`OutreachDraft`).

## Tech stack

- Python 3.12, orchestrated with **LangGraph** (chosen over CrewAI for this build because its
  explicit graph/state model makes the "validate → retry with feedback" loop in step 5
  straightforward to express, versus CrewAI's more implicit agent-delegation style) for the
  multi-stage pipeline above.
- **Pydantic v2** for the structured-output schema and the citation validator.
- `aiokafka` for the consumer/producer (async, matches LangGraph's async execution model).
- `SQLAlchemy` (async) for Postgres reads/writes against the same schema Drizzle migrations own —
  Python doesn't run migrations, it only reads/writes rows.
- Model gateway: a thin internal interface (`generate_structured(prompt, schema) -> T`) with one
  implementation calling Alibaba Cloud's model API and one calling the Qoder API/toolchain, so the
  pipeline code never imports a provider SDK directly.

## Local development

New `ai-synthesis` service in `docker-compose.yml`, depending on `kafka` and `postgres`. A
`scripts/replay-run.py` helper (stretch goal) that republishes a stored `research.osint.completed`
event for a given `runId`, so prompt iteration doesn't require re-running the OSINT workers every
time.

## Build order

1. **Aug 28–29:** FastAPI skeleton, Kafka consumer/producer wiring, `facts`/`signals`/`deal_briefs`
   tables migrated (via the Node/Drizzle side; Python just targets the resulting schema).
2. **Aug 30–31:** Fact/signal extraction stage working against real OSINT-worker output from the
   Aug 30–31 milestone above.
3. **Sept 1–2:** Full pipeline (relevance scoring → structured generation → citation validation →
   persist/publish) producing a real Deal Brief matching the seeded example's shape on `init`, using
   the Alibaba Cloud model / Qoder API for generation.
4. **Sept 3–4:** Prompt tuning against the seeded demo personas' scenarios so the live output reads
   as well as the hand-written `apps/web/data/briefs.ts` fixtures it's replacing.

## Testing plan

- Unit tests for the citation validator with deliberately-uncited fixture briefs — the single
  highest-value test in this service, since it's the whole point of "Evidence-First."
- A golden-file test: given a fixed, recorded set of `Evidence` rows, assert the pipeline's
  non-generative stages (extraction grouping, relevance ranking) are deterministic; the generative
  stage itself is not asserted byte-for-byte (LLM output isn't stable), only schema- and
  citation-validated.
- An integration test replaying one `research.osint.completed` fixture end to end against a real
  (or recorded/mocked) model call, checked into CI as a smoke test gated behind an API-key secret so
  it skips gracefully in forks/PRs without the key.

## Open risks

- Model/provider latency and cost against the architecture overview's 2–5 minute standard / 5–10
  minute deep-refresh targets — needs measuring against real Alibaba Cloud/Qoder latency once
  credentials are available, not assumed.
- Retry budget for the citation-validation loop (step 5) needs a hard cap so a stubborn generation
  doesn't blow through the run's cost/time budget — track this as a per-run guard, not just a
  global default.
