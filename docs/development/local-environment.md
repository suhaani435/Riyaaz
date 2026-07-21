# Local environment

## Prerequisites

- Docker Desktop with Docker Compose v2 or later
- Node.js 24 and npm 11 for direct web development
- Python 3.13 for direct API development

## Start the container stack

Create a local environment file and replace the example password:

```powershell
Copy-Item .env.example .env
```

Start the services:

```powershell
docker compose up --build
```

The web application is available at `http://localhost:3010`; the API liveness
endpoint is `http://localhost:8010/api/v1/health`. PostgreSQL is reachable only
from the local machine at the configured port (default `5433` to avoid a
common local PostgreSQL conflict). The API and web defaults use `8010` and
`3010` to avoid common local development-port conflicts.

To stop the stack while retaining database data, run:

```powershell
docker compose down
```

Use `docker compose down --volumes` only when deliberately discarding local
database data.

## Health checks

The API health endpoint currently proves only that the HTTP process is running.
It does not verify PostgreSQL connectivity because no persistence module or
migration exists yet. A database-readiness probe will be added with the first
database-backed feature.

The Compose health checks enforce startup ordering for local development. They
are not a substitute for production observability or external uptime checks.

## Configuration contract

`.env.example` is the complete local Compose contract. Do not commit `.env`.
Production configuration will use deployment-platform secret storage and will
not reuse the local password or port bindings.
