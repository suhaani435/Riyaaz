"""Shared test fixtures for integration tests."""

import pytest
from httpx import ASGITransport, AsyncClient

from riyaaz_api.config import Settings
from riyaaz_api.database import db_manager
from riyaaz_api.main import create_app


@pytest.fixture()
def test_settings() -> Settings:
    """Settings configured for integration tests.

    Uses an in-process SQLite database so tests run without an external
    PostgreSQL instance.  Features that require PostgreSQL-specific
    behaviour should use a separate fixture with a real database.
    """
    return Settings(
        database_url="sqlite+aiosqlite:///",
        environment="local",
        log_level="WARNING",
        cors_origins=["http://localhost:3010"],
    )


@pytest.fixture()
async def client(test_settings: Settings) -> AsyncClient:
    """Async HTTP client bound to the test application.

    Manually starts the database session manager so that endpoints
    depending on a database session work correctly.  The ASGI transport
    does not invoke the application lifespan, so we replicate the
    essential startup/shutdown steps here.
    """
    app = create_app(settings=test_settings)

    db_manager.startup(test_settings.database_url)
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac
    finally:
        await db_manager.shutdown()
