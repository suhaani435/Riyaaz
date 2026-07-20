# System architecture

## Purpose

RIYAAZ is designed as a modular monolith during its early and medium-growth
stages. A single FastAPI deployment owns transactional business operations,
while the Next.js web application provides the user interface. PostgreSQL is
the authoritative transactional store.

Supabase Auth owns end-user identity. The API verifies Supabase-issued tokens
and owns product authorization decisions. Supabase Storage stores user media;
the API creates scoped access policies and records media metadata in
PostgreSQL. Realtime subscriptions and WebSockets are used only where a
feature needs low-latency updates.

## Module boundaries

Each backend feature is organized into four layers:

| Layer | Responsibility | May depend on |
| --- | --- | --- |
| Domain | Business rules, entities, value objects, domain errors | Standard library and domain-local types |
| Application | Use cases, ports, transactions, authorization orchestration | Domain |
| Infrastructure | SQLAlchemy persistence, Supabase clients, external AI/media adapters | Application and domain |
| Presentation | FastAPI routes, request/response schemas, dependency wiring | Application |

Dependencies must point inward. A domain object never imports FastAPI,
SQLAlchemy, or a provider SDK. Cross-module access goes through a published
application-level interface, not direct database-table access.

Initial modules are `identity`, `practice`, `rhythm`, `media`, `feedback`,
`analytics`, and `teacher`. A module is created only when it owns real business
behaviour; empty scaffolding is avoided.

## Data ownership

PostgreSQL is partitioned by schema or naming convention only when it improves
operational clarity; referential integrity remains in the same database while
the product is a modular monolith. Every table has a stable primary key,
creation timestamp, update timestamp, and ownership or tenancy boundary where
applicable. Schema changes are forward-only Alembic migrations.

Raw practice media is stored outside PostgreSQL. The database stores metadata,
access ownership, derived artifacts, and processing status. Audio/video model
inference runs asynchronously once workloads make synchronous processing
unreliable for user requests.

## Scale path

The first deployment can scale web and API instances horizontally behind their
platform load balancers. API instances remain stateless. PostgreSQL connection
pool limits, background-job throughput, and media processing queues become
explicit capacity metrics before worker services are separated.

Extract a module into a service only when it has independently measurable
scaling, availability, or deployment needs. A service extraction retains its
application contract and gains an owned datastore only through a deliberate
migration plan.

## Security baseline

- Authenticate users through verified Supabase JWTs; never trust client claims
  without verification.
- Enforce authorization in application use cases, including resource ownership
  and teacher/student relationships.
- Validate all request payloads and limit media size, format, and processing
  duration.
- Use short-lived, scoped signed URLs for private media access.
- Store secrets outside source control and rotate provider credentials.
- Emit structured, privacy-conscious audit and error events.

## API policy

Public API endpoints will be namespaced under `/api/v1`. Pydantic request and
response schemas are the public contract; domain and persistence models are
never returned directly. Breaking changes require a new API version or a
documented compatibility period.
