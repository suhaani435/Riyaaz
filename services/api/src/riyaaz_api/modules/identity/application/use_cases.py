"""Application use cases for identity module."""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime

from riyaaz_api.modules.identity.application.ports import UserRepositoryPort
from riyaaz_api.modules.identity.domain.entities import Role, User
from riyaaz_api.modules.identity.domain.errors import UserNotFoundError


@dataclass(frozen=True)
class SyncUserCommand:
    """Command to synchronize a user profile from auth identity claims."""

    user_id: uuid.UUID
    email: str
    full_name: str
    role: Role = Role.STUDENT
    avatar_url: str | None = None


@dataclass(frozen=True)
class UpdateProfileCommand:
    """Command to update user profile information."""

    user_id: uuid.UUID
    full_name: str | None = None
    role: Role | None = None
    avatar_url: str | None = None


class SyncUserUseCase:
    """Synchronize user metadata from Auth identity token into system database."""

    def __init__(self, user_repo: UserRepositoryPort) -> None:
        self._user_repo = user_repo

    async def execute(self, command: SyncUserCommand) -> User:
        existing_user = await self._user_repo.get_by_id(command.user_id)
        now = datetime.now(UTC)

        if existing_user is None:
            new_user = User(
                id=command.user_id,
                email=command.email,
                full_name=command.full_name or command.email.split("@")[0],
                role=command.role,
                avatar_url=command.avatar_url,
                created_at=now,
                updated_at=now,
            )
            return await self._user_repo.save(new_user)

        # Update email/name if changed
        updated_user = User(
            id=existing_user.id,
            email=command.email,
            full_name=command.full_name or existing_user.full_name,
            role=existing_user.role,  # Retain existing database role
            avatar_url=command.avatar_url or existing_user.avatar_url,
            created_at=existing_user.created_at,
            updated_at=now,
        )
        return await self._user_repo.save(updated_user)


class GetProfileUseCase:
    """Retrieve user profile by identifier."""

    def __init__(self, user_repo: UserRepositoryPort) -> None:
        self._user_repo = user_repo

    async def execute(self, user_id: uuid.UUID) -> User:
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(str(user_id))
        return user


class UpdateProfileUseCase:
    """Update profile attributes for an existing user."""

    def __init__(self, user_repo: UserRepositoryPort) -> None:
        self._user_repo = user_repo

    async def execute(self, command: UpdateProfileCommand) -> User:
        existing = await self._user_repo.get_by_id(command.user_id)
        if existing is None:
            raise UserNotFoundError(str(command.user_id))

        now = datetime.now(UTC)
        updated = User(
            id=existing.id,
            email=existing.email,
            full_name=command.full_name if command.full_name is not None else existing.full_name,
            role=command.role if command.role is not None else existing.role,
            avatar_url=command.avatar_url
            if command.avatar_url is not None
            else existing.avatar_url,
            created_at=existing.created_at,
            updated_at=now,
        )
        return await self._user_repo.save(updated)
