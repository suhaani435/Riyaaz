# Contributing to RIYAAZ

## Working agreement

Create one focused branch per feature or architectural change. Keep commits
small, buildable, and independently testable. Do not combine unrelated
refactors with feature work.

Before implementation, document the feature's purpose, module boundary, data
model impact, API contract, frontend impact, security considerations, and test
strategy. Record a decision as an ADR when it has a durable architectural
impact.

## Definition of done

A change is complete only when it includes the applicable unit and integration
tests, failure-case coverage, documentation, migration files, and API contract
updates. The affected applications must build, format, type-check, and pass
their test suites.

## Review checklist

- The change has a single, clear responsibility.
- Dependencies point inward toward domain and application code.
- Inputs are validated at system boundaries.
- Data access is scoped and migration-safe.
- User-facing and operational failure paths are explicit.
- New behaviour has automated tests at an appropriate layer.
- Documentation explains operational and future-extension implications.

## Commit convention

Use Conventional Commits with a concise scope when useful:

```text
feat(rhythm): add taal catalog query
fix(auth): reject expired identity token
docs(architecture): define API versioning policy
```
