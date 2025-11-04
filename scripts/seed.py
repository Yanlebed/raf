import asyncio
from typing import List

from app.db.session import AsyncSessionLocal
# Ensure all models and mappers are loaded (resolves relationship name lookups)
from app.db import base as _models  # noqa: F401
from app.models.location import Location
from app.core.enums import UserType, ServiceCategory
from app.schemas.user import UserCreate
from app.schemas.service import ServiceCreate
from app.crud.user import create_new_user, get_user_by_phone
from app.crud.service import create_service
from app.models.review import Review


UA_CITIES: List[str] = [
    "Kyiv", "Lviv", "Kharkiv", "Dnipro", "Odesa", "Zaporizhzhia", "Vinnytsia", "Zhytomyr", "Chernihiv",
    "Sumy", "Poltava", "Cherkasy", "Kropyvnytskyi", "Mykolaiv", "Kherson", "Ivano-Frankivsk", "Ternopil",
    "Lutsk", "Uzhhorod", "Rivne", "Chernivtsi"
]


import random


def generate_phone(city_code: str, idx: int) -> str:
    return f"+380{city_code}{idx:06d}"


CITY_PHONE_PREFIX = {
    "Kyiv": "67",
    "Lviv": "68",
    "Odesa": "66",
}


async def seed():
    async with AsyncSessionLocal() as db:
        # Locations
        existing = {loc.city for loc in (await db.execute(Location.__table__.select())).fetchall()}
        for city in UA_CITIES:
            if city not in existing:
                db.add(Location(city=city, address=city))
        await db.commit()

        # Create a few masters and services per some cities
        # Find Location ids
        result = await db.execute(Location.__table__.select())
        rows = result.fetchall()
        city_to_id = {r[1]: r[0] for r in rows}  # id by city

        # Generate 25 specialists per city for Kyiv, Lviv, Odesa
        categories = [ServiceCategory.HAIRCUT, ServiceCategory.MANICURE, None]
        service_name_by_cat = {
            ServiceCategory.HAIRCUT: ["Стрижка чоловіча", "Стрижка жіноча", "Укладка"],
            ServiceCategory.MANICURE: ["Манікюр класичний", "Манікюр гель-лак", "Педикюр"],
            None: ["Масаж спини", "Догляд за обличчям", "Корекція брів"],
        }

        # Ensure some client users exist to author reviews
        client_phones = [f"+3809900{i:04d}" for i in range(1, 21)]
        clients = []
        for idx, cphone in enumerate(client_phones, start=1):
            try:
                cuser = await create_new_user(db, UserCreate(
                    user_type=UserType.CLIENT,
                    phone=cphone,
                    password="password",
                    name=f"Клієнт {idx:02d}",
                    email=f"client_{idx:02d}@raf.ua",
                    city="Kyiv",
                ))
            except Exception:
                await db.rollback()
                cuser = await get_user_by_phone(db, cphone)
            if cuser:
                clients.append(cuser)

        # Emoji sets per category
        emoji_by_cat = {
            ServiceCategory.HAIRCUT: ["💇‍♀️", "💇", "✂️"],
            ServiceCategory.MANICURE: ["💅", "✨", "🌸"],
            None: ["💆", "🧖‍♀️", "🧴"],
        }

        for city in ["Kyiv", "Lviv", "Odesa"]:
            prefix = CITY_PHONE_PREFIX.get(city, "67")
            for i in range(1, 26):
                phone = generate_phone(prefix, i)
                try:
                    user = await create_new_user(db, UserCreate(
                        user_type=UserType.MASTER,
                        phone=phone,
                        password="password",
                        name=f"Майстер {city} {i:02d}",
                        email=f"{city.lower()}_{i:02d}@raf.ua",
                        city=city,
                    ))
                except Exception:
                    await db.rollback()
                user = await get_user_by_phone(db, phone)

                # attach location to enable city-based search and set profile fields
                if user:
                    loc_id = city_to_id.get(city)
                    if loc_id:
                        user.location_id = loc_id
                    try:
                        user.experience_years = random.randint(1, 15)
                        # default emoji avatar (category-specific set below)
                        user.avatar = random.choice(["👤", "🙂", "🧑‍🎨"])  # fallback
                    except Exception:
                        pass
                    db.add(user)
                    try:
                        await db.commit()
                        await db.refresh(user)
                    except Exception:
                        await db.rollback()

                # create 1-2 services per master
                cat = random.choice(categories)
                names = service_name_by_cat.get(cat, ["Послуга"])
                svc_names = random.sample(names, k=min(len(names), random.choice([1, 2])))
                # set emoji avatar based on chosen category
                if user:
                    try:
                        user.avatar = random.choice(emoji_by_cat.get(cat, ["👤"]))
                        db.add(user)
                        await db.commit()
                        await db.refresh(user)
                    except Exception:
                        await db.rollback()
                for svc_name in svc_names:
                    duration = random.choice([30, 45, 60, 90])
                    price = random.choice([300, 400, 500, 700, 900, 1200])
                try:
                    await create_service(db, ServiceCreate(
                            name=svc_name,
                        description=None,
                        duration=duration,
                        price=price,
                            category=cat,
                        is_active=True,
                        owner_user_id=user.id,
                    ))
                except Exception:
                    await db.rollback()

                # create random reviews to generate rating
                if clients and user:
                    reviews_count = random.randint(3, 15)
                    used_clients = random.sample(clients, k=min(reviews_count, len(clients)))
                    for cu in used_clients:
                        try:
                            r = Review(client_id=cu.id, master_id=user.id, rating=random.choice([4, 5]), comment=None, anonymous=False, verified=True)
                            db.add(r)
                        except Exception:
                            await db.rollback()
                    try:
                        await db.commit()
                    except Exception:
                        await db.rollback()


if __name__ == "__main__":
    asyncio.run(seed())


