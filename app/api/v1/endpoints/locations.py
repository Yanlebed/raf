from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.models.location import Location
from app.utils.locations import normalize_city_label

router = APIRouter()


@router.get("/cities", response_model=List[str])
async def list_cities(db: AsyncSession = Depends(deps.get_db)):
    rows = (await db.execute(select(Location.city))).scalars().all()
    # Normalize, de-duplicate, and sort for frontend
    normalized = {normalize_city_label(c) or c for c in rows if c}
    return sorted(normalized)


