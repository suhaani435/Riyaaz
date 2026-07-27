"""SQLAlchemy implementation of UserRepositoryPort."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from riyaaz_api.modules.identity.application.ports import UserRepositoryPort
from riyaaz_api.modules.identity.domain.entities import Role, User
from riyaaz_api.modules.identity.infrastructure.models import UserModel


class SQLAlchemyUserRepository(UserRepositoryPort):
    """PostgreSQL persistence repository for users."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            full_name=model.full_name,
            role=Role(model.role),
            avatar_url=model.avatar_url,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def save(self, user: User) -> User:
        stmt = select(UserModel).where(UserModel.id == user.id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        now = datetime.now(UTC)

        if model is None:
            model = UserModel(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role.value,
                avatar_url=user.avatar_url,
                created_at=user.created_at or now,
                updated_at=user.updated_at or now,
            )
            self._session.add(model)
        else:
            model.email = user.email
            model.full_name = user.full_name
            model.role = user.role.value
            model.avatar_url = user.avatar_url
            model.updated_at = now

        await self._session.flush()
        return self._to_entity(model)
