"""V1 API dependencies."""
from fastapi import Request
from app.api.deps import (
    get_db,
    get_current_user,
    get_current_user_optional,
    validate_uuid_param
)
from app.core.i18n import get_language_from_header

__all__ = [
    "get_db",
    "get_current_user",
    "get_current_user_optional",
    "validate_uuid_param",
    "get_language"
]


def get_language(request: Request) -> str:
    """
    Extract language preference from request headers.
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Language code (en, fr, ar)
    """
    accept_language = request.headers.get("Accept-Language")
    return get_language_from_header(accept_language)

