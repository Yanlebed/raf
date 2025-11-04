from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from typing import List

from app import schemas
from app.api import deps

from app.models.user import User, UserType
from app.schemas.service import Service
from app.core.enums import OrganizationRole
from app.models.user_organization import UserOrganization
from sqlalchemy.future import select
from app.models.service import Service as ServiceModel
from app.models.master_schedule import MasterSchedule
from app.crud.appointment import get_appointments_for_master_on_date
from app.utils.availability import compute_daily_slots
from app.utils.redis_client import get_redis

from app.crud.service import (
    get_service as crud_get_service,
    get_services as crud_get_services,
    create_service as crud_create_service,
    update_service as crud_update_service,
    delete_service as crud_delete_service,
    get_services_by_city as crud_get_services_by_city,
    count_services_by_city as crud_count_services_by_city,
)

router = APIRouter()
@router.get("/public/available")
async def available_services(
    *,
    city: str,
    start_date: str,
    end_date: str,
    q: str | None = None,
    db: AsyncSession = Depends(deps.get_db),
):
    # Normalize city
    city_map = {"Київ": "Kyiv", "Львів": "Lviv", "Одеса": "Odesa"}
    city_norm = city_map.get(city, city)
    base = await crud_get_services_by_city(db, city=city_norm, skip=0, limit=2000, q=q)
    from datetime import datetime, timedelta
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        return {"service_ids": []}
    if end < start:
        return {"service_ids": []}
    owners = [s.owner_user_id for s in base if s.owner_user_id]
    if not owners:
        return {"service_ids": []}
    weekdays = set()
    cur = start
    while cur <= end:
        weekdays.add(cur.weekday())
        cur += timedelta(days=1)
    sched_rows = (await db.execute(
        select(MasterSchedule.master_id).where(
            MasterSchedule.master_id.in_(owners),
            MasterSchedule.day_of_week.in_(list(weekdays))
        )
    )).scalars().all()
    allowed = set(sched_rows)
    ids = [s.id for s in base if s.owner_user_id in allowed]
    return {"service_ids": ids}


@router.get("/public")
async def read_public_services(
    skip: int = 0,
    limit: int = 100,
    city: str = "Kyiv",
    q: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    rating_min: float | None = None,
    accept_home: bool | None = None,
    at_salon: bool | None = None,
    own_premises: bool | None = None,
    visiting_client: bool | None = None,
    user_lat: float | None = None,
    user_lon: float | None = None,
    max_distance_km: float | None = None,
    sort: str | None = None,
    db: AsyncSession = Depends(deps.get_db),
):
    # Normalize city (accept UA labels)
    city_map = {
        "Київ": "Kyiv",
        "Львів": "Lviv",
        "Одеса": "Odesa",
    }
    city_norm = city_map.get(city, city)
    # Base list by city
    base = await crud_get_services_by_city(db, city=city_norm, skip=0, limit=10000, q=q)
    # Optional date filtering: keep services that have any free slot in the range
    if start_date and end_date:
        from datetime import datetime, timedelta
        try:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
        except ValueError:
            start = end = None
        filtered = []
        if start and end and start <= end:
            # Optimize: filter by schedules only (coarse availability)
            owners = [s.owner_user_id for s in base if s.owner_user_id]
            if owners:
                weekdays = set()
                cur = start
                while cur <= end:
                    weekdays.add(cur.weekday())
                    cur += timedelta(days=1)
                sched_rows = (await db.execute(
                    select(MasterSchedule.master_id).where(
                        MasterSchedule.master_id.in_(owners),
                        MasterSchedule.day_of_week.in_(list(weekdays))
                    )
                )).scalars().all()
                allowed = set(sched_rows)
                filtered = [s for s in base if s.owner_user_id in allowed]
            items = filtered
        else:
            items = base
    else:
        items = base
    # Basic price filter
    if price_min is not None:
        items = [s for s in items if getattr(s, "price", None) is not None and s.price >= price_min]
    if price_max is not None:
        items = [s for s in items if getattr(s, "price", None) is not None and s.price <= price_max]

    # Reception filters (best-effort mapping)
    if any(v is True for v in [accept_home, at_salon, own_premises, visiting_client]):
        from app.models.user import User as UserModel
        from app.models.organization import Organization as OrgModel
        from app.models.location import Location as LocationModel
        # Prefetch owners
        owner_user_ids = list({s.owner_user_id for s in items if s.owner_user_id})
        owner_org_ids = list({s.owner_org_id for s in items if s.owner_org_id})
        users_map = {}
        orgs_map = {}
        if owner_user_ids:
            users = (await db.execute(select(UserModel).where(UserModel.id.in_(owner_user_ids)))).scalars().all()
            users_map = {u.id: u for u in users}
        if owner_org_ids:
            orgs = (await db.execute(select(OrgModel).where(OrgModel.id.in_(owner_org_ids)))).scalars().all()
            orgs_map = {o.id: o for o in orgs}

        def matches(s):
            u = users_map.get(s.owner_user_id)
            o = orgs_map.get(s.owner_org_id)
            # visiting_client: approximate by home_service flag
            if visiting_client is True and not getattr(u, "home_service", False):
                return False
            # accept_home: same mapping to home_service for now
            if accept_home is True and not getattr(u, "home_service", False):
                return False
            # at_salon: service belongs to an organization
            if at_salon is True and not s.owner_org_id:
                return False
            # own_premises: individual master with own location
            if own_premises is True and not (s.owner_org_id is None and getattr(u, "location_id", None)):
                return False
            return True

        items = [s for s in items if matches(s)]

    # Rating filter (compute per owner)
    if rating_min is not None:
        from app.models.review import Review as ReviewModel
        from sqlalchemy import func as sa_func
        owner_ids = list({s.owner_user_id for s in items if s.owner_user_id})
        if owner_ids:
            rows = (await db.execute(
                select(ReviewModel.master_id, sa_func.avg(ReviewModel.rating))
                .where(ReviewModel.master_id.in_(owner_ids))
                .group_by(ReviewModel.master_id)
            )).all()
            avg_map = {mid: float(avg or 0) for (mid, avg) in rows}
            items = [s for s in items if avg_map.get(s.owner_user_id, 0.0) >= rating_min]

    # Set default sort if not provided
    if not sort:
        sort = "rating_desc"

    # Distance filter (haversine in Python)
    if user_lat is not None and user_lon is not None and max_distance_km is not None:
        from math import radians, sin, cos, asin, sqrt
        from app.models.user import User as UserModel
        from app.models.organization import Organization as OrgModel
        from app.models.location import Location as LocationModel
        owner_user_ids = list({s.owner_user_id for s in items if s.owner_user_id})
        owner_org_ids = list({s.owner_org_id for s in items if s.owner_org_id})
        users_map = {}
        orgs_map = {}
        loc_ids = set()
        if owner_user_ids:
            users = (await db.execute(select(UserModel).where(UserModel.id.in_(owner_user_ids)))).scalars().all()
            users_map = {u.id: u for u in users}
            for u in users:
                if getattr(u, "location_id", None):
                    loc_ids.add(u.location_id)
        if owner_org_ids:
            orgs = (await db.execute(select(OrgModel).where(OrgModel.id.in_(owner_org_ids)))).scalars().all()
            orgs_map = {o.id: o for o in orgs}
            for o in orgs:
                if getattr(o, "location_id", None):
                    loc_ids.add(o.location_id)
        loc_map = {}
        if loc_ids:
            locs = (await db.execute(select(LocationModel).where(LocationModel.id.in_(list(loc_ids))))).scalars().all()
            loc_map = {l.id: l for l in locs}

        def haversine_km(lat1, lon1, lat2, lon2):
            # approximate Earth radius in km
            R = 6371.0
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c

        def within_distance(s):
            u = users_map.get(s.owner_user_id)
            o = orgs_map.get(s.owner_org_id)
            loc = None
            if u and getattr(u, "location_id", None):
                loc = loc_map.get(u.location_id)
            if not loc and o and getattr(o, "location_id", None):
                loc = loc_map.get(o.location_id)
            if not loc or loc.latitude is None or loc.longitude is None:
                return False
            d = haversine_km(float(user_lat), float(user_lon), float(loc.latitude), float(loc.longitude))
            return d <= float(max_distance_km)

        items = [s for s in items if within_distance(s)]

    # Sort by distance if requested (requires user_lat/lon)
    if sort == "distance" and user_lat is not None and user_lon is not None:
        from math import radians, sin, cos, asin, sqrt
        from app.models.user import User as UserModel
        from app.models.organization import Organization as OrgModel
        from app.models.location import Location as LocationModel
        owner_user_ids = list({s.owner_user_id for s in items if s.owner_user_id})
        owner_org_ids = list({s.owner_org_id for s in items if s.owner_org_id})
        users_map = {}
        orgs_map = {}
        loc_ids = set()
        if owner_user_ids:
            users = (await db.execute(select(UserModel).where(UserModel.id.in_(owner_user_ids)))).scalars().all()
            users_map = {u.id: u for u in users}
            for u in users:
                if getattr(u, "location_id", None):
                    loc_ids.add(u.location_id)
        if owner_org_ids:
            orgs = (await db.execute(select(OrgModel).where(OrgModel.id.in_(owner_org_ids)))).scalars().all()
            orgs_map = {o.id: o for o in orgs}
            for o in orgs:
                if getattr(o, "location_id", None):
                    loc_ids.add(o.location_id)
        loc_map = {}
        if loc_ids:
            locs = (await db.execute(select(LocationModel).where(LocationModel.id.in_(list(loc_ids))))).scalars().all()
            loc_map = {l.id: l for l in locs}

        def haversine_km(lat1, lon1, lat2, lon2):
            R = 6371.0
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c

        def dist_for(s):
            u = users_map.get(s.owner_user_id)
            o = orgs_map.get(s.owner_org_id)
            loc = None
            if u and getattr(u, "location_id", None):
                loc = loc_map.get(u.location_id)
            if not loc and o and getattr(o, "location_id", None):
                loc = loc_map.get(o.location_id)
            if not loc or loc.latitude is None or loc.longitude is None:
                return None
            return haversine_km(float(user_lat), float(user_lon), float(loc.latitude), float(loc.longitude))

        items = sorted(items, key=lambda s: (dist_for(s) is None, dist_for(s) or 1e9))

    # Sort by price asc/desc
    if sort in ("price_asc", "price_desc"):
        reverse = sort == "price_desc"
        def price_key(s):
            p = getattr(s, "price", None)
            # None prices should go last in asc, last in desc as well
            return (p is None, float(p) if p is not None else 0.0)
        items = sorted(items, key=price_key, reverse=reverse)

    # Sort by rating desc (owner's average)
    if sort == "rating_desc":
        from app.models.review import Review as ReviewModel
        owner_ids_all = list({s.owner_user_id for s in items if s.owner_user_id})
        avg_map_all = {}
        if owner_ids_all:
            rows = (await db.execute(
                select(ReviewModel.master_id, func.avg(ReviewModel.rating))
                .where(ReviewModel.master_id.in_(owner_ids_all))
                .group_by(ReviewModel.master_id)
            )).all()
            avg_map_all = {int(mid): float(avg or 0) for (mid, avg) in rows}
        def rating_key(s):
            r = avg_map_all.get(getattr(s, "owner_user_id", None))
            return (r is None, -(r or 0.0))
        # Since key returns negative for higher ratings, no reverse needed
        items = sorted(items, key=rating_key)

    total = len(items)
    # paginate after filtering
    items = items[skip: skip + limit]

    # Aggregate ratings for owners present in the page
    owners_in_page = list({s.owner_user_id for s in items if getattr(s, "owner_user_id", None)})
    owners_ratings: dict[int, dict[str, float | int]] = {}
    if owners_in_page:
        from app.models.review import Review as ReviewModel
        rows_avg = (await db.execute(
            select(ReviewModel.master_id, func.avg(ReviewModel.rating), func.count(ReviewModel.id))
            .where(ReviewModel.master_id.in_(owners_in_page))
            .group_by(ReviewModel.master_id)
        )).all()
        for mid, avg, cnt in rows_avg:
            owners_ratings[int(mid)] = {"avg": float(avg or 0), "count": int(cnt or 0)}

    # Collect owner locations for map markers
    owners_locations: dict[int, dict[str, float]] = {}
    if owners_in_page:
        from app.models.user import User as UserModel
        from app.models.organization import Organization as OrgModel
        from app.models.location import Location as LocationModel
        user_rows = (await db.execute(select(UserModel).where(UserModel.id.in_(owners_in_page)))).scalars().all()
        loc_ids = set(u.location_id for u in user_rows if getattr(u, "location_id", None))
        loc_map = {}
        if loc_ids:
            locs = (await db.execute(select(LocationModel).where(LocationModel.id.in_(list(loc_ids))))).scalars().all()
            loc_map = {l.id: l for l in locs}
        for u in user_rows:
            lid = getattr(u, "location_id", None)
            if lid and lid in loc_map:
                loc = loc_map[lid]
                if loc.latitude is not None and loc.longitude is not None:
                    owners_locations[int(u.id)] = {"lat": float(loc.latitude), "lon": float(loc.longitude)}

    return {"items": items, "skip": skip, "limit": limit, "total": total, "owners_ratings": owners_ratings, "owners_locations": owners_locations}


@router.get("/public/{service_id}", response_model=schemas.service.Service)
async def read_public_service_detail(
    service_id: int,
    db: AsyncSession = Depends(deps.get_db),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return service


@router.get("/public/{service_id}/slots")
async def read_public_service_slots(
    *,
    service_id: int,
    date: str,
    db: AsyncSession = Depends(deps.get_db),
):
    from datetime import datetime
    service = await crud_get_service(db=db, service_id=service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    if not service.owner_user_id:
        raise HTTPException(status_code=400, detail="У услуги не назначен мастер")
    try:
        day = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверная дата")
    # Cache per master/day
    cache = await get_redis()
    cache_key = None
    if cache:
        cache_key = f"slots:service:{service.id}:master:{service.owner_user_id}:{day.date().isoformat()}"
        cached = await cache.get(cache_key)
        if cached:
            return cached
    schedules = (await db.execute(
        select(MasterSchedule).where(MasterSchedule.master_id == service.owner_user_id)
    )).scalars().all()
    appointments = await get_appointments_for_master_on_date(db, master_id=service.owner_user_id, day=day)
    duration = service.duration or None
    slots = compute_daily_slots(schedules, appointments, day, service_duration_minutes=duration)
    result = [dt.isoformat() for dt in slots]
    if cache and cache_key:
        await cache.set(cache_key, result, ex=60)
    return result


@router.get("/public/{service_id}/masters")
async def read_public_service_masters(
    *,
    service_id: int,
    db: AsyncSession = Depends(deps.get_db),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    masters: list[int] = []
    if service.owner_org_id:
        masters = (await db.execute(
            select(UserOrganization.user_id).where(UserOrganization.organization_id == service.owner_org_id)
        )).scalars().all()
    elif service.owner_user_id:
        masters = [service.owner_user_id]
    if not masters:
        return []
    # Filter only users with MASTER type
    from app.models.user import User as UserModel
    from app.core.enums import UserType
    users = (await db.execute(
        select(UserModel).where(UserModel.id.in_(masters), UserModel.user_type == UserType.MASTER)
    )).scalars().all()
    return [
        {"id": u.id, "name": getattr(u, "name", None), "phone": getattr(u, "phone", None)} for u in users
    ]


@router.get("/public/{service_id}/masters/{master_id}/slots")
async def read_public_service_master_slots(
    *,
    service_id: int,
    master_id: int,
    date: str,
    db: AsyncSession = Depends(deps.get_db),
):
    from datetime import datetime
    service = await crud_get_service(db=db, service_id=service_id)
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    # Ensure master is allowed for this service (owner or in org)
    allowed_master_ids: list[int] = []
    if service.owner_user_id:
        allowed_master_ids = [service.owner_user_id]
    if service.owner_org_id:
        org_master_ids = (await db.execute(
            select(UserOrganization.user_id).where(UserOrganization.organization_id == service.owner_org_id)
        )).scalars().all()
        allowed_master_ids = list(set(allowed_master_ids + org_master_ids))
    if master_id not in allowed_master_ids:
        raise HTTPException(status_code=404, detail="Мастер не связан с услугой")
    try:
        day = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверная дата")
    cache = await get_redis()
    cache_key = None
    if cache:
        cache_key = f"slots:master:{master_id}:service:{service_id}:{day.date().isoformat()}"
        cached = await cache.get(cache_key)
        if cached:
            return cached
    schedules = (await db.execute(
        select(MasterSchedule).where(MasterSchedule.master_id == master_id)
    )).scalars().all()
    appointments = await get_appointments_for_master_on_date(db, master_id=master_id, day=day)
    duration = service.duration or None
    slots = compute_daily_slots(schedules, appointments, day, service_duration_minutes=duration)
    result = [dt.isoformat() for dt in slots]
    if cache and cache_key:
        await cache.set(cache_key, result, ex=60)
    return result


@router.get("/")
async def read_services(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type == UserType.ADMIN:
        items = await crud_get_services(db, skip=skip, limit=limit)
        # Optional: total for admin services listing
        total = (await db.execute(select(ServiceModel))).scalars().count() if False else None
        return {"items": items, "skip": skip, "limit": limit, "total": total}
    org_ids = (await db.execute(
        select(UserOrganization.organization_id).where(
            UserOrganization.user_id == current_user.id,
            UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
        )
    )).scalars().all()
    if not org_ids:
        # Return only services owned by the user
        result = await db.execute(
            select(ServiceModel).where(ServiceModel.owner_user_id == current_user.id).offset(skip).limit(limit)
        )
    else:
        result = await db.execute(
            select(ServiceModel).where(
                (ServiceModel.owner_user_id == current_user.id) | (ServiceModel.owner_org_id.in_(org_ids))
            ).offset(skip).limit(limit)
        )
    items = result.scalars().all()
    # Simple total: count matching rows
    total_stmt = select(func.count(ServiceModel.id))
    if not org_ids:
        total_stmt = total_stmt.where(ServiceModel.owner_user_id == current_user.id)
    else:
        total_stmt = total_stmt.where((ServiceModel.owner_user_id == current_user.id) | (ServiceModel.owner_org_id.in_(org_ids)))
    total = (await db.execute(total_stmt)).scalar_one()
    return {"items": items, "skip": skip, "limit": limit, "total": total}


@router.post("/", response_model=schemas.service.Service)
async def create_service_endpoint(
    *,
    db: AsyncSession = Depends(deps.get_db),
    service_in: schemas.service.ServiceCreate,
    current_user: User = Depends(deps.get_current_active_user),
):
    if current_user.user_type not in [UserType.ADMIN, UserType.MASTER]:
        raise HTTPException(status_code=400, detail="Недостаточно прав для создания услуги.")
    # Ownership and permissions
    if service_in.owner_org_id:
        if current_user.user_type != UserType.ADMIN:
            # Must be OWNER or MANAGER in the target organization
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service_in.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            membership = result.scalars().first()
            if not membership:
                raise HTTPException(status_code=403, detail="Недостаточно прав для создания услуги в организации.")
    elif service_in.owner_user_id and service_in.owner_user_id != current_user.id and current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Вы не можете создавать услугу для другого пользователя.")
    else:
        # Default owner to current user if none provided
        if not service_in.owner_user_id and not service_in.owner_org_id:
            service_in.owner_user_id = current_user.id
    service = await crud_create_service(db=db, service_in=service_in)
    return service


@router.put("/{service_id}", response_model=schemas.service.Service)
async def update_service_endpoint(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        service_in: schemas.service.ServiceUpdate,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type != UserType.ADMIN:
        allowed = False
        # Owner-user can edit
        if service.owner_user_id and service.owner_user_id == current_user.id:
            allowed = True
        # Organization OWNER/MANAGER can edit
        if service.owner_org_id and not allowed:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            if result.scalars().first():
                allowed = True
        if not allowed:
            raise HTTPException(status_code=403, detail="Недостаточно прав для обновления услуги.")
    service = await crud_update_service(db=db, db_service=service, service_in=service_in)
    return service


@router.delete("/{service_id}", response_model=schemas.service.Service)
async def delete_service_endpoint(
        *,
        db: AsyncSession = Depends(deps.get_db),
        service_id: int,
        current_user: User = Depends(deps.get_current_active_user),
):
    service = await crud_get_service(db=db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена.")
    if current_user.user_type != UserType.ADMIN:
        allowed = False
        if service.owner_user_id and service.owner_user_id == current_user.id:
            allowed = True
        if service.owner_org_id and not allowed:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == service.owner_org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER]),
                )
            )
            if result.scalars().first():
                allowed = True
        if not allowed:
            raise HTTPException(status_code=403, detail="Недостаточно прав для удаления услуги.")
    service = await crud_delete_service(db=db, service_id=service_id)
    return service
