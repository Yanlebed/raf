from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/services", response_class=HTMLResponse)
async def services(request: Request):
    # Логика получения списка услуг
    return "Список услуг"
