from typing import List, Optional

from pydantic import BaseModel


class Message(BaseModel):
    detail: str


class FieldError(BaseModel):
    field: str
    message: str
    type: Optional[str] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    field_errors: Optional[List[FieldError]] = None


class ErrorResponse(BaseModel):
    detail: ErrorDetail
