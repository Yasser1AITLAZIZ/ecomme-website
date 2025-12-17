"""Global error handling middleware."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import BaseAPIException
from app.core.logging import get_logger
from datetime import datetime

logger = get_logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware to handle errors globally."""
    
    async def dispatch(self, request: Request, call_next):
        """Handle errors and return consistent error responses."""
        try:
            response = await call_next(request)
            return response
        except BaseAPIException as e:
            # Handle custom API exceptions
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": True,
                    "message": e.detail,
                    "status_code": e.status_code
                }
            )
        except RequestValidationError as e:
            # Handle validation errors
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": True,
                    "message": "Validation error",
                    "details": e.errors(),
                    "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY
                }
            )
        except Exception as e:
            # Handle unexpected errors
            logger.error(
                "Unexpected error",
                error=str(e),
                path=request.url.path,
                method=request.method
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": True,
                    "message": "Internal server error",
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
                }
            )

