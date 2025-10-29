from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    Text,
)
from sqlalchemy import Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base_class import Base


class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    master_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    salon_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    anonymous = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)

    # Отношения
    client = relationship('User', foreign_keys=[client_id], back_populates='reviews')
    master = relationship('User', foreign_keys=[master_id], back_populates='received_reviews')
    salon = relationship('User', foreign_keys=[salon_id])

    def __init__(self, client_id, rating, **kwargs):
        self.client_id = client_id
        self.rating = rating
        for key, value in kwargs.items():
            setattr(self, key, value)
