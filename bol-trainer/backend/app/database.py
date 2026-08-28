"""
SQLAlchemy engine and session setup.

Phase: Project Foundation
This wires up SQLite + SQLAlchemy so later phases can add models
(bols, sessions, attempts, etc.) without re-plumbing the DB layer.
No tables are defined yet — Base is exported for future models.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency for a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
