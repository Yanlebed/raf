# app/utils/sms.py

from datetime import datetime, timezone, timedelta
from random import randint

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from twilio.rest import Client

from app.core.config import settings
from app.models.phone_verification import PhoneVerification

async def send_sms_code(db: AsyncSession, phone_number: str):
    code = str(randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.SMS_CODE_EXPIRE_MINUTES)

    # Сохраняем код в базе данных
    verification = PhoneVerification(
        phone_number=phone_number,
        verification_code=code,
        expires_at=expires_at
    )
    db.add(verification)  # Используем add для создания новой записи
    await db.commit()

    # Отправляем SMS через Twilio
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Ваш код подтверждения: {code}",
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone_number
    )
    return message.sid

async def verify_sms_code(db: AsyncSession, phone_number: str, code: str) -> bool:
    result = await db.execute(
        select(PhoneVerification).where(
            PhoneVerification.phone_number == phone_number,
            PhoneVerification.verification_code == code,
            PhoneVerification.expires_at > datetime.now(timezone.utc)
        )
    )
    verification = result.scalars().first()
    if verification:
        await db.delete(verification)
        await db.commit()
        return True
    return False
