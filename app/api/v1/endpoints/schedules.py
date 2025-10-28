from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.master_schedule import MasterSchedule
from app.models.user import User, UserType
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole


router = APIRouter()


def _ensure_can_manage_master(current_user: User, master_id: int, db: AsyncSession):
    # Called inside endpoints with awaits
    pass


@router.get("/masters/{master_id}", response_model=List[dict])
async def list_schedules(master_id: int, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
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
    items = (await db.execute(select(MasterSchedule).where(MasterSchedule.master_id == master_id))).scalars().all()
    return [
        {
            "id": m.id,
            "day_of_week": m.day_of_week,
            "start_time": m.start_time.isoformat(timespec='minutes'),
            "end_time": m.end_time.isoformat(timespec='minutes'),
        } for m in items
    ]


@router.post("/masters/{master_id}", response_model=dict)
async def create_schedule(master_id: int, day_of_week: int, start_time: str, end_time: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
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
    from datetime import time as dtime
    item = MasterSchedule(
        master_id=master_id,
        day_of_week=day_of_week,
        start_time=dtime.fromisoformat(start_time),
        end_time=dtime.fromisoformat(end_time),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id}


@router.put("/{schedule_id}", response_model=dict)
async def update_schedule(schedule_id: int, day_of_week: int | None = None, start_time: str | None = None, end_time: str | None = None, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    sched = (await db.execute(select(MasterSchedule).where(MasterSchedule.id == schedule_id))).scalars().first()
    if not sched:
        raise HTTPException(status_code=404, detail="График не найден")
    if current_user.user_type != UserType.ADMIN and current_user.id != sched.master_id:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == sched.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    from datetime import time as dtime
    if day_of_week is not None:
        sched.day_of_week = day_of_week
    if start_time is not None:
        sched.start_time = dtime.fromisoformat(start_time)
    if end_time is not None:
        sched.end_time = dtime.fromisoformat(end_time)
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return {"id": sched.id}


@router.delete("/{schedule_id}", response_model=dict)
async def delete_schedule(schedule_id: int, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    sched = (await db.execute(select(MasterSchedule).where(MasterSchedule.id == schedule_id))).scalars().first()
    if not sched:
        raise HTTPException(status_code=404, detail="График не найден")
    if current_user.user_type != UserType.ADMIN and current_user.id != sched.master_id:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == sched.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    await db.delete(sched)
    await db.commit()
    return {"status": "deleted"}


