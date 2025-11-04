from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()


class LeadRequest(BaseModel):
  name: str
  phone: str
  message: Optional[str] = None


@router.post("/")
async def create_lead(payload: LeadRequest):
  # Minimal MVP: in real world, write to DB or send email/Slack
  return {"status": "ok"}


