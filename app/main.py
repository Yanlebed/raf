from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение статических файлов и шаблонов
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Подключение API маршрутов
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/search", response_class=HTMLResponse)
async def search(request: Request, query: str = "", city: str = ""):
    # Логика поиска процедур в выбранном городе
    # Например, фильтрация процедур по городу
    results = []  # Замените на реальную логику поиска
    return templates.TemplateResponse(
        "search_results.html",
        {"request": request, "results": results, "query": query, "city": city},
    )


# Добавьте маршруты для процедур и мастеров
@app.get("/procedure/{name}", response_class=HTMLResponse)
async def procedure(request: Request, name: str):
    # Логика отображения информации о процедуре
    return templates.TemplateResponse("procedure.html", {"request": request, "name": name})


@app.get("/master/{name}", response_class=HTMLResponse)
async def master(request: Request, name: str):
    # Логика отображения информации о мастере
    return templates.TemplateResponse("master.html", {"request": request, "name": name})


@app.get("/apply", response_class=HTMLResponse)
async def apply(request: Request):
    # Форма для заполнения заявки
    return templates.TemplateResponse("apply.html", {"request": request})
