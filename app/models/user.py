# app/models/user.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    Boolean,
    Text,
    Enum as SqlEnum
)

from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base
from app.models.associations import user_services
from app.core.enums import UserType, UserStatus


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    user_type = Column(SqlEnum(UserType, name="usertype"), nullable=False)
    is_active = Column(Boolean, default=True)
    # created = Column(DateTime, server_default='now()') # ???
    # last_updated = Column(DateTime, server_default='now()', onupdate='now()')

    # Общие поля
    phone = Column(String, unique=True, index=True, nullable=False)
    is_phone_verified = Column(Boolean, default=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String)  # Путь или URL к изображению
    city = Column(String)
    address = Column(String)
    avatar_url = Column(String, nullable=True)

    # Поля для разных типов пользователей
    name = Column(String)  # ФИО или название салона
    short_description = Column(Text)
    experience_years = Column(Integer)  # Только для Мастера
    home_service = Column(Boolean, default=False)  # Только для Мастера

    # Отношения
    master_photos = relationship('MasterPhoto', back_populates='master')
    appointments = relationship('Appointment', foreign_keys='[Appointment.master_id]', back_populates='master')
    client_appointments = relationship('Appointment', foreign_keys='[Appointment.client_id]', back_populates='client')
    reviews = relationship('Review', foreign_keys='[Review.client_id]', back_populates='client')
    received_reviews = relationship('Review', foreign_keys='[Review.master_id]', back_populates='master')
    credentials = relationship('UserCredentials', back_populates='user', uselist=False)
    services = relationship('Service', secondary=user_services, back_populates='users')

    # def __init__(self, user_type, phone, **kwargs):
    #     self.user_type = user_type
    #     self.phone = phone
    #     for key, value in kwargs.items():
    #         setattr(self, key, value)
