from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Time,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class MasterSchedule(Base):
    __tablename__ = 'master_schedule'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 - Понедельник, 6 - Воскресенье
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Отношения
    master = relationship('User', backref='schedules')

    def __init__(self, master_id, day_of_week, start_time, end_time):
        self.master_id = master_id
        self.day_of_week = day_of_week
        self.start_time = start_time
        self.end_time = end_time
