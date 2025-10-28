from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Boolean,
    Float,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base
from app.models.associations import user_services
from app.models.organization import Organization
from app.models.user import User


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
    owner_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    owner_org_id = Column(Integer, ForeignKey('organizations.id'), nullable=True)

    # Отношения
    users = relationship('User', secondary=user_services, back_populates='services')
    appointments = relationship('Appointment', back_populates='service')
    owner_user = relationship('User', foreign_keys=[owner_user_id])
    owner_org = relationship('Organization', foreign_keys=[owner_org_id])

    def __init__(self, name, **kwargs):
        self.name = name
        for key, value in kwargs.items():
            setattr(self, key, value)
