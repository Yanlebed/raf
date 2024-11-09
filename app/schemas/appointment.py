from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ConfirmationStatus(str, Enum):
    PENDING = "Ожидает подтверждения"
    CONFIRMED = "Подтверждена"
    CANCELED_BY_CLIENT = "Отменена клиентом"
    CANCELED_BY_MASTER = "Отменена мастером"
    COMPLETED = "Завершена"


class PaymentMethod(str, Enum):
    CASH = "Наличные"
    CARD = "Карта"
    ONLINE = "Онлайн-оплата"


class PaymentStatus(str, Enum):
    PAID = "Оплачено"
    NOT_PAID = "Не оплачено"
    PARTIALLY_PAID = "Частично оплачено"


class AppointmentBase(BaseModel):
    master_id: int
    client_id: int
    service_id: int
    appointment_date: datetime
    confirmation_status: Optional[ConfirmationStatus] = ConfirmationStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    payment_status: Optional[PaymentStatus] = PaymentStatus.NOT_PAID
    client_notes: Optional[str] = None
    master_notes: Optional[str] = None
    service_location: Optional[str] = None
    reminders: Optional[bool] = True
    quantity: Optional[int] = 1
    price: Optional[float] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    confirmation_status: Optional[ConfirmationStatus] = None
    payment_status: Optional[PaymentStatus] = None
    client_notes: Optional[str] = None
    master_notes: Optional[str] = None


class AppointmentInDBBase(AppointmentBase):
    id: int

    class Config:
        orm_mode = True


class Appointment(AppointmentInDBBase):
    pass


class AppointmentInDB(AppointmentInDBBase):
    pass
