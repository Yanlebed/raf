from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


async def get_review(db: AsyncSession, review_id: int) -> Optional[Review]:
    result = await db.execute(select(Review).where(Review.id == review_id))
    return result.scalars().first()


async def get_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Review]:
    result = await db.execute(select(Review).offset(skip).limit(limit))
    return result.scalars().all()


async def get_reviews_by_master(db: AsyncSession, master_id: int, skip: int = 0, limit: int = 100) -> Sequence[Review]:
    result = await db.execute(select(Review).where(Review.master_id == master_id).offset(skip).limit(limit))
    return result.scalars().all()


async def get_reviews_by_salon(db: AsyncSession, salon_id: int, skip: int = 0, limit: int = 100) -> Sequence[Review]:
    result = await db.execute(select(Review).where(Review.salon_id == salon_id).offset(skip).limit(limit))
    return result.scalars().all()


async def create_new_review(db: AsyncSession, review_in: ReviewCreate) -> Review:
    db_review = Review(**review_in.dict())
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review


async def update_some_review(db: AsyncSession, db_review: Review, review_in: ReviewUpdate) -> Review:
    update_data = review_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_review, field, value)
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review


async def delete_some_review(db: AsyncSession, review_id: int) -> Optional[Review]:
    db_review = await get_review(db, review_id)
    if db_review:
        await db.delete(db_review)
        await db.commit()
    return db_review
