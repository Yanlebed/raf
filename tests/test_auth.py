# raf/tests/test_auth.py

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_access_token(async_client: AsyncClient, db):
    # Предварительно создайте пользователя в базе данных
    from app.models.user import User, UserType
    from app.core.security import get_password_hash

    test_user = User(
        phone="+71234567890",
        email="testuser@example.com",
        full_name="Test User",
        hashed_password=await get_password_hash("testpassword"),
        user_type=UserType.CLIENT,
        is_active=True
    )
    db.add(test_user)
    await db.commit()
    await db.refresh(test_user)

    response = await async_client.post(
        "/api/v1/login/access-token",
        json={"phone": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
