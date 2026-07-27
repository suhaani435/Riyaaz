"""Application factory for the RIYAAZ API.

Composes infrastructure (settings, database, logging, middleware) and
feature presentation modules into a single FastAPI application.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from riyaaz_api.config import Environment, Settings
from riyaaz_api.database import db_manager
from riyaaz_api.logging import (
    CorrelationIdMiddleware,
    configure_logging,
    get_logger,
)
from riyaaz_api.modules.identity.presentation.routes import (
    router as identity_router,
)
from riyaaz_api.modules.system.presentation.routes import router as system_router


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown resources."""
    settings: Settings = app.state.settings
    logger = get_logger(component="lifespan")

    db_manager.startup(settings.database_url)
    logger.info("database_engine_started")

    yield

    await db_manager.shutdown()
    logger.info("database_engine_stopped")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create the HTTP application and compose its presentation modules.

    Args:
        settings: Optional pre-built settings, primarily for testing.
            Reads from environment when ``None``.
    """
    if settings is None:
        settings = Settings()

    configure_logging(
        json_output=settings.environment != Environment.LOCAL,
        log_level=settings.log_level,
    )

    app = FastAPI(
        title="RIYAAZ API",
        version="0.1.0",
        lifespan=_lifespan,
    )
    app.state.settings = settings

    # --- Middleware (applied in reverse registration order) ---
    app.add_middleware(CorrelationIdMiddleware)

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # --- Presentation modules ---
    app.include_router(system_router, prefix="/api/v1")
    app.include_router(identity_router, prefix="/api/v1")

    return app


app = create_app()
