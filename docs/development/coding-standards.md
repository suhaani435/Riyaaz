# Coding standards

## General

Prefer explicit, readable code over clever abstractions. Keep functions small,
name values by their business meaning, and make invalid states hard to express.
Use one formatter and one linter configuration per language, enforced in CI.

## TypeScript and frontend

Use strict TypeScript. Model external data at boundaries with Zod schemas and
use React Hook Form for complex user input. Keep server state in TanStack Query
and local UI state in component state or Zustand only when state crosses
unrelated components. Do not place API business rules in React components.

Organize frontend code by feature. A feature owns its routes, components,
queries, schema validation, and tests. Shared UI primitives remain provider-
agnostic and live outside features.

## Python and backend

Use type annotations for public functions and application boundaries. Pydantic
models validate external input and output; SQLAlchemy models represent
persistence only. Dependencies are wired in the presentation layer and passed
into application use cases through explicit constructors or FastAPI
dependencies.

Use repositories only where they clarify a business-facing persistence port.
Do not introduce generic repository abstractions that merely wrap SQLAlchemy.

## Testing

Tests describe observable behaviour. Unit tests cover domain and application
rules; integration tests cover routes, persistence, migrations, and provider
adapters where feasible. Include validation, authorization, missing-resource,
and provider-failure cases. Avoid tests that depend on timing, shared external
state, or implementation-private details.
