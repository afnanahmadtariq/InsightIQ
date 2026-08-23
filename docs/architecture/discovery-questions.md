# Architecture Discovery Questions

Status: round 1 partly resolved

## Confirmed on 2026-08-24

- Primary audience: salespeople responsible for closing deals, initially B2B SaaS account executives with agency SDRs as an adjacent segment.
- Intake: flexible and incomplete; InsightIQ begins with whatever identifiers the user supplies and expands them through permitted OSINT.
- Provenance: citations and retrieval timestamps are always recorded. The interface may collapse them until the user enables evidence details.
- Acquisition: begin with operationally simple methods, but create differentiated intelligence beyond merely restating easy-to-find public data.
- Automation: data retrieval and decision support come first. External actions such as sending and CRM updates remain a later goal.
- Economics: InsightIQ should propose initial latency, cost, and plan targets.

These questions are ordered by architectural impact. Decisions should be recorded as answers arrive.

## Round 1: product wedge and trust boundary

1. Who is the first paying user: B2B SaaS account executive, agency SDR, recruiter, consultant, or another specific role?
2. What is the first repeated job: prepare for a scheduled meeting, qualify a cold lead, draft outbound email, or monitor named accounts for changes?
3. What exact input must reliably start a research run: email address, LinkedIn URL, person plus company, company domain, CRM record, or calendar event?
4. Must every claim in the deliverable show a clickable source and retrieval date, even if that reduces the number of insights?
5. Which jurisdictions and data rules must the MVP support? In particular, may it use only public/provider-licensed data, or is logged-in browser automation expected?
6. Should InsightIQ stop at reviewable drafts, or send emails/update CRMs automatically in the MVP?
7. What is the acceptable target for one brief: latency, maximum provider/AI cost, and selling price or credit charge?

## Round 2: workflow and integrations

1. Is the primary object a person, an account, or a scheduled meeting containing several people?
2. Which destination matters first: the InsightIQ web app, email, Slack, a CRM, or a downloadable document?
3. Does a team share accounts, evidence, and reports, or is each user's research private by default?
4. How should users correct wrong entity matches or unsupported inferences?
5. When is existing research stale enough to refresh, and should refreshes be manual or scheduled?
6. Are outreach templates fixed by segment or configurable per workspace?

## Recommended answers awaiting confirmation

- Primary job: prepare a cited deal brief before a prospect conversation; cold-outreach drafting consumes that same intelligence afterward.
- Primary subject: an account plus the people and opportunity context attached to it. A scheduled meeting is a trigger, not the canonical data object.
- Standard latency: first results in 30–60 seconds and completion in 2–5 minutes.
- Standard direct-cost target: $0.35 or less at volume, with a temporary MVP hard cap of $0.75.
- Plans: Solo $49/40 credits, Pro $129/150 credits, Team $299/400 credits and three seats; deep research consumes three credits.

## Round 3: scale and operations

1. Expected research runs per day at launch, after six months, and at the first enterprise customer?
2. Required retention periods for raw evidence, generated reports, and audit logs?
3. Required authentication and enterprise controls: password/social login, SSO, SCIM, data residency, customer-managed keys?
4. What failure behavior is acceptable when one source is slow, blocked, expensive, or contradictory?
5. Which metrics define a successful brief: time saved, user rating, factual precision, reply rate, meeting conversion, or revenue influence?
