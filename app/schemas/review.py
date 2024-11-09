from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ReviewBase(BaseModel):
    client_id: int
    master_id: Optional[int] = None
    salon_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewInDBBase(ReviewBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class Review(ReviewInDBBase):
    pass


class ReviewInDB(ReviewInDBBase):
    pass
