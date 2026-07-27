"""Presentation HTTP routes for identity module."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from riyaaz_api.database import db_manager
from riyaaz_api.modules.identity.application.use_cases import (
    GetProfileUseCase,
    SyncUserCommand,
    SyncUserUseCase,
    UpdateProfileCommand,
    UpdateProfileUseCase,
)
from riyaaz_api.modules.identity.domain.entities import User
from riyaaz_api.modules.identity.infrastructure.repositories import (
    SQLAlchemyUserRepository,
)
from riyaaz_api.modules.identity.presentation.dependencies import (
    get_current_user,
    get_current_user_claims,
)
from riyaaz_api.modules.identity.presentation.schemas import (
    SyncUserRequest,
    UpdateProfileRequest,
    UserProfileResponse,
)

router = APIRouter(prefix="/identity", tags=["identity"])


@router.post(
    "/sync",
    response_model=UserProfileResponse,
    summary="Synchronize authenticated user with database profile",
)
async def sync_user_profile(
    body: SyncUserRequest,
    claims: dict[str, object] = Depends(get_current_user_claims),
    session: AsyncSession = Depends(db_manager.session),
) -> UserProfileResponse:
    """Synchronize user claims from Supabase Auth into PostgreSQL."""
    import uuid

    user_id = uuid.UUID(str(claims["sub"]))
    email = str(claims.get("email", ""))

    command = SyncUserCommand(
        user_id=user_id,
        email=email,
        full_name=body.full_name,
        role=body.role,
        avatar_url=body.avatar_url,
    )

    user_repo = SQLAlchemyUserRepository(session)
    use_case = SyncUserUseCase(user_repo)
    user = await use_case.execute(command)

    return UserProfileResponse.from_domain(user)


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(db_manager.session),
) -> UserProfileResponse:
    """Return the profile of the currently authenticated user."""
    user_repo = SQLAlchemyUserRepository(session)
    use_case = GetProfileUseCase(user_repo)
    user = await use_case.execute(current_user.id)

    return UserProfileResponse.from_domain(user)


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    summary="Update current user profile",
)
async def update_my_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(db_manager.session),
) -> UserProfileResponse:
    """Update profile attributes for current user."""
    command = UpdateProfileCommand(
        user_id=current_user.id,
        full_name=body.full_name,
        role=body.role,
        avatar_url=body.avatar_url,
    )

    user_repo = SQLAlchemyUserRepository(session)
    use_case = UpdateProfileUseCase(user_repo)
    user = await use_case.execute(command)

    return UserProfileResponse.from_domain(user)
