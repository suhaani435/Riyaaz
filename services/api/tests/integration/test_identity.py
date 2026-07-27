"""Integration tests for identity module presentation routes."""

import uuid

import jwt
import pytest
from httpx import AsyncClient

from riyaaz_api.config import Settings


def _create_mock_jwt(
    user_id: uuid.UUID,
    email: str,
    secret_key: str,
    full_name: str = "Test Student",
) -> str:
    """Generate a signed mock JWT token for testing."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "user_metadata": {"full_name": full_name},
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


@pytest.mark.asyncio
async def test_sync_user_profile_success(client: AsyncClient, test_settings: Settings) -> None:
    user_id = uuid.uuid4()
    email = "kathak.student@riyaaz.app"
    token = _create_mock_jwt(user_id, email, test_settings.supabase_jwt_secret)

    response = await client.post(
        "/api/v1/identity/sync",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Suhaani Sharma",
            "role": "student",
            "avatar_url": "https://riyaaz.app/avatars/suhaani.jpg",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["email"] == email
    assert data["full_name"] == "Suhaani Sharma"
    assert data["role"] == "student"


@pytest.mark.asyncio
async def test_get_my_profile_authenticated(client: AsyncClient, test_settings: Settings) -> None:
    user_id = uuid.uuid4()
    email = "teacher.riya@riyaaz.app"
    token = _create_mock_jwt(user_id, email, test_settings.supabase_jwt_secret)

    # First sync user
    await client.post(
        "/api/v1/identity/sync",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Guru Riya", "role": "teacher"},
    )

    # Fetch profile
    response = await client.get(
        "/api/v1/identity/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["email"] == email
    assert data["full_name"] == "Guru Riya"
    assert data["role"] == "teacher"


@pytest.mark.asyncio
async def test_update_my_profile(client: AsyncClient, test_settings: Settings) -> None:
    user_id = uuid.uuid4()
    email = "student.update@riyaaz.app"
    token = _create_mock_jwt(user_id, email, test_settings.supabase_jwt_secret)

    # Sync
    await client.post(
        "/api/v1/identity/sync",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Original Name", "role": "student"},
    )

    # Patch update
    response = await client.patch(
        "/api/v1/identity/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Updated Name", "role": "teacher"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["role"] == "teacher"


@pytest.mark.asyncio
async def test_identity_unauthorized_without_token(
    client: AsyncClient,
) -> None:
    response = await client.get("/api/v1/identity/me")
    assert response.status_code == 403 or response.status_code == 401
