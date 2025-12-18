"""Custom exception classes with error code system."""
from fastapi import HTTPException, status
from typing import Optional, Dict, Any


class BaseAPIException(HTTPException):
    """Base exception for API errors with error code system."""
    
    def __init__(
        self,
        error_code: str,
        detail: Optional[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        technical_details: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize API exception with error code.
        
        Args:
            error_code: Error code in format ERR_<CATEGORY>_<TYPE> (e.g., ERR_AUTH_INVALID_CREDENTIALS)
            detail: User-friendly error message (will be translated via i18n)
            status_code: HTTP status code
            technical_details: Technical details for logging (never exposed to client)
            context: Additional context for logging
        """
        self.error_code = error_code
        self.technical_details = technical_details
        self.context = context or {}
        # detail will be set by error handler using i18n
        super().__init__(status_code=status_code, detail=detail or error_code)


class NotFoundError(BaseAPIException):
    """Resource not found exception."""
    
    def __init__(self, resource: str, identifier: str, error_code: str = "ERR_RESOURCE_NOT_FOUND"):
        super().__init__(
            error_code=error_code,
            detail=f"{resource} with id {identifier} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            context={"resource": resource, "identifier": identifier}
        )


class ValidationError(BaseAPIException):
    """Validation error exception."""
    
    def __init__(self, detail: str, error_code: str = "ERR_VALIDATION_FAILED", validation_errors: Optional[list] = None):
        super().__init__(
            error_code=error_code,
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            context={"validation_errors": validation_errors or []}
        )


class UnauthorizedError(BaseAPIException):
    """Unauthorized access exception."""
    
    def __init__(self, error_code: str = "ERR_UNAUTHORIZED", detail: Optional[str] = None):
        super().__init__(
            error_code=error_code,
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class ForbiddenError(BaseAPIException):
    """Forbidden access exception."""
    
    def __init__(self, error_code: str = "ERR_FORBIDDEN", detail: Optional[str] = None):
        super().__init__(
            error_code=error_code,
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN
        )


class ConflictError(BaseAPIException):
    """Resource conflict exception."""
    
    def __init__(self, error_code: str = "ERR_CONFLICT", detail: Optional[str] = None):
        super().__init__(
            error_code=error_code,
            detail=detail,
            status_code=status.HTTP_409_CONFLICT
        )


class StockError(BaseAPIException):
    """Stock availability error."""
    
    def __init__(self, error_code: str = "ERR_INSUFFICIENT_STOCK", detail: Optional[str] = None, product_id: Optional[str] = None):
        super().__init__(
            error_code=error_code,
            detail=detail,
            status_code=status.HTTP_400_BAD_REQUEST,
            context={"product_id": product_id}
        )


class InternalServerError(BaseAPIException):
    """Internal server error - never expose technical details to client."""
    
    def __init__(self, error_code: str = "ERR_INTERNAL_SERVER_ERROR", technical_details: Optional[str] = None):
        super().__init__(
            error_code=error_code,
            detail="An unexpected error occurred. Please try again later.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            technical_details=technical_details
        )

