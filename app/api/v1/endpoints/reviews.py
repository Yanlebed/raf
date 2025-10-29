from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api import deps
from app.crud.review import delete_some_review, get_review, get_reviews, get_reviews_by_master, get_reviews_by_salon, \
    create_new_review, update_some_review
from app.models.user import User, UserType
from app.schemas.review import Review, ReviewCreate, ReviewUpdate
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole
from sqlalchemy.future import select
from app.models.review import Review as ReviewModel
from app.models.appointment import Appointment, ConfirmationStatus
from sqlalchemy import func, desc, asc

router = APIRouter()


@router.get("/")
async def read_reviews(
        db: AsyncSession = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        master_id: int = None,
        salon_id: int = None,
        order: str = "desc",
        current_user: User = Depends(deps.get_current_active_user),
):
    ordering = desc(ReviewModel.created_at) if order == "desc" else asc(ReviewModel.created_at)
    if current_user.user_type == UserType.ADMIN:
        if master_id:
            total = (await db.execute(select(func.count(ReviewModel.id)).where(ReviewModel.master_id == master_id))).scalar_one()
            result = await db.execute(select(ReviewModel).where(ReviewModel.master_id == master_id).order_by(ordering).offset(skip).limit(limit))
            return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}
        if salon_id:
            total = (await db.execute(select(func.count(ReviewModel.id)).where(ReviewModel.salon_id == salon_id))).scalar_one()
            result = await db.execute(select(ReviewModel).where(ReviewModel.salon_id == salon_id).order_by(ordering).offset(skip).limit(limit))
            return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}
        total = (await db.execute(select(func.count(ReviewModel.id)))).scalar_one()
        result = await db.execute(select(ReviewModel).order_by(ordering).offset(skip).limit(limit))
        return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}

    # For org OWNER/MANAGER with no explicit filter, scope to their org masters/salon
    if not master_id and not salon_id:
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
                select(func.count(ReviewModel.id)).where((ReviewModel.master_id.in_(master_ids)) | (ReviewModel.salon_id.in_(master_ids)))
            )).scalar_one()
            result = await db.execute(
                select(ReviewModel).where(
                    (ReviewModel.master_id.in_(master_ids)) | (ReviewModel.salon_id.in_(master_ids))
                ).order_by(ordering).offset(skip).limit(limit)
            )
            return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}
        return {"items": [], "skip": skip, "limit": limit, "total": 0}

    if master_id:
        total = (await db.execute(select(func.count(ReviewModel.id)).where(ReviewModel.master_id == master_id))).scalar_one()
        result = await db.execute(select(ReviewModel).where(ReviewModel.master_id == master_id).order_by(ordering).offset(skip).limit(limit))
        return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}
    if salon_id:
        total = (await db.execute(select(func.count(ReviewModel.id)).where(ReviewModel.salon_id == salon_id))).scalar_one()
        result = await db.execute(select(ReviewModel).where(ReviewModel.salon_id == salon_id).order_by(ordering).offset(skip).limit(limit))
        return {"items": result.scalars().all(), "skip": skip, "limit": limit, "total": total}
    return {"items": [], "skip": skip, "limit": limit, "total": 0}


@router.post("/", response_model=Review)
async def create_review(
        *,
        db: AsyncSession = Depends(deps.get_db),
        review_in: ReviewCreate,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.CLIENT:
        raise HTTPException(status_code=400, detail="Только клиенты могут оставлять отзывы.")
    review_in.client_id = current_user.id
    # Mark verified if appointment exists and confirmed/completed
    result = await db.execute(
        select(Appointment).where(
            Appointment.client_id == current_user.id,
            (Appointment.master_id == review_in.master_id) | (Appointment.client_id == review_in.salon_id),
            Appointment.confirmation_status.in_([ConfirmationStatus.CONFIRMED, ConfirmationStatus.COMPLETED])
        )
    )
    appt = result.scalars().first()
    if appt:
        review_in.verified = True
    review = await create_new_review(db=db, review_in=review_in)
    return review


@router.put("/{review_id}", response_model=Review)
async def update_review(
        *,
        db: AsyncSession = Depends(deps.get_db),
        review_id: int,
        review_in: ReviewUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    review = await get_review(db=db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден.")
    # Only the author (client) or admin can update a review. Masters/orgs cannot.
    if current_user.user_type != UserType.ADMIN and current_user.id != review.client_id:
        raise HTTPException(status_code=403, detail="Редактирование отзыва разрешено только автору или администратору.")
    review = await update_some_review(db=db, db_review=review, review_in=review_in)
    return review


@router.delete("/{review_id}", response_model=Review)
async def delete_review(
        *,
        db: AsyncSession = Depends(deps.get_db),
        review_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    review = await get_review(db=db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден.")
    # Only the author (client) or admin can delete a review. Masters/orgs cannot.
    if current_user.user_type != UserType.ADMIN and current_user.id != review.client_id:
        raise HTTPException(status_code=403, detail="Удаление отзыва разрешено только автору или администратору.")
    review = await delete_some_review(db=db, review_id=review_id)
    return review
