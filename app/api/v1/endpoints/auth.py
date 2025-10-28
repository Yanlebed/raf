# app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.user import authenticate_user
from app.api.deps import get_db
from app.schemas.token import Token
from app.utils.sms import send_sms_code, verify_sms_code
from app.crud.user import get_user_by_phone, create_new_user
from app.schemas.user import UserCreate
from app.core.enums import UserType

router = APIRouter()

from pydantic import BaseModel


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
    return {"access_token": access_token, "token_type": "bearer"}


class SendOtpRequest(BaseModel):
    phone: str


@router.post("/send-otp")
async def send_otp(
        *,
        payload: SendOtpRequest,
        db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_phone(db, phone=payload.phone)
    if not user:
        # Auto-create minimal client account for OTP flow
        user = await create_new_user(db, UserCreate(user_type=UserType.CLIENT, phone=payload.phone, password="temp"))
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
):
    is_verified = await verify_sms_code(db, payload.phone, payload.code)
    if not is_verified:
        raise HTTPException(status_code=400, detail="Неверный или истекший код")
    user = await get_user_by_phone(db, phone=payload.phone)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = await create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
