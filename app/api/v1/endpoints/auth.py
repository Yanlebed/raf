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
