from datetime import datetime, timezone, timedelta

from sqlalchemy import Column, Integer, ForeignKey, DateTime

from app.db.base_class import Base


class SlotHold(Base):
    __tablename__ = 'slot_holds'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

