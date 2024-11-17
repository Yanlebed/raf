# raf/tests/test_sms.py

import pytest
from unittest.mock import Mock
from sqlalchemy import select  # Обновлённый импорт для SQLAlchemy 2.0+
from app.utils.sms import send_sms_code
from app.models.phone_verification import PhoneVerification
from app.core.config import settings


@pytest.mark.asyncio
async def test_send_sms_code(db, mocker):
    phone_number = "+1234567890"

    # Mock Twilio Client
    mock_twilio_client = mocker.patch("app.utils.sms.Client", autospec=True)
    mock_messages = mock_twilio_client.return_value.messages
    mock_messages.create.return_value = Mock(sid="SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    await send_sms_code(db, phone_number)

    # Verify that the code is saved in the database
    result = await db.execute(select(PhoneVerification).where(PhoneVerification.phone_number == phone_number))
    verification = result.scalars().first()
    assert verification is not None
    assert len(verification.verification_code) == 6

    # Verify that Twilio Client was called
    mock_messages.create.assert_called_once_with(
        body=f"Ваш код подтверждения: {verification.verification_code}",
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone_number
    )