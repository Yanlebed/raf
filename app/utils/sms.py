from datetime import datetime, timedelta
from random import randint
from sqlalchemy.orm import Session
from twilio.rest import Client

from app.core.config import settings
from app.models.phone_verification import PhoneVerification


def send_sms_code(db: Session, phone_number: str):
    code = str(randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=settings.SMS_CODE_EXPIRE_MINUTES)

    # Сохраняем код в базе данных
    verification = PhoneVerification(
        phone_number=phone_number,
        verification_code=code,
        expires_at=expires_at
    )
    db.merge(verification)  # Используем merge для обновления или вставки
    db.commit()

    # Отправляем SMS через Twilio
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Ваш код подтверждения: {code}",
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone_number
    )
    return message.sid


def verify_sms_code(db: Session, phone_number: str, code: str) -> bool:
    verification = db.query(PhoneVerification).filter(
        PhoneVerification.phone_number == phone_number,
        PhoneVerification.verification_code == code,
        PhoneVerification.expires_at > datetime.utcnow()
    ).first()
    if verification:
        db.delete(verification)
        db.commit()
        return True
    return False
