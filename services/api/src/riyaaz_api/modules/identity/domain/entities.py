"""Domain entities and value objects for identity module."""

import uuid
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class Role(StrEnum):
    """User authorization roles."""

    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


@dataclass(frozen=True)
class User:
    """User domain entity."""

    id: uuid.UUID
    email: str
    full_name: str
    role: Role
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime
