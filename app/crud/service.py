from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Sequence
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


async def get_service(db: AsyncSession, service_id: int) -> Optional[Service]:
    result = await db.execute(select(Service).where(Service.id == service_id))
    return result.scalars().first()


async def get_services(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Service]:
    result = await db.execute(select(Service).offset(skip).limit(limit))
    return result.scalars().all()


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
