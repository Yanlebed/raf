from typing import Optional
from pydantic import BaseModel
from app.core.enums import ServiceCategory




class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[int] = None  # В минутах
    price: Optional[float] = None
    category: Optional[ServiceCategory] = None
    is_active: Optional[bool] = True
    owner_user_id: Optional[int] = None
    owner_org_id: Optional[int] = None


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration: int  # В минутах (обязательно)
    price: Optional[float] = None
    category: Optional[ServiceCategory] = None
    is_active: Optional[bool] = True
    owner_user_id: Optional[int] = None
    owner_org_id: Optional[int] = None


class ServiceUpdate(ServiceBase):
    pass


class ServiceInDBBase(ServiceBase):
    id: int

    class Config:
        orm_mode = True
        use_enum_values = True


class Service(ServiceInDBBase):
    pass


class ServiceInDB(ServiceInDBBase):
    pass
