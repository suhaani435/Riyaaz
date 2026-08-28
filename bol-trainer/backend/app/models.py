"""
SQLAlchemy models.

Phase 2: SELECT BOL -> LISTEN
Adds the Composition model. No sessions, attempts, or user models
exist yet — those belong to later phases.
"""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Composition(Base):
    """
    A single bol composition (a short rhythmic phrase) that a student
    can select and listen to.

    reference_audio_url is nullable: real reference recordings do not
    exist yet, and the frontend must not fake playback when it is null.
    """

    __tablename__ = "compositions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    bols: Mapped[str] = mapped_column(String, nullable=False)
    taal: Mapped[str] = mapped_column(String, nullable=False)
    tempo: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    skill_focus: Mapped[str] = mapped_column(String, nullable=False)
    reference_audio_url: Mapped[str | None] = mapped_column(String, nullable=True)