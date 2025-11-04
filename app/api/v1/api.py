from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, services, appointments, reviews, verification, files, professionals, payments, calendar, schedules, holds, recommendations, lead, locations

api_router = APIRouter()

# Маршруты для аутентификации
api_router.include_router(auth.router, prefix="/login", tags=["auth"])  # normalized auth prefix
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(verification.router, tags=["verification"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(holds.router, prefix="/holds", tags=["holds"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(lead.router, prefix="/lead", tags=["lead"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
