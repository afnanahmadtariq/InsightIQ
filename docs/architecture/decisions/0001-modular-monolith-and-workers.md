# ADR 0001: Begin with a modular monolith and asynchronous workers

- Status: superseded by [ADR 0005](./0005-event-driven-microservices-pivot.md)
- Date: 2026-08-23

## Context

InsightIQ has distinct capabilities—identity resolution, data acquisition, normalization, signal detection, synthesis, and report generation—but the current codebase and likely MVP team do not justify independent microservices. Research work is slow, failure-prone, and provider-rate-limited, so it must not execute inside synchronous request handling.

## Decision

Keep one NestJS application codebase with explicit domain-module boundaries and deploy it in two process roles:

- API: synchronous commands, queries, authentication, webhooks, and job submission.
- Worker: durable asynchronous research orchestration and stage execution.

Use PostgreSQL as the source of truth. Introduce a durable queue for job delivery, retries, scheduling, concurrency controls, and dead-letter handling. Keep connectors and model providers behind internal interfaces.

## Consequences

- The MVP has fewer deployables and simpler transactions than a microservice design.
- Long-running research can scale independently from request traffic.
- Module boundaries must be enforced in code to prevent a distributed monolith later.
- A queue becomes required operational infrastructure.
- Individual modules may be extracted only after measured scaling, reliability, security, or ownership pressure.

## Open choice

The queue implementation remains undecided pending hosting, latency, and operational constraints.

