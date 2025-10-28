from typing import Dict

from fastapi import APIRouter

from app.schemas.service import ServiceCategory


router = APIRouter()


RECOMMENDED_DURATIONS: Dict[ServiceCategory, int] = {
    ServiceCategory.HAIRCUT: 60,
    ServiceCategory.MANICURE: 90,
}


@router.get("/durations")
async def get_recommended_durations():
    return {k.value: v for k, v in RECOMMENDED_DURATIONS.items()}


