from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


async def get_appointment(db: AsyncSession, appointment_id: int) -> Optional[Appointment]:
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    return result.scalars().first()


async def get_appointments(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Appointment]:
    result = await db.execute(select(Appointment).offset(skip).limit(limit))
    return result.scalars().all()


async def get_appointments_by_client(db: AsyncSession, client_id: int, skip: int = 0, limit: int = 100) -> Sequence[
    Appointment]:
    result = await db.execute(select(Appointment).where(Appointment.client_id == client_id).offset(skip).limit(limit))
    return result.scalars().all()


async def get_appointments_by_master(db: AsyncSession, master_id: int, skip: int = 0, limit: int = 100) -> Sequence[
    Appointment]:
    result = await db.execute(select(Appointment).where(Appointment.master_id == master_id).offset(skip).limit(limit))
    return result.scalars().all()


async def create_new_appointment(db: AsyncSession, appointment_in: AppointmentCreate) -> Appointment:
    db_appointment = Appointment(**appointment_in.dict())
    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment


async def update_an_appointment(db: AsyncSession, db_appointment: Appointment,
                             appointment_in: AppointmentUpdate) -> Appointment:
    update_data = appointment_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_appointment, field, value)
    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment


async def delete_appointment(db: AsyncSession, appointment_id: int) -> Optional[Appointment]:
    db_appointment = await get_appointment(db, appointment_id)
    if db_appointment:
        await db.delete(db_appointment)
        await db.commit()
    return db_appointment
