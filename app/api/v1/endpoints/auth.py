# app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime, timezone
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.crud.user import authenticate_user
from app.api.deps import get_db
from app.schemas.token import Token
from app.utils.sms import send_sms_code, verify_sms_code
from app.utils.redis_client import incr_with_ttl
from app.crud.user import get_user_by_phone, create_new_user
from app.schemas.user import UserCreate
from app.core.enums import UserType
from sqlalchemy.future import select
from sqlalchemy import and_, func
from app.models.phone_verification import PhoneVerification
from app.models.otp_attempt import OtpAttempt
from jose import jwt, JWTError

router = APIRouter()

from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login/access-token", response_model=Token)
async def login_access_token(
        login: LoginRequest,
        db: AsyncSession = Depends(get_db),
):
    user = await authenticate_user(db, login.username, login.password)
    if not user:
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = await create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    refresh_token = await create_refresh_token(data={"user_id": user.id}, db=db)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}


class SendOtpRequest(BaseModel):
    phone: str


@router.post("/send-otp")
async def send_otp(
        *,
        payload: SendOtpRequest,
        db: AsyncSession = Depends(get_db),
        request: Request,
):
    user = await get_user_by_phone(db, phone=payload.phone)
    if not user:
        # Auto-create minimal client account for OTP flow
        user = await create_new_user(db, UserCreate(user_type=UserType.CLIENT, phone=payload.phone, password="temp"))
    # Rate limit sends per hour
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    sends_last_hour = (await db.execute(
        select(func.count(PhoneVerification.id)).where(
            and_(PhoneVerification.phone_number == payload.phone, PhoneVerification.created_at >= one_hour_ago)
        )
    )).scalar_one()
    if sends_last_hour >= settings.OTP_MAX_SENDS_PER_HOUR:
        raise HTTPException(status_code=429, detail="Превышен лимит отправки кодов. Попробуйте позже.")
    # IP throttling via Redis (if configured)
    ip = request.client.host if request.client else "unknown"
    count_ip = await incr_with_ttl(f"otp:send:{ip}", 3600)
    if count_ip and count_ip > settings.OTP_MAX_SENDS_PER_HOUR_IP:
        raise HTTPException(status_code=429, detail="Превышен лимит отправки с этого IP")
    await send_sms_code(db, payload.phone)
    return {"msg": "OTP sent"}


class OtpLoginRequest(BaseModel):
    phone: str
    code: str


@router.post("/otp", response_model=Token)
async def login_with_otp(
        *,
        payload: OtpLoginRequest,
        db: AsyncSession = Depends(get_db),
        request: Request,
):
    # Rate limit failed verifications per hour
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    failed = (await db.execute(
        select(func.count(OtpAttempt.id)).where(
            and_(OtpAttempt.phone_number == payload.phone, OtpAttempt.success == False, OtpAttempt.created_at >= one_hour_ago)
        )
    )).scalar_one()
    if failed >= settings.OTP_MAX_FAILED_VERIFICATIONS_PER_HOUR:
        raise HTTPException(status_code=429, detail="Слишком много неудачных попыток. Попробуйте позже.")

    is_verified = await verify_sms_code(db, payload.phone, payload.code)
    if not is_verified:
        ip = request.client.host if request.client else "unknown"
        failed_ip = await incr_with_ttl(f"otp:verify:{ip}", 3600)
        if failed_ip and failed_ip > settings.OTP_MAX_FAILED_PER_HOUR_IP:
            raise HTTPException(status_code=429, detail="Слишком много попыток с этого IP")
        db.add(OtpAttempt(phone_number=payload.phone, success=False))
        await db.commit()
        raise HTTPException(status_code=400, detail="Неверный или истекший код")
    user = await get_user_by_phone(db, phone=payload.phone)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = await create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    refresh_token = await create_refresh_token(data={"user_id": user.id}, db=db)
    db.add(OtpAttempt(phone_number=payload.phone, success=True))
    await db.commit()
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=Token)
async def refresh_access_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = jwt.decode(payload.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Некорректный токен")
        user_id = decoded.get("user_id")
        jti = decoded.get("jti")
        if not user_id:
            raise HTTPException(status_code=400, detail="Некорректный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Недействительный refresh токен")
    # Check token not revoked/expired
    from app.models.refresh_token import RefreshToken
    from sqlalchemy.future import select
    from datetime import datetime, timezone
    token_row = (await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))).scalars().first()
    if not token_row or token_row.revoked or token_row.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Недействительный refresh токен")
    # Rotate: revoke old, issue new
    token_row.revoked = True
    db.add(token_row)
    await db.commit()
    access_token = await create_access_token(data={"user_id": user_id})
    new_refresh = await create_refresh_token(data={"user_id": user_id}, db=db)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh}


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None
    all_devices: Optional[bool] = False


@router.post("/logout")
async def logout(
        *,
        payload: LogoutRequest,
        db: AsyncSession = Depends(get_db),
):
    token = payload.refresh_token
    if not token:
        raise HTTPException(status_code=400, detail="Refresh токен обязателен")
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Некорректный токен")
        user_id = decoded.get("user_id")
        jti = decoded.get("jti")
    except JWTError:
        raise HTTPException(status_code=401, detail="Недействительный refresh токен")
    from app.models.refresh_token import RefreshToken
    if payload.all_devices:
        await db.execute(
            RefreshToken.__table__.update().where(RefreshToken.user_id == user_id).values(revoked=True)
        )
    else:
        await db.execute(
            RefreshToken.__table__.update().where(RefreshToken.jti == jti).values(revoked=True)
        )
    await db.commit()
    return {"status": "logged_out"}
