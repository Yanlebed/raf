from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Boolean,
    ForeignKey,
    Float,
    DateTime,
    Text,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class ConfirmationStatus(enum.Enum):
    PENDING = "Ожидает подтверждения"
    CONFIRMED = "Подтверждена"
    CANCELED_BY_CLIENT = "Отменена клиентом"
    CANCELED_BY_MASTER = "Отменена мастером"
    COMPLETED = "Завершена"


class PaymentMethod(enum.Enum):
    CASH = "Наличные"
    CARD = "Карта"
    ONLINE = "Онлайн-оплата"


class PaymentStatus(enum.Enum):
    PAID = "Оплачено"
    NOT_PAID = "Не оплачено"
    PARTIALLY_PAID = "Частично оплачено"


class Appointment(Base):
    __tablename__ = 'appointments'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=False)
    appointment_code = Column(String, unique=True)
    appointment_date = Column(DateTime, nullable=False)
    confirmation_status = Column(Enum(ConfirmationStatus), default=ConfirmationStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod))
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.NOT_PAID)
    client_notes = Column(Text)
    master_notes = Column(Text)
    service_location = Column(String)
    reminders = Column(Boolean, default=True)
    quantity = Column(Integer, default=1)
    price = Column(Float)

    # Отношения
    master = relationship('User', foreign_keys=[master_id], back_populates='appointments')
    client = relationship('User', foreign_keys=[client_id], back_populates='client_appointments')
    service = relationship('Service', back_populates='appointments')

    def __init__(self, master_id, client_id, service_id, appointment_date, **kwargs):
        self.master_id = master_id
        self.client_id = client_id
        self.service_id = service_id
        self.appointment_date = appointment_date
        for key, value in kwargs.items():
            setattr(self, key, value)
