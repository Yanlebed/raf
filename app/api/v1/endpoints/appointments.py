from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from pydantic import conint
from pydantic import BaseModel

from app.api import deps
from app.crud.appointment import create_new_appointment, delete_appointment, get_appointment, get_appointments, \
    get_appointments_by_client, \
    get_appointments_by_master, update_an_appointment
from app.models.user import User, UserType
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole
from sqlalchemy.future import select
from app.crud.slot_hold import get_active_holds
from app.models.appointment import Appointment as AppointmentModel
from sqlalchemy import func, asc, desc

router = APIRouter()


@router.get("/")
async def read_appointments(
        db: AsyncSession = Depends(deps.get_db),
        skip: int = 0,
        limit: conint(gt=0, le=100) = 100,
        order: str = "asc",
        current_user: User = Depends(deps.get_current_active_user),
):
    ordering = asc(AppointmentModel.appointment_date) if order != "desc" else desc(AppointmentModel.appointment_date)
    items = []
    total = 0
    if current_user.user_type == UserType.CLIENT:
        total = (await db.execute(
            select(func.count(AppointmentModel.id)).where(AppointmentModel.client_id == current_user.id)
        )).scalar_one()
        result = await db.execute(
            select(AppointmentModel)
            .where(AppointmentModel.client_id == current_user.id)
            .order_by(ordering)
            .offset(skip).limit(limit)
        )
        items = result.scalars().all()
    elif current_user.user_type == UserType.MASTER:
        total = (await db.execute(
            select(func.count(AppointmentModel.id)).where(AppointmentModel.master_id == current_user.id)
        )).scalar_one()
        result = await db.execute(
            select(AppointmentModel)
            .where(AppointmentModel.master_id == current_user.id)
            .order_by(ordering)
            .offset(skip).limit(limit)
        )
        items = result.scalars().all()
    else:
        if current_user.user_type == UserType.ADMIN:
            total = (await db.execute(select(func.count(AppointmentModel.id)))).scalar_one()
            result = await db.execute(
                select(AppointmentModel).order_by(ordering).offset(skip).limit(limit)
            )
            items = result.scalars().all()
        else:
            org_ids = (await db.execute(
                select(UserOrganization.organization_id).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
                )
            )).scalars().all()
            if org_ids:
                master_ids = (await db.execute(
                    select(UserOrganization.user_id).where(UserOrganization.organization_id.in_(org_ids))
                )).scalars().all()
                total = (await db.execute(
                    select(func.count(AppointmentModel.id)).where(AppointmentModel.master_id.in_(master_ids))
                )).scalar_one()
                result = await db.execute(
                    select(AppointmentModel)
                    .where(AppointmentModel.master_id.in_(master_ids))
                    .order_by(ordering)
                    .offset(skip).limit(limit)
                )
                items = result.scalars().all()
            else:
                items = []
                total = 0
    return {"items": items, "skip": skip, "limit": limit, "total": total}


@router.post("/", response_model=Appointment)
async def create_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_in: AppointmentCreate,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.CLIENT:
        raise HTTPException(status_code=400, detail="Только клиенты могут создавать записи.")
    appointment_in.client_id = current_user.id
    # Overlap/hold check
    from datetime import timedelta
    duration_minutes = appointment_in.duration_override
    if not duration_minutes:
        # derive from service if possible
        from app.crud.service import get_service as crud_get_service
        service = await crud_get_service(db, appointment_in.service_id)
        duration_minutes = service.duration if service else 0
    end_time = appointment_in.appointment_date + timedelta(minutes=duration_minutes)
    holds = await get_active_holds(db, appointment_in.master_id, appointment_in.appointment_date, end_time)
    if holds:
        raise HTTPException(status_code=409, detail="Слот временно удерживается. Попробуйте позже.")
    # Existing appointments overlap check
    from app.crud.appointment import get_appointments_for_master_on_date
    same_day_appts = await get_appointments_for_master_on_date(db, master_id=appointment_in.master_id, day=appointment_in.appointment_date)
    def _appt_end(appt):
        eff = appt.duration_override or (appt.service.duration if appt.service and appt.service.duration else 0)
        return appt.appointment_date + timedelta(minutes=eff)
    for appt in same_day_appts:
        if not (end_time <= appt.appointment_date or appointment_in.appointment_date >= _appt_end(appt)):
            raise HTTPException(status_code=409, detail="Время записи конфликтует с существующей записью.")
    appointment = await create_new_appointment(db=db, appointment_in=appointment_in)
    return appointment


@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_id: int,
        appointment_in: AppointmentUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = await get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.user_type != UserType.ADMIN and current_user.id not in [appointment.client_id, appointment.master_id]:
        # Allow org OWNER/MANAGER for the master
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == appointment.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав для обновления записи.")
    appointment = await update_an_appointment(db=db, db_appointment=appointment, appointment_in=appointment_in)
    return appointment


class AppointmentDurationOverride(BaseModel):
    duration_minutes: int


@router.post("/{appointment_id}/override-duration", response_model=Appointment)
async def override_appointment_duration(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_id: int,
        payload: AppointmentDurationOverride,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = await get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    # Permissions: master assigned to appointment, admin, or org OWNER/MANAGER
    if current_user.user_type != UserType.ADMIN and current_user.id != appointment.master_id:
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == appointment.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    # Overlap check with new duration
    from datetime import timedelta
    new_end = appointment.appointment_date + timedelta(minutes=payload.duration_minutes)
    from app.crud.appointment import get_appointments_for_master_on_date
    same_day_appts = await get_appointments_for_master_on_date(db, master_id=appointment.master_id, day=appointment.appointment_date)
    def _appt_end(appt):
        eff = appt.duration_override or (appt.service.duration if appt.service and appt.service.duration else 0)
        return appt.appointment_date + timedelta(minutes=eff)
    for appt in same_day_appts:
        if appt.id == appointment.id:
            continue
        if not (new_end <= appt.appointment_date or appointment.appointment_date >= _appt_end(appt)):
            raise HTTPException(status_code=409, detail="Новый длительность конфликтует с другой записью.")
    appointment.duration_override = payload.duration_minutes
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", response_model=Appointment)
async def delete_appointment(
        *,
        db: AsyncSession = Depends(deps.get_db),
        appointment_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    appointment = await get_appointment(db=db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена.")
    if current_user.user_type != UserType.ADMIN and current_user.id != appointment.client_id:
        # Allow org OWNER/MANAGER managing master's appointments
        result = await db.execute(
            select(UserOrganization).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.organization_id.in_(
                    select(UserOrganization.organization_id).where(UserOrganization.user_id == appointment.master_id)
                ),
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )
        if not result.scalars().first():
            raise HTTPException(status_code=403, detail="Недостаточно прав для удаления записи.")
    appointment = await delete_appointment(db=db, appointment_id=appointment_id)
    return appointment
