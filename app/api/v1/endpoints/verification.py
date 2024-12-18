from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.utils.sms import verify_sms_code
from app.crud.user import get_user_by_phone

router = APIRouter()


@router.post("/verify-phone")
async def verify_phone(
        phone_number: str,
        code: str,
        db: AsyncSession = Depends(deps.get_db),
):
    is_verified = await verify_sms_code(db, phone_number, code)
    if not is_verified:
        raise HTTPException(status_code=400, detail="Неверный или истекший код")
    user = await get_user_by_phone(db, phone=phone_number)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_phone_verified = True
    db.add(user)
    await db.commit()
    return {"msg": "Номер телефона успешно подтвержден"}
