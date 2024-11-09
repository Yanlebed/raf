from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, validator


class UserType(str, Enum):
    MASTER = "Мастер"
    CLIENT = "Клиент"
    SALON = "Салон"
    ADMIN = "Админ-персонал"


class UserStatus(str, Enum):
    ACTIVE = "Активный"
    DELETED = "Удален"
    UNCONFIRMED = "Не подтвержден"
    BLOCKED = "Заблокирован"


class UserBase(BaseModel):
    user_type: UserType
    phone: str
    is_phone_verified: Optional[bool] = False
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    short_description: Optional[str] = None
    status: Optional[UserStatus] = UserStatus.UNCONFIRMED
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @validator('name')
    def validate_name(cls, v, values):
        if values['user_type'] in [UserType.MASTER, UserType.SALON] and not v:
            raise ValueError('Имя обязательно для Мастера и Салона')
        return v

    @validator('email')
    def validate_email(cls, v, values):
        if values['user_type'] != UserType.CLIENT and not v:
            raise ValueError('Email обязателен для Мастера, Салона и Админа')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    short_description: Optional[str] = None
    status: Optional[UserStatus] = None


class UserInDBBase(UserBase):
    id: int

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str
