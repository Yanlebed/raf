from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/categories/{category_id}", response_class=HTMLResponse)
async def category(request: Request, category_id: int):
    # Логика получения информации о категории
    return f"Информация о категории {category_id}"
