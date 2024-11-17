# raf/tests/test_auth.py

import pytest
from httpx import AsyncClient

from app.main import app
from app.api import deps

@pytest.mark.asyncio
async def test_login_access_token(async_client: AsyncClient, db):
    # Override get_db dependency
    async def override_get_db():
        yield db

    app.dependency_overrides[deps.get_db] = override_get_db

    # Create a test user in the database
    from app.models.user import User, UserType
    from app.core.security import get_password_hash, verify_password

    hashed_password = await get_password_hash("testpassword")
    test_user = User(
        phone="+71234567890",
        email="testuser@example.com",
        name="Test User",
        hashed_password=hashed_password,
        user_type=UserType.CLIENT,
        is_active=True
    )
    db.add(test_user)
    await db.commit()
    await db.refresh(test_user)

    # Verify password hashing and verification
    assert verify_password("testpassword", test_user.hashed_password)

    response = await async_client.post(
        "/api/v1/login/access-token",
        json={"username": "+71234567890", "password": "testpassword"},
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    assert response.status_code == 200

    # Remove the override after the test
    app.dependency_overrides.pop(deps.get_db, None)