from pathlib import Path
from starlette.responses import FileResponse
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings

origins = settings.CORS_ORIGINS
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Настройка CORS
allow_credentials = settings.CORS_ALLOW_CREDENTIALS and ("*" not in origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Подключение шаблонов и статики
BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=BASE_DIR / 'templates')

# Подключение API маршрутов
app.include_router(api_router, prefix=settings.API_V1_STR)

app.mount("/static", StaticFiles(directory=BASE_DIR / 'static'), name="static")

# Serve prebuilt frontend (CRA-style) only if present. In dev we use separate Next.js container.
FRONTEND_BUILD_DIR = Path("frontend/build")
if FRONTEND_BUILD_DIR.exists():
    app.mount("/app", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")


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


if FRONTEND_BUILD_DIR.exists():
    @app.exception_handler(404)
    async def custom_404_handler(request: Request, exc):
        return FileResponse(FRONTEND_BUILD_DIR / 'index.html')
