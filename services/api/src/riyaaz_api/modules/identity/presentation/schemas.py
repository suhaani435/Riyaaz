"""Pydantic request and response schemas for identity presentation layer."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from riyaaz_api.modules.identity.domain.entities import Role, User


class UserProfileResponse(BaseModel):
    """Public user profile response contract."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: Role
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, user: User) -> "UserProfileResponse":
        return cls(
            id=user.id,
            email=user.email,  # type: ignore[arg-type]
            full_name=user.full_name,
            role=user.role,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


class SyncUserRequest(BaseModel):
    """Request payload for syncing identity claims after login/signup."""

    full_name: str = Field(..., min_length=1, max_length=255)
    role: Role = Role.STUDENT
    avatar_url: str | None = None


class UpdateProfileRequest(BaseModel):
    """Request payload for updating user profile."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    role: Role | None = None
    avatar_url: str | None = None
