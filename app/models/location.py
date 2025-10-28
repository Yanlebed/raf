from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Location(Base):
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True)
    city = Column(String, index=True, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Backrefs defined on User/Organization

