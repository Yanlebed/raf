from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func

from app.db.base_class import Base


class OtpAttempt(Base):
    __tablename__ = 'otp_attempts'

    id = Column(Integer, primary_key=True)
    phone_number = Column(String, nullable=False, index=True)
    success = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


