from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Integer as Int,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.location import Location


class Organization(Base):
    __tablename__ = 'organizations'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=True)

    members = relationship('UserOrganization', back_populates='organization', cascade="all, delete-orphan")
    location = relationship('Location')

