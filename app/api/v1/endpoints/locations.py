from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.models.location import Location

router = APIRouter()


@router.get("/cities", response_model=List[str])
async def list_cities(db: AsyncSession = Depends(deps.get_db)):
  rows = (await db.execute(select(Location.city))).scalars().all()
  # unique + sorted
  return sorted(list({c for c in rows if c}))


