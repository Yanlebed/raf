from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud
from app.api import deps

from app.models.user import User, UserType
from app.schemas.review import Review, ReviewCreate, ReviewUpdate


router = APIRouter()


@router.get("/", response_model=List[Review])
def read_reviews(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        master_id: int = None,
        salon_id: int = None,
        current_user: User = Depends(deps.get_current_active_user),
):
    if master_id:
        reviews = crud.review.get_reviews_by_master(db, master_id=master_id, skip=skip, limit=limit)
    elif salon_id:
        reviews = crud.review.get_reviews_by_salon(db, salon_id=salon_id, skip=skip, limit=limit)
    else:
        reviews = crud.review.get_reviews(db, skip=skip, limit=limit)
    return reviews


@router.post("/", response_model=Review)
def create_review(
        *,
        db: Session = Depends(deps.get_db),
        review_in: ReviewCreate,
        current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type != UserType.CLIENT:
        raise HTTPException(status_code=400, detail="Только клиенты могут оставлять отзывы.")
    review_in.client_id = current_user.id
    review = crud.review.create_review(db=db, review_in=review_in)
    return review


@router.put("/{review_id}", response_model=Review)
def update_review(
        *,
        db: Session = Depends(deps.get_db),
        review_id: int,
        review_in: ReviewUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    review = crud.review.get_review(db=db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден.")
    if current_user.id != review.client_id:
        raise HTTPException(status_code=400, detail="Недостаточно прав для обновления отзыва.")
    review = crud.review.update_review(db=db, db_review=review, review_in=review_in)
    return review


@router.delete("/{review_id}", response_model=Review)
def delete_review(
        *,
        db: Session = Depends(deps.get_db),
        review_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    review = crud.review.get_review(db=db, review_id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден.")
    if current_user.id != review.client_id and current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=400, detail="Недостаточно прав для удаления отзыва.")
    review = crud.review.delete_review(db=db, review_id=review_id)
    return review
