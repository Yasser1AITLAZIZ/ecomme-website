"""Rate limiting configuration."""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.config import settings


# Initialize limiter
limiter = Limiter(
    key_func=get_remote_address,
    enabled=settings.RATE_LIMIT_ENABLED
)


def get_rate_limit_key(request: Request) -> str:
    """
    Get rate limit key from request.
    Can be customized to use user ID instead of IP.
    
    Args:
        request: FastAPI request
        
    Returns:
        Rate limit key (IP address by default)
    """
    return get_remote_address(request)


# Rate limit decorator
def rate_limit(limit: str):
    """
    Decorator for rate limiting.
    
    Args:
        limit: Rate limit string (e.g., "100/minute")
        
    Returns:
        Decorator function
    """
    def wrapper(func):
        try:
            decorated = limiter.limit(limit)(func)
            return decorated
        except Exception as e:
            raise
    
    return wrapper


