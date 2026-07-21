"""Async database engine, session factory, and FastAPI dependency.

This module owns the SQLAlchemy async connection pool and provides a
request-scoped session dependency for use in route handlers.  The engine
is created once at application startup and disposed on shutdown.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base for all RIYAAZ ORM models.

    Every model inherits from this class so that Alembic autogeneration can
    discover the full schema from a single metadata reference.
    """


class DatabaseSessionManager:
    """Manages the async engine and session factory lifecycle.

    Instantiated once per application process.  ``startup`` must be called
    before any session is created; ``shutdown`` disposes the connection pool.
    """

    def __init__(self) -> None:
        self._engine = None
        self._sessionmaker = None

    def startup(self, database_url: str) -> None:
        """Create the async engine and session factory."""
        engine_kwargs: dict[str, object] = {
            "echo": False,
            "pool_pre_ping": True,
        }
        # Connection-pool sizing is not supported by SQLite's StaticPool.
        if not database_url.startswith("sqlite"):
            engine_kwargs["pool_size"] = 10
            engine_kwargs["max_overflow"] = 20

        self._engine = create_async_engine(database_url, **engine_kwargs)
        self._sessionmaker = async_sessionmaker(
            bind=self._engine,
            expire_on_commit=False,
        )

    async def shutdown(self) -> None:
        """Dispose the engine and release all pooled connections."""
        if self._engine is not None:
            await self._engine.dispose()
            self._engine = None
            self._sessionmaker = None

    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """Yield a request-scoped async session.

        Commits on clean exit, rolls back on exception, and always closes
        the session.
        """
        if self._sessionmaker is None:
            raise RuntimeError(
                "DatabaseSessionManager has not been started. "
                "Call startup() before requesting a session."
            )
        async with self._sessionmaker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


db_manager = DatabaseSessionManager()
