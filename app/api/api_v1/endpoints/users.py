from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.crud.user import get_user_by_phone, create_user, get_users, get_user_by_email
from app.api import deps
from app.schemas.user import User, UserCreate, UserStatus
from app.core.config import settings
from app.utils.sms import send_sms_code

from fastapi import BackgroundTasks
from app.utils.email import send_email
from app.utils.security import generate_email_confirmation_token, verify_email_confirmation_token

router = APIRouter()


@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
):
    user = get_user_by_phone(db, phone=user_in.phone)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким телефоном уже существует.",
        )
    user = create_user(db=db, user_in=user_in)
    # Отправка SMS-кода для подтверждения номера телефона
    send_sms_code(db, user.phone)
    # Отправка подтверждения на email, если указан
    if user.email:
        token = generate_email_confirmation_token(user.email)
        confirmation_url = f"{settings.SERVER_HOST}/confirm-email?token={token}"
        send_email(
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
def confirm_email(
        token: str,
        db: Session = Depends(deps.get_db)
):
    email = verify_email_confirmation_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Неверный или истекший токен")
    user = get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.status = UserStatus.ACTIVE
    db.add(user)
    db.commit()
    return {"msg": "Электронная почта успешно подтверждена"}


@router.get("/", response_model=List[User])
def read_users(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100
):
    users = get_users(db, skip=skip, limit=limit)
    return users

# Добавьте эндпоинты для получения пользователя по ID, обновления и удаления
