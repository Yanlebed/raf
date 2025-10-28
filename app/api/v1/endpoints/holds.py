from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User, UserType
from app.core.config import settings
from app.crud.slot_hold import create_hold, get_active_holds, delete_hold
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole
from sqlalchemy.future import select


router = APIRouter()


class HoldRequest(BaseModel):
    master_id: int
    service_id: int
    start_time: str  # ISO
    duration_minutes: int


@router.post("/")
async def place_hold(
        *,
        payload: HoldRequest,
        db: AsyncSession = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.ADMIN and current_user.id != payload.master_id:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == payload.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    try:
        start = datetime.fromisoformat(payload.start_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат времени")
    end = start + timedelta(minutes=payload.duration_minutes or settings.SLOT_HOLD_MINUTES)
    overlaps = await get_active_holds(db, payload.master_id, start, end)
    if overlaps:
        raise HTTPException(status_code=409, detail="Слот уже удерживается")
    hold = await create_hold(db, payload.master_id, payload.service_id, start, end)
    return {"id": hold.id, "expires_at": hold.end_time}


@router.delete("/{hold_id}")
async def release_hold(hold_id: int, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    deleted = await delete_hold(db, hold_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Холд не найден")
    return {"status": "released"}


