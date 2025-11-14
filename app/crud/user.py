# app/crud/user.py

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from sqlalchemy import select, and_, or_
from typing import Sequence, Optional

from app.models.user import User
from app.core.enums import UserType
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from app.models.location import Location
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.utils.locations import normalize_city_label


async def get_some_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_user_by_phone(db: AsyncSession, phone: str):
    result = await db.execute(select(User).where(User.phone == phone))
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def create_new_user(db: AsyncSession, user_in: UserCreate):
    hashed_password = await get_password_hash(user_in.password)
    # Resolve location by city if provided
    location_id = None
    normalized_city = normalize_city_label(user_in.city)
    if normalized_city:
        loc_row = (await db.execute(select(Location).where(Location.city == normalized_city))).scalars().first()
        if loc_row:
            location_id = loc_row.id
    db_user = User(
        user_type=user_in.user_type,
        phone=user_in.phone,
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password,
        city=normalized_city or user_in.city,
        address=user_in.address,
        location_id=location_id,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_some_user(db: AsyncSession, db_user: User, user_in: UserUpdate):
    update_data = user_in.dict(exclude_unset=True)
    if update_data.get("password"):
        hashed_password = await get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user(db: AsyncSession, user_id: int):
    db_user = await get_some_user(db, user_id)
    if db_user:
        await db.delete(db_user)
        await db.commit()
    return db_user

async def authenticate_user(db: AsyncSession, phone: str, password: str) -> Optional[User]:
    print('Authenticating user')
    print('Phone: ', phone)
    print('Password: ', password)
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()
    if not user:
        print("Authentication Failed: User not found")
        return None
    else:
        print(f"Authentication: User found - {user.phone}")

    if not verify_password(password, user.hashed_password):
        print("Authentication Failed: Incorrect password")
        return None

    print("Authentication Successful")
    return user


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


async def get_professionals_by_city(db: AsyncSession, city: str, skip: int = 0, limit: int = 100, q: Optional[str] = None) -> Sequence[User]:
    result = await db.execute(
        select(User)
        .options(joinedload(User.location))
        .join(Location, Location.id == User.location_id, isouter=True)
        .where(
            and_(
                User.user_type.in_([UserType.MASTER, UserType.SALON]),
                Location.city == city,
                or_(User.name.ilike(f"%{q}%"), User.short_description.ilike(f"%{q}%")) if q else True,
            )
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def count_professionals_by_city(db: AsyncSession, city: str, q: Optional[str] = None) -> int:
    stmt = (
        select(func.count(User.id))
        .join(Location, Location.id == User.location_id, isouter=True)
        .where(
            and_(
                User.user_type.in_([UserType.MASTER, UserType.SALON]),
                Location.city == city,
                or_(User.name.ilike(f"%{q}%"), User.short_description.ilike(f"%{q}%")) if q else True,
            )
        )
    )
    return (await db.execute(stmt)).scalar_one()
