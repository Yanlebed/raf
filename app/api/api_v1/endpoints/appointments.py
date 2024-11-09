from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from pydantic import conint

from app.api import deps
from app.crud.appointment import create_new_appointment, delete_appointment, get_appointment, get_appointments, \
    get_appointments_by_client, \
    get_appointments_by_master, update_an_appointment
from app.models.user import User, UserType
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate

router = APIRouter()


@router.get("/", response_model=List[Appointment])
async def read_appointments(
        db: AsyncSession = Depends(deps.get_db),
        skip: int = 0,
        limit: conint(gt=0, le=100) = 100,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type == UserType.CLIENT:
        appointments = await get_appointments_by_client(db, client_id=current_user.id, skip=skip, limit=limit)
    elif current_user.user_type == UserType.MASTER:
        appointments = await get_appointments_by_master(db, master_id=current_user.id, skip=skip, limit=limit)
    else:
        appointments = await get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.post("/", response_model=Appointment)
async def create_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_in: AppointmentCreate,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.CLIENT:
        raise HTTPException(status_code=400, detail="Только клиенты могут создавать записи.")
    appointment_in.client_id = current_user.id
    appointment = await create_new_appointment(db=db, appointment_in=appointment_in)
    return appointment


@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_id: int,
        appointment_in: AppointmentUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = await get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.id not in [appointment.client_id, appointment.master_id]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для обновления записи.")
    appointment = await update_an_appointment(db=db, db_appointment=appointment, appointment_in=appointment_in)
    return appointment


@router.delete("/{appointment_id}", response_model=Appointment)
async def delete_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = await get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.id != appointment.client_id and current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=400, detail="Недостаточно прав для удаления записи.")
    appointment = await delete_appointment(db=db, appointment_id=appointment_id)
    return appointment
