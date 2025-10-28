# api/v1/endpoints/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.crud.user import get_some_user, get_user_by_phone, create_new_user, get_users, get_user_by_email, update_some_user
from app.api import deps
from app.schemas.user import User, UserCreate, UserStatus
from app.core.config import settings
from app.utils.sms import send_sms_code

from fastapi import BackgroundTasks, status
from app.utils.email import send_email
from app.utils.security import generate_email_confirmation_token, verify_email_confirmation_token

router = APIRouter()


@router.get("/me", response_model=User)
async def read_user_me(
        current_user: "User" = Depends(deps.get_current_active_user),
):
    return current_user


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
        *,
        db: AsyncSession = Depends(deps.get_db),
        user_in: UserCreate,
        background_tasks: BackgroundTasks,
):
    user = await get_user_by_phone(db, phone=user_in.phone)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким телефоном уже существует.",
        )
    user = await create_new_user(db=db, user_in=user_in)
    # Отправка SMS-кода для подтверждения номера телефона
    await send_sms_code(db, user.phone)
    # Отправка подтверждения на email, если указан
    if user.email:
        token = await generate_email_confirmation_token(user.email)
        confirmation_url = f"{settings.SERVER_HOST}/confirm-email?token={token}"
        await send_email(
            background_tasks,
            subject_template="Подтверждение регистрации",
            html_template="confirmation.html",
            recipient=user.email,
            context={
                "name": user.name or user.phone,
                "confirmation_url": confirmation_url,
                "app_name": settings.PROJECT_NAME,
            },
        )
    return user


@router.get("/confirm-email")
async def confirm_email(
        token: str,
        db: AsyncSession = Depends(deps.get_db)
):
    email = await verify_email_confirmation_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Неверный или истекший токен")
    user = await get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.status = UserStatus.ACTIVE
    db.add(user)
    await db.commit()
    return {"msg": "Электронная почта успешно подтверждена"}


@router.get("/", response_model=List[User])
async def read_users(
        db: AsyncSession = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
):
    users = await get_users(db, skip=skip, limit=limit)
    return users


@router.get("/get_user_by_id", response_model=User)
async def get_user(
        user_id: int,
        db: AsyncSession = Depends(deps.get_db),
):
    user = await get_some_user(db, user_id=user_id)
    return user


# Добавьте эндпоинты для получения пользователя по ID, обновления и удаления ###???
