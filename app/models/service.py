from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Boolean,
    Float,
    Text,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base
from app.models.associations import user_services


class ServiceCategory(enum.Enum):
    HAIRCUT = "Стрижка"
    MANICURE = "Маникюр"
    # Добавьте другие категории по необходимости


class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    duration = Column(Integer)  # В минутах
    price = Column(Float)
    category = Column(Enum(ServiceCategory))
    is_active = Column(Boolean, default=True)

    # Отношения
    users = relationship('User', secondary=user_services, back_populates='services')
    appointments = relationship('Appointment', back_populates='service')

    def __init__(self, name, **kwargs):
        self.name = name
        for key, value in kwargs.items():
            setattr(self, key, value)
