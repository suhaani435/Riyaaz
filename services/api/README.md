# RIYAAZ API

The API is a FastAPI modular monolith. It composes feature modules through
`riyaaz_api.main:create_app` and exposes public HTTP contracts beneath
`/api/v1`.

## Health endpoint

`GET /api/v1/health` is a liveness endpoint for local tooling and deployment
platforms. It returns `200 OK` with `{ "status": "ok" }` when the process is
running. It intentionally does not imply database or provider readiness.

## Local commands

Create a virtual environment, install the project with its development
dependencies, then run:

```text
pytest
uvicorn riyaaz_api.main:app --reload
```
