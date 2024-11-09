from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.api import deps
from app.crud.user import authenticate

from app.schemas.token import Token

router = APIRouter()

@router.post("/access-token", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
):
    user = authenticate(db, phone=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Некорректный телефон или пароль")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": token, "token_type": "bearer"}
