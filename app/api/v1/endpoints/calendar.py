from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.user import User, UserType
from app.models.master_schedule import MasterSchedule
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole
from app.crud.appointment import get_appointments_for_master_on_date
from app.crud.service import get_service as crud_get_service
from app.utils.availability import compute_daily_slots


router = APIRouter()


@router.get("/masters/{master_id}/slots", response_model=List[str])
async def get_master_slots(
        *,
        master_id: int,
        date: str,
        service_id: Optional[int] = None,
        db: AsyncSession = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_user),
):
    # Permissions: master themselves, admins, or org OWNER/MANAGER
    if current_user.user_type != UserType.ADMIN and current_user.id != master_id:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")

    try:
        day = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверная дата")

    schedules = (await db.execute(
        select(MasterSchedule).where(MasterSchedule.master_id == master_id)
    )).scalars().all()
    appointments = await get_appointments_for_master_on_date(db, master_id=master_id, day=day)
    service_duration = None
    if service_id is not None:
        service = await crud_get_service(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Услуга не найдена")
        service_duration = service.duration or None
    slots = compute_daily_slots(schedules, appointments, day, service_duration_minutes=service_duration)
    # Return ISO strings
    return [dt.isoformat() for dt in slots]


@router.get("/organizations/{organization_id}/slots", response_model=List[str])
async def get_org_slots(
        *,
        organization_id: int,
        date: str,
        service_id: Optional[int] = None,
        db: AsyncSession = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.ADMIN:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id == organization_id,
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    try:
        day = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверная дата")

    masters_in_org = (await db.execute(
        select(UserOrganization.user_id).where(UserOrganization.organization_id == organization_id)
    )).scalars().all()

    all_slots: set[str] = set()
    for master_id in masters_in_org:
        schedules = (await db.execute(
            select(MasterSchedule).where(MasterSchedule.master_id == master_id)
        )).scalars().all()
        appointments = await get_appointments_for_master_on_date(db, master_id=master_id, day=day)
        service_duration = None
        if service_id is not None:
            service = await crud_get_service(db, service_id)
            service_duration = service.duration if service else None
        slots = compute_daily_slots(schedules, appointments, day, service_duration_minutes=service_duration)
        for dt in slots:
            all_slots.add(dt.isoformat())
    return sorted(all_slots)


