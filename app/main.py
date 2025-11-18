from pathlib import Path
from typing import Any

from starlette.responses import FileResponse
from fastapi import FastAPI, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.api.v1.api import api_router
from app.core.config import settings
from app.utils.locations import normalize_city_label
from app.schemas.common import ErrorResponse, ErrorDetail, FieldError

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


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Ensure all HTTPException responses follow the ErrorResponse schema shape.
    """
    detail: Any = exc.detail
    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        payload = {"detail": detail}
    else:
        # Fallback for legacy/plain-string details
        message = detail if isinstance(detail, str) else "Unexpected error"
        payload = {
            "detail": {
                "code": "http_error",
                "message": message,
            }
        }
    return JSONResponse(status_code=exc.status_code, content=payload, headers=exc.headers or None)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Normalize request validation errors into ErrorResponse.
    """
    errors = exc.errors()
    field_errors: list[dict] = []
    for err in errors:
        loc = err.get("loc", [])
        # Skip the first element ("body", "query", etc.) for brevity in field name
        field_path = ".".join(str(p) for p in loc[1:]) if len(loc) > 1 else ".".join(str(p) for p in loc)
        field_errors.append(
            {
                "field": field_path,
                "message": err.get("msg"),
                "type": err.get("type"),
            }
        )
    payload = {
        "detail": {
            "code": "validation_error",
            "message": "Invalid request",
            "field_errors": field_errors,
        }
    }
    return JSONResponse(status_code=422, content=payload)


@app.get("/search", response_class=HTMLResponse)
async def search(request: Request, query: str = "", city: str = ""):
    city_norm = normalize_city_label(city) or city
    # TODO: implement real search logic using normalized city
    results = []  # Placeholder until real search is implemented
    return templates.TemplateResponse(
        "search_results.html",
        {"request": request, "results": results, "query": query, "city": city_norm},
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
