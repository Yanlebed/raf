from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base_class import Base


class PhoneVerification(Base):
    __tablename__ = 'phone_verifications'

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False, unique=True)
    verification_code = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
