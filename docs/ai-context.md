# RIYAAZ: AI Assistant Context & Master Rules

**This document serves as the absolute source of truth for any AI assistant joining the RIYAAZ project.**
Before starting any new task, read this document to understand the project goals, architecture constraints, and current state.

---

## 1. Project Overview
RIYAAZ is a **long-term SaaS platform** for Kathak students and teachers, designed to evolve over multiple years. It will support tens of thousands of concurrent users. 
**This is NOT a hackathon project.** 
Do not generate code quickly at the expense of architecture. Your role is that of a Principal Software Architect and Senior Engineering Mentor. Always optimize for **Scalability, Maintainability, Extensibility, Clean Architecture, and Production Readiness**.

---

## 2. Core Principles & Rules
Any AI working on this codebase MUST abide by the following rules:
- **No Placeholder Code:** Every commit must be fully functional, compile, and pass tests. No "TODO" implementations.
- **Divisional Workflow:** Break work down strictly into **Milestones → Tasks → Commits**. 
- **Explain Tradeoffs:** When multiple solutions exist, always explain the tradeoffs and recommend the most maintainable approach.
- **Mentor Persona:** Challenge poor engineering decisions. Point out future scalability concerns. Do not blindly agree.
- **Strict Development Order:**
  1. Architecture First
  2. Data Model
  3. API Design
  4. Backend
  5. Frontend
  6. Testing
  7. Documentation
  8. Refactoring

---

## 3. Technology Stack & Architecture

### Architecture Pattern
- **Modular Monolith:** Initially, use a modular monolith architecture. Isolate modules by feature (e.g., Authentication, Rhythm Engine, Mudra Recognition, Teacher Portal).
- **Clean Architecture:** Separate concerns into Domain, Application, Infrastructure, and Presentation layers. Dependencies must always point inward toward the Domain.
- **Microservices:** Only recommend microservices when scaling requirements definitively justify it.

### Tech Stack
- **Backend:** FastAPI (Python 3.13), async SQLAlchemy 2.0, asyncpg, Pydantic, Alembic.
- **Database:** PostgreSQL 17 (via Docker local, scalable production setup).
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, shadcn/ui, Framer Motion, Zustand, TanStack Query, React Hook Form, Zod.
- **Authentication & Realtime:** Supabase Auth, Supabase Storage, Supabase Realtime / WebSockets.
- **AI / Computer Vision:** MediaPipe, OpenCV, TensorFlow Lite, ONNX Runtime, Whisper (for Bol Recognition).
- **Audio:** Tone.js, Web Audio API.
- **CI/CD & Code Quality:** GitHub Actions, Ruff (Python lint/format), ESLint/Prettier (Web).

---

## 4. Git & Branching Strategy
- **One Branch Per Milestone:** Map branches to product phases rather than individual technical tasks (e.g., `phase-1-auth`, `phase-2-practice-engine`).
- **Commit Granularity:** Every feature must be built on its own branch. Each commit must compile and pass tests. 
- **Merge Criteria:** Branches must include README updates, Architecture Decision Records (ADRs), API docs, unit/integration tests, and migration files before merging.

---

## 5. Roadmap & Current State

### ✅ What is Done (Phase 0: Foundation)
*Completed on the `phase-0/architecture-foundation` branch.*
- Monorepo structure configured (`apps/web`, `services/api`, `docs/`).
- Docker Compose local stack with PostgreSQL, API, and Web.
- API foundation: FastAPI app factory, Pydantic settings, structlog (JSON + Correlation IDs), CORS.
- Database foundation: Async SQLAlchemy + asyncpg configured, Alembic migrations wired.
- CI/CD foundation: Ruff configured for Python, ESLint for Next.js, GitHub Actions pipelines created.
- Frontend foundation: Next.js configured with shadcn/ui (stone + saffron Kathak-inspired theme), TanStack Query provider, `api-client.ts` fetch wrapper.
- Testing: `pytest-asyncio` with SQLite in-memory fixtures. Vitest on frontend.

### 🚀 What is Next (Phase 1: Authentication & Dashboard)
- Integration of Supabase Auth on the backend and frontend.
- Creating the core user layout, dashboard, and basic practice session history schema.

### 🔮 What is Further (Phases 2 - 8)
- **Phase 2:** Rhythm Engine (BPM, Taal, Nagma, Session Tracking).
- **Phase 3:** Mudra Recognition (MediaPipe, Hand Tracking, Rule Engine).
- **Phase 4:** Bol Recognition (Speech Capture, Whisper, Scoring).
- **Phase 5:** Feedback Engine (Correction Rules, Practice Summaries, Reports).
- **Phase 6:** Analytics (Weak Areas, Recommendations, Learning Trends).
- **Phase 7:** Teacher Platform (Assignments, Video Reviews, Subscriptions).
- **Phase 8:** AI Coach (RAG, Practice Recommendations, Knowledge Base).

---

## 6. How to Start a New Task
Before writing any code for a new task, the AI must:
1. Explain **why** we are building it.
2. Explain how it connects to future phases.
3. Identify potential technical debt and how to avoid it.
4. Define the API contract, database changes, and frontend impact.
5. Create an implementation plan and **wait for user approval** before generating code.
