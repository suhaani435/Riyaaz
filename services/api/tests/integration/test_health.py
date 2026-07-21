"""Integration tests for the liveness and readiness health endpoints."""

from httpx import AsyncClient


async def test_health_endpoint_returns_liveness_contract(client: AsyncClient) -> None:
    """The liveness probe responds without checking dependencies."""
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_readiness_endpoint_reports_database_status(client: AsyncClient) -> None:
    """The readiness probe includes a database connectivity indicator."""
    response = await client.get("/api/v1/health/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] in ("ok", "degraded")
    assert body["database"] in ("connected", "unavailable")


async def test_health_response_includes_correlation_id(client: AsyncClient) -> None:
    """Every response carries an X-Correlation-ID header from the middleware."""
    response = await client.get("/api/v1/health")

    assert "x-correlation-id" in response.headers
    assert len(response.headers["x-correlation-id"]) > 0
