from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Sequence, Optional as Opt
from sqlalchemy import select
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import func, distinct
from app.models.service import Service
from app.models.user import User
from app.models.location import Location
from app.models.organization import Organization
from app.schemas.service import ServiceCreate, ServiceUpdate


async def get_service(db: AsyncSession, service_id: int) -> Optional[Service]:
    result = await db.execute(select(Service).where(Service.id == service_id))
    return result.scalars().first()


async def get_services(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Service]:
    result = await db.execute(select(Service).offset(skip).limit(limit))
    return result.scalars().all()


async def get_services_by_city(db: AsyncSession, city: str, skip: int = 0, limit: int = 100, q: Opt[str] = None) -> Sequence[Service]:
    # Single-query approach: join to owner_user and owner_org locations via aliases
    LUser = aliased(Location)
    LOrg = aliased(Location)
    stmt = (
        select(Service)
        .options(joinedload(Service.owner_user), joinedload(Service.owner_org))
        .outerjoin(User, User.id == Service.owner_user_id)
        .outerjoin(LUser, LUser.id == User.location_id)
        .outerjoin(Organization, Organization.id == Service.owner_org_id)
        .outerjoin(LOrg, LOrg.id == Organization.location_id)
        .where((LUser.city == city) | (LOrg.city == city))
        .offset(skip)
        .limit(limit)
    )
    if q:
        stmt = stmt.where((Service.name.ilike(f"%{q}%")) | (Service.description.ilike(f"%{q}%")))
    result = await db.execute(stmt)
    return result.scalars().all()


async def count_services_by_city(db: AsyncSession, city: str, q: Opt[str] = None) -> int:
    LUser = aliased(Location)
    LOrg = aliased(Location)
    stmt = (
        select(func.count(distinct(Service.id)))
        .outerjoin(User, User.id == Service.owner_user_id)
        .outerjoin(LUser, LUser.id == User.location_id)
        .outerjoin(Organization, Organization.id == Service.owner_org_id)
        .outerjoin(LOrg, LOrg.id == Organization.location_id)
        .where((LUser.city == city) | (LOrg.city == city))
    )
    if q:
        stmt = stmt.where((Service.name.ilike(f"%{q}%")) | (Service.description.ilike(f"%{q}%")))
    return (await db.execute(stmt)).scalar_one()


async def create_service(db: AsyncSession, service_in: ServiceCreate) -> Service:
    db_service = Service(**service_in.dict())
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service


async def update_service(db: AsyncSession, db_service: Service, service_in: ServiceUpdate) -> Service:
    for field, value in service_in.dict(exclude_unset=True).items():
        setattr(db_service, field, value)
    await db.commit()
    await db.refresh(db_service)
    return db_service


async def delete_service(db: AsyncSession, service_id: int) -> Optional[Service]:
    db_service = await get_service(db, service_id)
    if db_service:
        await db.delete(db_service)
        await db.commit()
    return db_service
