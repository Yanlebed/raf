# app/api/v1/endpoints/login.py

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
# from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.api import deps
from app.crud.user import authenticate_user

from app.schemas.token import Token

router = APIRouter()

from pydantic import BaseModel
class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/access-token", response_model=Token)
async def login_access_token(
        login: LoginRequest,
        db: AsyncSession = Depends(deps.get_db),
):
    user = await authenticate_user(db, phone=login.username, password=login.password)
    if not user:
        raise HTTPException(status_code=400, detail="Некорректный телефон или пароль")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = await security.create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": token, "token_type": "bearer"}
