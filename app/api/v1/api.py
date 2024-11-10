from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, services, appointments, reviews, verification, files

api_router = APIRouter()

# Маршруты для аутентификации
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(verification.router, tags=["verification"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
