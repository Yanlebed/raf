from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base_class import Base

user_services = Table(
    'user_services',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('service_id', Integer, ForeignKey('services.id'))
)
