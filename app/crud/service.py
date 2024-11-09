from typing import Optional, Type
from sqlalchemy.orm import Session

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_service(db: Session, service_id: int) -> Optional[Service]:
    return db.query(Service).filter(Service.id == service_id).first()


def get_services(db: Session, skip: int = 0, limit: int = 100) -> list[Type[Service]]:
    return db.query(Service).offset(skip).limit(limit).all()


def create_service(db: Session, service_in: ServiceCreate) -> Service:
    db_service = Service(
        name=service_in.name,
        description=service_in.description,
        duration=service_in.duration,
        price=service_in.price,
        category=service_in.category,
        is_active=service_in.is_active,
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def update_service(db: Session, db_service: Service, service_in: ServiceUpdate) -> Service:
    update_data = service_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def delete_service(db: Session, service_id: int) -> Optional[Service]:
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service
