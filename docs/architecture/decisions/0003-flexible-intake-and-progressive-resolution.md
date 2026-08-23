# ADR 0003: Use flexible intake with progressive entity resolution

- Status: proposed
- Date: 2026-08-24

## Context

Users will possess different starting data: a name, email, domain, profile URL, CRM record, meeting, or incomplete combination. Requiring one perfect identifier would add friction, while silently accepting weak matches would contaminate all later intelligence.

## Decision

Represent supplied values as typed identifiers on a research request. Run deterministic normalization first, then provider-assisted candidate discovery and scored matching. Preserve alternative candidates and the evidence supporting each match. Ask the user to disambiguate only when confidence or consequence warrants it.

Resolution produces canonical account and prospect identities, but it never erases the original user input. User corrections become durable decisions that influence later runs in the same workspace.

## Consequences

- Research can begin from almost any useful clue.
- The pipeline needs a first-class ambiguous state and resumable user-review step.
- Downstream tasks must wait for the minimum required identity confidence.
- Resolution accuracy and user corrections become measurable product quality metrics.

