"""FastAPI dependencies for identity authentication and authorization."""

import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from riyaaz_api.database import db_manager
from riyaaz_api.modules.identity.domain.entities import Role, User
from riyaaz_api.modules.identity.domain.errors import InvalidTokenError
from riyaaz_api.modules.identity.infrastructure.jwt_auth import PyJWTAuthProvider
from riyaaz_api.modules.identity.infrastructure.repositories import (
    SQLAlchemyUserRepository,
)

security = HTTPBearer(auto_error=True)


async def get_current_user_claims(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, object]:
    """Verify JWT bearer token and return token claims."""
    token = credentials.credentials
    settings = request.app.state.settings
    auth_provider = PyJWTAuthProvider(secret_key=settings.supabase_jwt_secret)

    try:
        claims = await auth_provider.verify_token(token)
        return claims
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_user(
    claims: dict[str, object] = Depends(get_current_user_claims),
    session: AsyncSession = Depends(db_manager.session),
) -> User:
    """Fetch current authenticated user entity from database."""
    sub = claims.get("sub")
    if not sub or not isinstance(sub, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub claim",
        )

    try:
        user_id = uuid.UUID(sub)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
        ) from exc

    user_repo = SQLAlchemyUserRepository(session)
    user = await user_repo.get_by_id(user_id)

    if user is None:
        # User is authenticated in Supabase but not yet synced to system DB.
        # Fall back to creating transient entity from JWT claims so sync can succeed.
        email = str(claims.get("email", ""))
        user_metadata = claims.get("user_metadata", {})
        full_name = ""
        if isinstance(user_metadata, dict):
            full_name = str(user_metadata.get("full_name", ""))

        transient_user = User(
            id=user_id,
            email=email,
            full_name=full_name or email.split("@")[0] if email else "User",
            role=Role.STUDENT,
            avatar_url=None,
            created_at=None,  # type: ignore[arg-type]
            updated_at=None,  # type: ignore[arg-type]
        )
        return transient_user

    return user
