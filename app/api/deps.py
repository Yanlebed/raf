from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer

from app.models.user import User, UserStatus
from app.crud.user import get_some_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")

# Определение функции get_db
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Функция для получения текущего пользователя
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_some_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user

# Функция для получения текущего активного пользователя
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Пользователь не активен")
    return current_user
