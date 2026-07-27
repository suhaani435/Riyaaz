"""Application ports (interfaces) for identity module."""

import uuid
from typing import Protocol

from riyaaz_api.modules.identity.domain.entities import User


class UserRepositoryPort(Protocol):
    """Persistence port for managing user profiles."""

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Fetch user by ID."""
        ...

    async def get_by_email(self, email: str) -> User | None:
        """Fetch user by email address."""
        ...

    async def save(self, user: User) -> User:
        """Create or update a user entity."""
        ...


class AuthProviderPort(Protocol):
    """External identity provider port for verifying tokens."""

    async def verify_token(self, token: str) -> dict[str, object]:
        """Verify JWT token and return payload claim dictionary."""
        ...
