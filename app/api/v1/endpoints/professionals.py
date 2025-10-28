from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.schemas.user import User
from app.crud.user import get_professionals_by_city
from app.models.user import User as UserModel
from app.core.enums import OrganizationRole, UserType
from app.models.user_organization import UserOrganization
from sqlalchemy.future import select


router = APIRouter()


@router.get("/", response_model=List[User])
async def list_professionals(
        *,
        db: AsyncSession = Depends(deps.get_db),
        city: str = "Kyiv",
        q: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        current_user: UserModel = Depends(deps.get_current_active_user),
        org_only: bool = False,
):
    # Admin: city-scoped search
    if current_user.user_type == UserType.ADMIN and not org_only:
        return await get_professionals_by_city(db, city=city, skip=skip, limit=limit, q=q)

    # Org OWNER/MANAGER with org_only: list only their org masters
    if org_only:
        org_ids = (await db.execute(
            select(UserOrganization.organization_id).where(
                UserOrganization.user_id == current_user.id,
                UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
            )
        )).scalars().all()
        if not org_ids:
            return []
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
        return (await db.execute(stmt)).scalars().all()

    # Default: city-scoped search
    return await get_professionals_by_city(db, city=city, skip=skip, limit=limit, q=q)


