from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class MasterPhoto(Base):
    __tablename__ = 'master_photos'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    photo_url = Column(String, nullable=False)

    # Отношения
    master = relationship('User', back_populates='master_photos')

    def __init__(self, master_id, photo_url):
        self.master_id = master_id
        self.photo_url = photo_url
