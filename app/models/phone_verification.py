from app.db.base_class import Base

from sqlalchemy import Column, TIMESTAMP, Integer, String
from sqlalchemy.sql import func


class PhoneVerification(Base):
    __tablename__ = 'phone_verifications'
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False)
    verification_code = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)