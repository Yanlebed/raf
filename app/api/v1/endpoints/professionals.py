from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.schemas.user import User
from app.crud.user import get_professionals_by_city, count_professionals_by_city
from app.models.user import User as UserModel
from app.core.enums import OrganizationRole, UserType
from app.models.user_organization import UserOrganization
from sqlalchemy.future import select
from sqlalchemy import func, asc
from app.models.location import Location
from app.models.review import Review
from app.models.associations import user_services
from app.models.service import Service as ServiceModel


router = APIRouter()


@router.get("/")
async def list_professionals(
        *,
        db: AsyncSession = Depends(deps.get_db),
        city: str = "Kyiv",
        q: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        current_user: UserModel = Depends(deps.get_current_active_user),
        org_only: bool = False,
        sort: Optional[str] = None,  # rating | distance | price_asc | price_desc
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        service_id: Optional[int] = None,
):
    # Admin: city-scoped search
    if current_user.user_type == UserType.ADMIN and not org_only:
        # Build base query to support sorting
        stmt = (
            select(UserModel)
            .join(Location, Location.id == UserModel.location_id, isouter=True)
            .where(
                Location.city == city,
                UserModel.user_type.in_([UserType.MASTER, UserType.SALON])
            )
        )
        if q:
            stmt = stmt.where((UserModel.name.ilike(f"%{q}%")) | (UserModel.short_description.ilike(f"%{q}%")))
        # Sorting
        if sort == "rating":
            avg_rating = (
                select(func.avg(Review.rating))
                .where((Review.master_id == UserModel.id) | (Review.salon_id == UserModel.id))
            ).scalar_subquery()
            stmt = stmt.order_by(func.coalesce(avg_rating, 0).desc())
        elif sort == "distance" and lat is not None and lng is not None:
            dist = (func.pow(Location.latitude - lat, 2) + func.pow(Location.longitude - lng, 2))
            stmt = stmt.order_by(asc(dist))
        elif sort in ("price_asc", "price_desc") and service_id is not None:
            stmt = (
                stmt.join(user_services, user_services.c.user_id == UserModel.id)
                .join(ServiceModel, ServiceModel.id == user_services.c.service_id)
                .where(ServiceModel.id == service_id)
                .order_by(ServiceModel.price.asc() if sort == "price_asc" else ServiceModel.price.desc())
            )
        stmt = stmt.offset(skip).limit(limit)
        items = (await db.execute(stmt)).scalars().all()
        # Total with service filter, otherwise count by city
        if sort in ("price_asc", "price_desc") and service_id is not None:
            total_stmt = (
                select(func.count(UserModel.id))
                .join(Location, Location.id == UserModel.location_id, isouter=True)
                .join(user_services, user_services.c.user_id == UserModel.id)
                .join(ServiceModel, ServiceModel.id == user_services.c.service_id)
                .where(
                    Location.city == city,
                    UserModel.user_type.in_([UserType.MASTER, UserType.SALON]),
                    ServiceModel.id == service_id,
                )
            )
            if q:
                total_stmt = total_stmt.where((UserModel.name.ilike(f"%{q}%")) | (UserModel.short_description.ilike(f"%{q}%")))
            total = (await db.execute(total_stmt)).scalar_one()
        else:
            total = await count_professionals_by_city(db, city=city, q=q)
        return {"items": items, "skip": skip, "limit": limit, "total": total}

    # Org OWNER/MANAGER with org_only: list only their org masters
    if org_only:
        org_ids = (await db.execute(
            select(UserOrganization.organization_id).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )).scalars().all()
        if not org_ids:
            return {"items": [], "skip": skip, "limit": limit, "total": 0}
        master_ids = (await db.execute(
            select(UserOrganization.user_id).where(UserOrganization.organization_id.in_(org_ids))
        )).scalars().all()
        from sqlalchemy import and_, or_
        from app.models.user import User as UserModel2
        from app.models.location import Location
        stmt = (
            select(UserModel2)
            .join(Location, Location.id == UserModel2.location_id, isouter=True)
            .where(UserModel2.id.in_(master_ids))
        )
        if q:
            stmt = stmt.where(or_(UserModel2.name.ilike(f"%{q}%"), UserModel2.short_description.ilike(f"%{q}%")))
        stmt = stmt.offset(skip).limit(limit)
        items = (await db.execute(stmt)).scalars().all()
        total = len(items)
        return {"items": items, "skip": skip, "limit": limit, "total": total}

    # Default: city-scoped search
    # fallback to city-scoped query with optional sorting
    stmt = (
        select(UserModel)
        .join(Location, Location.id == UserModel.location_id, isouter=True)
        .where(
            Location.city == city,
            UserModel.user_type.in_([UserType.MASTER, UserType.SALON])
        )
    )
    if q:
        stmt = stmt.where((UserModel.name.ilike(f"%{q}%")) | (UserModel.short_description.ilike(f"%{q}%")))
    if sort == "rating":
        avg_rating = (
            select(func.avg(Review.rating))
            .where((Review.master_id == UserModel.id) | (Review.salon_id == UserModel.id))
        ).scalar_subquery()
        stmt = stmt.order_by(func.coalesce(avg_rating, 0).desc())
    elif sort == "distance" and lat is not None and lng is not None:
        dist = (func.pow(Location.latitude - lat, 2) + func.pow(Location.longitude - lng, 2))
        stmt = stmt.order_by(asc(dist))
    elif sort in ("price_asc", "price_desc") and service_id is not None:
        stmt = (
            stmt.join(user_services, user_services.c.user_id == UserModel.id)
            .join(ServiceModel, ServiceModel.id == user_services.c.service_id)
            .where(ServiceModel.id == service_id)
            .order_by(ServiceModel.price.asc() if sort == "price_asc" else ServiceModel.price.desc())
        )
    stmt = stmt.offset(skip).limit(limit)
    items = (await db.execute(stmt)).scalars().all()
    if sort in ("price_asc", "price_desc") and service_id is not None:
        total_stmt = (
            select(func.count(UserModel.id))
            .join(Location, Location.id == UserModel.location_id, isouter=True)
            .join(user_services, user_services.c.user_id == UserModel.id)
            .join(ServiceModel, ServiceModel.id == user_services.c.service_id)
            .where(
                Location.city == city,
                UserModel.user_type.in_([UserType.MASTER, UserType.SALON]),
                ServiceModel.id == service_id,
            )
        )
        if q:
            total_stmt = total_stmt.where((UserModel.name.ilike(f"%{q}%")) | (UserModel.short_description.ilike(f"%{q}%")))
        total = (await db.execute(total_stmt)).scalar_one()
    else:
        total = await count_professionals_by_city(db, city=city, q=q)
    return {"items": items, "skip": skip, "limit": limit, "total": total}


