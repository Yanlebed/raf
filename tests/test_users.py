# raf/tests/test_users.py

import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_user(async_client: AsyncClient, db):
    response = await async_client.post(
        "/api/v1/users/",
        json={
            "user_type": "CLIENT",
            "phone": "+71234567890",
            "password": "testpassword",
            "email": "testuser@example.com",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200  # Возможно, должно быть 201 Created
    data = response.json()
    assert data["phone"] == "+71234567890"
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
