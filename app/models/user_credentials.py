from passlib.context import CryptContext

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class UserCredentials(Base):
    __tablename__ = 'user_credentials'

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    password_hash = Column(String, nullable=False)

    # Отношения
    user = relationship('User', back_populates='credentials')

    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        return pwd_context.verify(password, self.password_hash)
