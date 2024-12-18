from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import schemas
from app.api import deps

from app.models.user import User, UserType
from app.schemas.service import Service

from app.crud.service import get_service, get_services, create_service, update_service, delete_service

router = APIRouter()


@router.get("/", response_model=List[schemas.service.Service])
async def read_services(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    services = await get_services(db, skip=skip, limit=limit)
    return services


@router.post("/", response_model=schemas.service.Service)
async def create_service(
    *,
    db: AsyncSession = Depends(deps.get_db),
    service_in: schemas.service.ServiceCreate,
    current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type not in [UserType.ADMIN, UserType.MASTER]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для создания услуги.")
    service = await create_service(db=db, service_in=service_in)
    return service


@router.put("/{service_id}", response_model=schemas.service.Service)
async def update_service(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        service_in: schemas.service.ServiceUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type not in [UserType.ADMIN, UserType.MASTER]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для обновления услуги.")
    service = update_service(db=db, db_service=service, service_in=service_in)
    return service


@router.delete("/{service_id}", response_model=schemas.service.Service)
async def delete_service(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=400, detail="Недостаточно прав для удаления услуги.")
    service = delete_service(db=db, service_id=service_id)
    return service
