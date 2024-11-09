from typing import Optional

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate):
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        user_type=user_in.user_type,
        phone=user_in.phone,
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password,
        city=user_in.city,
        address=user_in.address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, user_in: UserUpdate):
    update_data = user_in.dict(exclude_unset=True)
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


def authenticate(db: Session, phone: str, password: str) -> Optional[User]:
    user = get_user_by_phone(db, phone=phone)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user



def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()
