# raf/tests/test_sms.py

import pytest
from unittest.mock import AsyncMock
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.utils.sms import send_sms_code
from app.models.phone_verification import PhoneVerification

@pytest.mark.asyncio
async def test_send_sms_code(db: AsyncSession, mocker):
    phone_number = "+1234567890"

    # Мокируем Twilio Client
    mock_twilio_client = mocker.patch("app.utils.sms.Client", autospec=True)
    mock_messages = mock_twilio_client.return_value.messages
    mock_messages.create = AsyncMock(return_value=AsyncMock(sid="SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"))

    await send_sms_code(db, phone_number)

    # Проверяем, что код сохранен в базе данных
    verification = await db.execute(select(PhoneVerification).where(PhoneVerification.phone_number == phone_number))
    verification = verification.scalars().first()
    assert verification is not None
    assert len(verification.verification_code) == 6

    # Проверяем, что Twilio Client был вызван
    mock_twilio_client.assert_called_once()
    mock_messages.create.assert_called_once_with(
        body=pytest.ANY,  # Вы можете уточнить содержание сообщения
        from_=pytest.ANY,
        to=phone_number
    )
