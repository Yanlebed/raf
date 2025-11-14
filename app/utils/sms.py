# app/utils/sms.py

from datetime import datetime, timezone, timedelta
from random import randint
import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

from app.core.config import settings
from app.models.phone_verification import PhoneVerification


async def send_sms_code(db: AsyncSession, phone_number: str) -> str:
    """
    Generate and store an OTP code, then send it via Twilio in a background thread
    so we don't block the main event loop. Returns the Twilio message SID on success.
    """
    code = str(randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.SMS_CODE_EXPIRE_MINUTES)

    # Сохраняем код в базе данных
    verification = PhoneVerification(
        phone_number=phone_number,
        verification_code=code,
        expires_at=expires_at,
    )
    db.add(verification)
    await db.commit()

    async def _send() -> str:
        def _send_blocking() -> str:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f"Ваш код подтверждения: {code}",
                from_=settings.TWILIO_FROM_NUMBER,
                to=phone_number,
            )
            return message.sid

        try:
            # Run the blocking Twilio call in a thread to avoid blocking the event loop
            return await asyncio.to_thread(_send_blocking)
        except TwilioException as e:
            logging.error("Twilio error while sending SMS to %s: %s", phone_number, e)
            raise
        except Exception as e:  # pragma: no cover - defensive logging
            logging.exception("Unexpected error while sending SMS to %s", phone_number)
            raise

    return await _send()

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
