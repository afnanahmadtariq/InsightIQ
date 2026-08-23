# ADR 0004: Differentiate through temporal and cross-source OSINT synthesis

- Status: proposed
- Date: 2026-08-24

## Context

Restating company pages and public profiles provides little advantage. Attempting to obtain inaccessible personal data by bypassing authentication or source restrictions introduces legal, security, platform, and product risk.

## Decision

Use public, user-provided, or properly licensed evidence, then create differentiation through:

- historical snapshots and change detection;
- cross-source corroboration and contradiction handling;
- structured signal extraction;
- relevance scoring against the user's offer, opportunity stage, and meeting objective;
- explicit separation of observed facts from inferred implications.

Each connector has a versioned source policy governing acquisition, retention, display, and permitted derivative use. Logged-in or browser-assisted acquisition may be evaluated later only with explicit user action and source-specific review.

## Consequences

- The core moat becomes accumulated evidence history, evaluation data, and workflow-specific reasoning.
- Source-policy enforcement and provenance are platform capabilities.
- Some attractive data will be unavailable or expensive; the product must communicate gaps honestly.
- Signal quality can improve without depending on a single proprietary database.

