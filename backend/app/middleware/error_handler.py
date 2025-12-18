"""Global error handling middleware with i18n and error sanitization."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import BaseAPIException, InternalServerError
from app.core.logging import get_logger
from app.core.i18n import get_language_from_header, t, DEFAULT_LANGUAGE
from app.middleware.request_id import get_request_id
import traceback

logger = get_logger(__name__)


def sanitize_error_message(message: str) -> str:
    """
    Sanitize error messages to remove technical details.
    
    Never expose:
    - Stack traces
    - Database errors
    - Internal system paths
    - Technical exception names
    """
    # Remove common technical patterns
    technical_patterns = [
        "Traceback (most recent call last)",
        "File \"",
        "line ",
        "in ",
        "Exception:",
        "Error:",
        "psycopg2",
        "supabase",
        "sqlalchemy",
        "asyncpg",
        "database",
        "connection",
        "timeout",
    ]
    
    message_lower = message.lower()
    for pattern in technical_patterns:
        if pattern.lower() in message_lower:
            # Return generic message if technical details detected
            return None
    
    return message


def get_user_friendly_error(error_code: str, lang: str, **kwargs) -> str:
    """
    Get user-friendly error message from error code.
    
    Args:
        error_code: Error code (e.g., ERR_AUTH_INVALID_CREDENTIALS)
        lang: Language code
        **kwargs: Format arguments for message
    
    Returns:
        Translated user-friendly error message
    """
    # Map error codes to message keys
    error_code_to_key = {
        "ERR_RESOURCE_NOT_FOUND": "resource_not_found",
        "ERR_VALIDATION_FAILED": "validation_failed",
        "ERR_UNAUTHORIZED": "unauthorized",
        "ERR_FORBIDDEN": "forbidden",
        "ERR_CONFLICT": "conflict",
        "ERR_INSUFFICIENT_STOCK": "insufficient_stock",
        "ERR_INTERNAL_SERVER_ERROR": "internal_server_error",
        "ERR_AUTH_INVALID_CREDENTIALS": "invalid_credentials",
        "ERR_AUTH_EMAIL_NOT_CONFIRMED": "email_not_confirmed",
        "ERR_AUTH_EMAIL_ALREADY_REGISTERED": "email_already_registered",
        "ERR_AUTH_REGISTRATION_FAILED": "registration_failed",
        "ERR_AUTH_LOGIN_FAILED": "login_failed",
        "ERR_AUTH_VERIFICATION_FAILED": "failed_to_verify_email",
        "ERR_AUTH_RESET_TOKEN_INVALID": "invalid_reset_token",
        "ERR_AUTH_RESET_TOKEN_EXPIRED": "reset_token_expired",
        "ERR_AUTH_PASSWORD_RESET_FAILED": "failed_to_reset_password",
        "ERR_PROFILE_UPDATE_FAILED": "failed_to_update_profile",
        "ERR_PROFILE_NOT_FOUND": "user_profile_not_found",
        "ERR_ORDER_CREATE_FAILED": "order_create_failed",
        "ERR_CART_EMPTY": "cart_empty",
        "ERR_PAYMENT_FAILED": "payment_failed",
    }
    
    # Get message key from error code
    message_key = error_code_to_key.get(error_code, "internal_server_error")
    
    # Get translated message
    try:
        return t(message_key, lang, **kwargs)
    except Exception:
        # Fallback to default language
        try:
            return t(message_key, DEFAULT_LANGUAGE, **kwargs)
        except Exception:
            # Final fallback
            return t("internal_server_error", DEFAULT_LANGUAGE)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware to handle errors globally with i18n and sanitization."""
    
    async def dispatch(self, request: Request, call_next):
        """Handle errors and return consistent, sanitized error responses."""
        request_id = get_request_id()
        lang = get_language_from_header(request.headers.get("Accept-Language"))
        
        try:
            response = await call_next(request)
            return response
        except BaseAPIException as e:
            # Handle custom API exceptions with i18n
            # Log technical details server-side only
            if e.technical_details:
                logger.error(
                    "API error with technical details",
                    error_code=e.error_code,
                    technical_details=e.technical_details,
                    path=request.url.path,
                    method=request.method,
                    request_id=request_id,
                    context=e.context
                )
            else:
                logger.warning(
                    "API error",
                    error_code=e.error_code,
                    path=request.url.path,
                    method=request.method,
                    request_id=request_id,
                    context=e.context
                )
            
            # Get user-friendly translated message
            user_message = get_user_friendly_error(e.error_code, lang, **e.context)
            
            # Sanitize any remaining technical details
            sanitized_message = sanitize_error_message(user_message) if user_message else None
            if not sanitized_message:
                # Fallback to generic message if sanitization removed everything
                user_message = get_user_friendly_error("ERR_INTERNAL_SERVER_ERROR", lang)
            else:
                user_message = sanitized_message
            
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": True,
                    "error_code": e.error_code,
                    "message": user_message,
                    "status_code": e.status_code,
                    "request_id": request_id
                }
            )
        except RequestValidationError as e:
            # Handle validation errors
            logger.warning(
                "Validation error",
                path=request.url.path,
                method=request.method,
                request_id=request_id,
                validation_errors=e.errors()
            )
            
            # Get translated validation error message
            user_message = get_user_friendly_error("ERR_VALIDATION_FAILED", lang)
            
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": True,
                    "error_code": "ERR_VALIDATION_FAILED",
                    "message": user_message,
                    "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                    "request_id": request_id
                    # Note: validation details are not exposed to client for security
                }
            )
        except Exception as e:
            # Handle unexpected errors - NEVER expose technical details
            error_traceback = traceback.format_exc()
            
            # Log full technical details server-side only
            logger.error(
                "Unexpected error",
                error_type=type(e).__name__,
                error_message=str(e),
                traceback=error_traceback,
                path=request.url.path,
                method=request.method,
                request_id=request_id
            )
            
            # Always return generic user-friendly message
            user_message = get_user_friendly_error("ERR_INTERNAL_SERVER_ERROR", lang)
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": True,
                    "error_code": "ERR_INTERNAL_SERVER_ERROR",
                    "message": user_message,
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "request_id": request_id
                }
            )

