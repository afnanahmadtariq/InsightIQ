# InsightIQ Domain Model

Status: proposed after discovery round 1

## Domain boundaries

### Identity and tenancy

- `Workspace`: tenant, billing, policy, and sharing boundary.
- `User`: a human who belongs to one or more workspaces.
- `Membership`: a user's role and state within a workspace.

### Revenue context

- `Account`: the canonical company being sold to.
- `Prospect`: a person associated with an account.
- `Opportunity`: the user's commercial context for an account, including objective, stage, value, offer, and known risks.
- `Interaction`: a scheduled or completed meeting, call, email, or other touchpoint.

### Intake and resolution

- `ResearchRequest`: the user's intent, supplied identifiers, desired depth, and target use.
- `Identifier`: an email, domain, name, profile URL, CRM ID, or other resolution clue.
- `EntityCandidate`: a possible account or prospect match with evidence and score.
- `ResolutionDecision`: an accepted, rejected, or user-corrected match.

### Research and provenance

- `ResearchRun`: one immutable execution for a request, with budget, policy, status, and pipeline version.
- `ResearchTask`: an idempotent unit of connector or analysis work within a run.
- `SourceDocument`: retrieved raw material or provider response.
- `Evidence`: a bounded excerpt or structured datum with provenance.
- `Fact`: a normalized source-backed statement.
- `Signal`: a time-bound fact or detected change with sales relevance.
- `Inference`: an explicit interpretation derived from facts or signals; never stored as an observed fact.
- `Contradiction`: incompatible evidence that requires ranking, explanation, or user review.

### Delivery

- `Claim`: a versioned statement selected for an artifact and linked to supporting evidence or inferences.
- `Brief`: the versioned deal-preparation deliverable for an account, opportunity, or interaction.
- `BriefSection`: company context, people, recent changes, likely priorities, talking points, objections, questions, and risks.
- `OutreachDraft`: reviewable message content generated from a brief and offer context.
- `UserFeedback`: correction, usefulness rating, evidence challenge, or outcome signal.

### Metering and governance

- `UsageLedgerEntry`: an immutable record of credits reserved, consumed, released, or adjusted.
- `ProviderCall`: provider, purpose, latency, monetary cost, outcome, and terms-policy version.
- `AuditEvent`: security- and user-relevant activity.
- `SourcePolicy`: allowed acquisition method, retention, display, and derivative-use rules for a source type.

## Important relationships

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

## Invariants

1. Every tenant-owned record carries a workspace boundary, directly or through an unambiguous parent.
2. A material claim must cite evidence; an inference must also identify the facts or signals from which it was derived.
3. A research run is immutable after completion; refreshes create new runs and artifact versions.
4. A connector task is idempotent for its run, subject, source, parameters, and connector version.
5. Provider calls cannot exceed the run's reserved monetary and request budgets.
6. Raw evidence and derivative data follow the applicable source policy and retention schedule.
7. External side effects require explicit user approval until a future automation policy says otherwise.

