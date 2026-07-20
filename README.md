# RIYAAZ

RIYAAZ is a production-oriented platform for Kathak students and teachers. It
will support rhythm practice, bol and mudra feedback, teacher workflows, and
longitudinal learning insights.

The platform is deliberately being built as a modular monolith: independently
owned feature modules within one deployable backend. This keeps early delivery
simple while preserving boundaries that support future extraction when measured
scale requirements justify it.

## Repository status

Phase 0 is establishing the engineering foundation. Application services are
introduced in the next milestone; this commit defines the standards they must
follow.

## Architecture and engineering guides

- [System architecture](docs/architecture/system-overview.md)
- [Coding standards](docs/development/coding-standards.md)
- [Contribution workflow](CONTRIBUTING.md)
- [Architecture decision records](docs/adr/README.md)

## Planned repository layout

```text
apps/web/                 Next.js application
services/api/             FastAPI modular monolith
docs/                     Architecture, decisions, and engineering guides
infra/                    Local and deployment infrastructure definitions
```

## Delivery principles

- Features are delivered through small, independently verifiable commits.
- Each feature owns domain, application, infrastructure, presentation, tests,
  and documentation concerns.
- Public API contracts are versioned and documented before implementation.
- PostgreSQL is the system of record; Supabase provides managed identity,
  storage, and realtime capabilities where appropriate.
- Production observability, security, and migration safety are requirements,
  not later enhancements.
