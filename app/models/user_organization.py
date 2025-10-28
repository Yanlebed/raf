from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.core.enums import OrganizationRole


class UserOrganization(Base):
    __tablename__ = 'user_organizations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    role = Column(Enum(OrganizationRole), nullable=False)

    user = relationship('User', backref='organizations')
    organization = relationship('Organization', back_populates='members')

