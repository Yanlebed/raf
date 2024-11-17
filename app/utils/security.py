from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt

from app.core.config import settings


async def generate_email_confirmation_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode({"exp": exp, "nbf": now, "sub": email}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def verify_email_confirmation_token(token: str) -> Optional[str]:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded_token.get("sub")
    except jwt.JWTError:
        return None
