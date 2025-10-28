from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Sequence, Optional as Opt
from sqlalchemy import select
from sqlalchemy.orm import joinedload
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
    # Prefer owner linkage if present; fall back to associated users
    q_owner_user = (
        select(Service)
        .options(joinedload(Service.owner_user))
        .join(User, User.id == Service.owner_user_id, isouter=True)
        .join(Location, Location.id == User.location_id, isouter=True)
        .where(Location.city == city)
    )
    q_owner_org = (
        select(Service)
        .options(joinedload(Service.owner_org))
        .join(Organization, Organization.id == Service.owner_org_id, isouter=True)
        .join(Location, Location.id == Organization.location_id, isouter=True)
        .where(Location.city == city)
    )
    if q:
        q_owner_user = q_owner_user.where(
            (Service.name.ilike(f"%{q}%")) | (Service.description.ilike(f"%{q}%"))
        )
        q_owner_org = q_owner_org.where(
            (Service.name.ilike(f"%{q}%")) | (Service.description.ilike(f"%{q}%"))
        )
    # Union results and paginate in Python (simple approach for now)
    owner_user_services = (await db.execute(q_owner_user)).scalars().all()
    owner_org_services = (await db.execute(q_owner_org)).scalars().all()
    combined = owner_user_services + [s for s in owner_org_services if s not in owner_user_services]
    return combined[skip: skip + limit]


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
