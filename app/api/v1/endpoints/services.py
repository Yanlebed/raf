from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import schemas
from app.api import deps

from app.models.user import User, UserType
from app.schemas.service import Service
from app.core.enums import OrganizationRole
from app.models.user_organization import UserOrganization
from sqlalchemy.future import select
from app.models.service import Service as ServiceModel

from app.crud.service import (
    get_service as crud_get_service,
    get_services as crud_get_services,
    create_service as crud_create_service,
    update_service as crud_update_service,
    delete_service as crud_delete_service,
    get_services_by_city as crud_get_services_by_city,
)

router = APIRouter()


@router.get("/public", response_model=List[schemas.service.Service])
async def read_public_services(
    skip: int = 0,
    limit: int = 100,
    city: str = "Kyiv",
    q: str | None = None,
    db: AsyncSession = Depends(deps.get_db),
):
    services = await crud_get_services_by_city(db, city=city, skip=skip, limit=limit, q=q)
    return services


@router.get("/", response_model=List[schemas.service.Service])
async def read_services(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type == UserType.ADMIN:
        return await crud_get_services(db, skip=skip, limit=limit)
    org_ids = (await db.execute(
        select(UserOrganization.organization_id).where(
            UserOrganization.user_id == current_user.id,
            UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
        )
    )).scalars().all()
    if not org_ids:
        # Return only services owned by the user
        result = await db.execute(
            select(ServiceModel).where(ServiceModel.owner_user_id == current_user.id).offset(skip).limit(limit)
        )
    else:
        result = await db.execute(
            select(ServiceModel).where(
                (ServiceModel.owner_user_id == current_user.id) | (ServiceModel.owner_org_id.in_(org_ids))
            ).offset(skip).limit(limit)
        )
    return result.scalars().all()


@router.post("/", response_model=schemas.service.Service)
async def create_service_endpoint(
    *,
    db: AsyncSession = Depends(deps.get_db),
    service_in: schemas.service.ServiceCreate,
    current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type not in [UserType.ADMIN, UserType.MASTER]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для создания услуги.")
    # Ownership and permissions
    if service_in.owner_org_id:
        if current_user.user_type != UserType.ADMIN:
            # Must be OWNER or MANAGER in the target organization
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service_in.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            membership = result.scalars().first()
            if not membership:
                raise HTTPException(status_code=403, detail="Недостаточно прав для создания услуги в организации.")
    elif service_in.owner_user_id and service_in.owner_user_id != current_user.id and current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Вы не можете создавать услугу для другого пользователя.")
    else:
        # Default owner to current user if none provided
        if not service_in.owner_user_id and not service_in.owner_org_id:
            service_in.owner_user_id = current_user.id
    service = await crud_create_service(db=db, service_in=service_in)
    return service


@router.put("/{service_id}", response_model=schemas.service.Service)
async def update_service_endpoint(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        service_in: schemas.service.ServiceUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type != UserType.ADMIN:
        allowed = False
        # Owner-user can edit
        if service.owner_user_id and service.owner_user_id == current_user.id:
            allowed = True
        # Organization OWNER/MANAGER can edit
        if service.owner_org_id and not allowed:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            if result.scalars().first():
                allowed = True
        if not allowed:
            raise HTTPException(status_code=403, detail="Недостаточно прав для обновления услуги.")
    service = await crud_update_service(db=db, db_service=service, service_in=service_in)
    return service


@router.delete("/{service_id}", response_model=schemas.service.Service)
async def delete_service_endpoint(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type != UserType.ADMIN:
        allowed = False
        if service.owner_user_id and service.owner_user_id == current_user.id:
            allowed = True
        if service.owner_org_id and not allowed:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            if result.scalars().first():
                allowed = True
        if not allowed:
            raise HTTPException(status_code=403, detail="Недостаточно прав для удаления услуги.")
    service = await crud_delete_service(db=db, service_id=service_id)
    return service
