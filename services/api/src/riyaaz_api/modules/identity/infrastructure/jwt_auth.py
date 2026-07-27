"""PyJWT adapter for verifying Supabase auth JWT tokens."""

import jwt

from riyaaz_api.modules.identity.application.ports import AuthProviderPort
from riyaaz_api.modules.identity.domain.errors import InvalidTokenError


class PyJWTAuthProvider(AuthProviderPort):
    """Verifies JWT tokens issued by Supabase Auth using secret key or JWKS."""

    def __init__(self, secret_key: str, algorithm: str = "HS256") -> None:
        self._secret_key = secret_key
        self._algorithm = algorithm

    async def verify_token(self, token: str) -> dict[str, object]:
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
                options={"verify_aud": False},
            )
            return payload
        except jwt.PyJWTError as exc:
            raise InvalidTokenError(f"JWT verification failed: {exc}") from exc
