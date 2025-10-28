# app/schemas/user.py

from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, root_validator
from app.core.enums import UserType, UserStatus


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
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    telegram_url: Optional[str] = None
    whatsapp: Optional[str] = None
    viber: Optional[str] = None

    class Config:
        orm_mode = True
        use_enum_values = True


class UserCreate(BaseModel):
    user_type: UserType
    phone: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    name: Optional[str] = None
    password: str
    city: Optional[str] = None
    is_phone_verified: bool = False
    address: Optional[str] = None
    short_description: Optional[str] = None
    status: Optional[UserStatus] = UserStatus.UNCONFIRMED
    avatar: Optional[str] = None

    @root_validator
    def validate_email(cls, values):
        user_type = values.get('user_type')
        email = values.get('email')
        if user_type != UserType.CLIENT and not email:
            raise ValueError("Email is required for this user type.")
        return values


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    short_description: Optional[str] = None
    status: Optional[UserStatus] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    telegram_url: Optional[str] = None
    whatsapp: Optional[str] = None
    viber: Optional[str] = None


class UserInDBBase(UserBase):
    id: int

    class Config:
        orm_mode = True
        use_enum_values = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str
