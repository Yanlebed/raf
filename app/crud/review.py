from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


def get_review(db: Session, review_id: int) -> Optional[Review]:
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews(db: Session, skip: int = 0, limit: int = 100) -> List[Review]:
    return db.query(Review).offset(skip).limit(limit).all()


def create_review(db: Session, review_in: ReviewCreate) -> Review:
    db_review = Review(
        client_id=review_in.client_id,
        master_id=review_in.master_id,
        salon_id=review_in.salon_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def update_review(db: Session, db_review: Review, review_in: ReviewUpdate) -> Review:
    update_data = review_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_review, field, value)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def delete_review(db: Session, review_id: int) -> Optional[Review]:
    db_review = get_review(db, review_id)
    if db_review:
        db.delete(db_review)
        db.commit()
    return db_review
