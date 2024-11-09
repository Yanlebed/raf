from typing import Optional, Type
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def get_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def get_appointments(db: Session, skip: int = 0, limit: int = 100) -> list[Type[Appointment]]:
    return db.query(Appointment).offset(skip).limit(limit).all()


def get_appointments_by_client(db: Session, client_id: int, skip: int = 0, limit: int = 100) -> list[Type[Appointment]]:
    return db.query(Appointment).filter(Appointment.client_id == client_id).offset(skip).limit(limit).all()


def get_appointments_by_master(db: Session, master_id: int, skip: int = 0, limit: int = 100) -> list[Type[Appointment]]:
    return db.query(Appointment).filter(Appointment.master_id == master_id).offset(skip).limit(limit).all()


def create_appointment(db: Session, appointment_in: AppointmentCreate) -> Appointment:
    db_appointment = Appointment(
        master_id=appointment_in.master_id,
        client_id=appointment_in.client_id,
        service_id=appointment_in.service_id,
        appointment_date=appointment_in.appointment_date,
        confirmation_status=appointment_in.confirmation_status,
        payment_method=appointment_in.payment_method,
        payment_status=appointment_in.payment_status,
        client_notes=appointment_in.client_notes,
        master_notes=appointment_in.master_notes,
        service_location=appointment_in.service_location,
        reminders=appointment_in.reminders,
        quantity=appointment_in.quantity,
        price=appointment_in.price,
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def update_appointment(db: Session, db_appointment: Appointment, appointment_in: AppointmentUpdate) -> Appointment:
    update_data = appointment_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_appointment, field, value)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def delete_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment
