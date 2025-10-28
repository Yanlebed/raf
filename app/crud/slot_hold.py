from datetime import datetime, timedelta
from typing import Optional, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.slot_hold import SlotHold


async def create_hold(db: AsyncSession, master_id: int, service_id: int, start_time: datetime, end_time: datetime) -> SlotHold:
    hold = SlotHold(master_id=master_id, service_id=service_id, start_time=start_time, end_time=end_time)
    db.add(hold)
    await db.commit()
    await db.refresh(hold)
    return hold


async def get_active_holds(db: AsyncSession, master_id: int, start_time: datetime, end_time: datetime) -> Sequence[SlotHold]:
    result = await db.execute(
        select(SlotHold).where(
            SlotHold.master_id == master_id,
            SlotHold.end_time > start_time,
            SlotHold.start_time < end_time,
        )
    )
    return result.scalars().all()


async def delete_hold(db: AsyncSession, hold_id: int) -> Optional[SlotHold]:
    result = await db.execute(select(SlotHold).where(SlotHold.id == hold_id))
    hold = result.scalars().first()
    if hold:
        await db.delete(hold)
        await db.commit()
    return hold


