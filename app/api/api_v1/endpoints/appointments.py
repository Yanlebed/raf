from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from pydantic import conint

from app.api import deps
from app.crud.appointment import get_appointments, get_appointments_by_client, get_appointments_by_master
from app.models.user import User, UserType
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate

router = APIRouter()


@router.get("/", response_model=List[Appointment])
def read_appointments(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: conint(gt=0, le=100) = 100,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type == UserType.CLIENT:
        appointments = get_appointments_by_client(db, client_id=current_user.id, skip=skip, limit=limit)
    elif current_user.user_type == UserType.MASTER:
        appointments = get_appointments_by_master(db, master_id=current_user.id, skip=skip, limit=limit)
    else:
        appointments = get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.post("/", response_model=Appointment)
def create_appointment(
        *,
        db: Session = Depends(deps.get_db),
        appointment_in: AppointmentCreate,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.CLIENT:
        raise HTTPException(status_code=400, detail="Только клиенты могут создавать записи.")
    appointment_in.client_id = current_user.id
    appointment = crud.appointment.create_appointment(db=db, appointment_in=appointment_in)
    return appointment


@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment(
        *,
        db: Session = Depends(deps.get_db),
        appointment_id: int,
        appointment_in: AppointmentUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = crud.appointment.get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.id not in [appointment.client_id, appointment.master_id]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для обновления записи.")
    appointment = crud.appointment.update_appointment(db=db, db_appointment=appointment, appointment_in=appointment_in)
    return appointment


@router.delete("/{appointment_id}", response_model=Appointment)
def delete_appointment(
        *,
        db: Session = Depends(deps.get_db),
        appointment_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = crud.appointment.get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.id != appointment.client_id and current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=400, detail="Недостаточно прав для удаления записи.")
    appointment = crud.appointment.delete_appointment(db=db, appointment_id=appointment_id)
    return appointment
