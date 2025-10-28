from typing import Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api import deps
from app.models.user import User
from app.payments.providers import DummyGateway


router = APIRouter()


class CreatePaymentRequest(BaseModel):
    amount: int
    currency: str = "UAH"
    description: str
    metadata: Dict = {}


@router.post("/create")
async def create_payment(
        payload: CreatePaymentRequest,
        current_user: User = Depends(deps.get_current_active_user),
):
    gateway = DummyGateway()
    return await gateway.create_payment(
        amount=payload.amount,
        currency=payload.currency,
        description=payload.description,
        metadata=payload.metadata,
    )


