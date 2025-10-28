import asyncio

from app.db.session import AsyncSessionLocal
from app.models.location import Location


async def seed_locations():
    async with AsyncSessionLocal() as db:
        kyiv = Location(city="Kyiv", address="Kyiv", latitude=50.4501, longitude=30.5234)
        db.add(kyiv)
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed_locations())


