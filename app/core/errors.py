from typing import List, Optional

from fastapi import HTTPException, status


def http_error(
    *,
    status_code: int,
    code: str,
    message: str,
    field_errors: Optional[List[dict]] = None,
    headers: Optional[dict] = None,
) -> HTTPException:
    """
    Helper to raise HTTPException with a standardized error payload.

    Example payload:
    {
        "detail": {
            "code": "invalid_credentials",
            "message": "Неверное имя пользователя или пароль",
            "field_errors": [...],
        }
    }
    """
    detail: dict = {"code": code, "message": message}
    if field_errors:
        detail["field_errors"] = field_errors
    return HTTPException(status_code=status_code, detail=detail, headers=headers)


def bad_request(code: str, message: str, field_errors: Optional[List[dict]] = None) -> HTTPException:
    return http_error(status_code=status.HTTP_400_BAD_REQUEST, code=code, message=message, field_errors=field_errors)


def unauthorized(code: str, message: str) -> HTTPException:
    return http_error(
        status_code=status.HTTP_401_UNAUTHORIZED,
        code=code,
        message=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def not_found(code: str, message: str) -> HTTPException:
    return http_error(status_code=status.HTTP_404_NOT_FOUND, code=code, message=message)


def too_many_requests(code: str, message: str) -> HTTPException:
    return http_error(status_code=status.HTTP_429_TOO_MANY_REQUESTS, code=code, message=message)


