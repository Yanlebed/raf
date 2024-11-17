# tests/test_users.py

import pytest
from httpx import AsyncClient
import uuid
from unittest.mock import patch

@patch("app.api.v1.endpoints.users.send_email")
@patch("app.api.v1.endpoints.users.send_sms_code")
@pytest.mark.asyncio
async def test_create_user(mock_send_sms_code, mock_send_email, async_client: AsyncClient, db):
    # Configure the mocks to do nothing
    mock_send_sms_code.return_value = None
    mock_send_email.return_value = None

    # Generate a unique phone number to avoid conflicts
    unique_phone = f"+7123456{uuid.uuid4().int % 1000000:06d}"

    response = await async_client.post(
        "/api/v1/users/",
        json={
            "user_type": "CLIENT",
            "name": "Test User",
            "phone": unique_phone,
            "password": "testpassword",
            "email": "testuser@example.com",
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    assert response.status_code == 201  # 201 Created

    # Optionally, verify the created user in the database
    from app.crud.user import get_user_by_phone
    user = await get_user_by_phone(db, phone=unique_phone)
    assert user is not None
    assert user.email == "testuser@example.com"
    assert user.name == "Test User"

    # Verify that send_sms_code and send_email were called
    mock_send_sms_code.assert_called_once_with(db, unique_phone)
    assert mock_send_email.called
