# ADR 0002: Make evidence and provenance first-class domain data

- Status: proposed
- Date: 2026-08-23

## Context

Sales intelligence becomes harmful when generated claims are stale, misattributed, or invented. A report-only schema cannot explain where a claim came from, support targeted refreshes, resolve contradictions, or evaluate quality.

## Decision

Persist the lineage from source document to evidence to normalized fact or signal to generated claim. Store retrieval time, source URL or provider reference, applicable timestamps, extraction method, and confidence. Generated artifacts reference claim versions rather than embedding unverifiable prose as the only record.

## Consequences

- The product can show citations, support corrections, and measure factual quality.
- Storage and pipeline complexity are higher than saving a single generated report.
- Raw source retention must follow provider terms and privacy policy.
- Synthesis prompts and outputs require structured schemas and validation.

