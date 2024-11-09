from fastapi import APIRouter

from app.api.api_v1.endpoints import users, services, appointments, reviews, verification, files

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(verification.router, tags=["verification"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
