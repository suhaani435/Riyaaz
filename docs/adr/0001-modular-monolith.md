# ADR 0001: Start with a modular monolith

- Status: Accepted
- Date: 2026-07-21

## Context

RIYAAZ has several future domains: practice sessions, rhythm, media analysis,
feedback, analytics, teacher collaboration, and AI coaching. The team needs
strong boundaries without adding the operational overhead of distributed
systems before real load and organizational needs are understood.

## Decision

Build the backend as a modular FastAPI monolith. Features own domain,
application, infrastructure, and presentation code. They communicate through
application-level contracts while sharing a PostgreSQL deployment initially.
The web application is a separate Next.js deployment.

## Alternatives considered

### Microservices from the start

This provides independent deployment and scaling boundaries, but duplicates
authentication, observability, deployment, contract testing, and operational
work across immature product domains. It would slow product learning and
increase failure modes.

### Unstructured monolith

This lowers initial ceremony but permits direct cross-feature coupling and
makes later extraction or independent ownership expensive.

### Serverless functions per feature

This can simplify small event-driven tasks, but is poorly suited as the main
home for transactional workflows, long-running media processing, and a
coherent domain model.

## Consequences

The application can be deployed and debugged as one system while retaining
enforceable feature boundaries. Scaling is initially horizontal at the API
level, with worker processes introduced for asynchronous workloads. Strong
module rules and observability are required to prevent the monolith from
becoming tightly coupled.

## Future review triggers

Revisit this decision when a module needs materially different release cadence,
availability objectives, data residency, runtime characteristics, or sustained
capacity beyond independently scalable workers and API replicas.
