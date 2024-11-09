from typing import Optional
from enum import Enum
from pydantic import BaseModel


class ServiceCategory(str, Enum):
    HAIRCUT = "Стрижка"
    MANICURE = "Маникюр"
    # Добавьте другие категории по необходимости


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[int] = None  # В минутах
    price: Optional[float] = None
    category: Optional[ServiceCategory] = None
    is_active: Optional[bool] = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(ServiceBase):
    pass


class ServiceInDBBase(ServiceBase):
    id: int

    class Config:
        orm_mode = True


class Service(ServiceInDBBase):
    pass


class ServiceInDB(ServiceInDBBase):
    pass
