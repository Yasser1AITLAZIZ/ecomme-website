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
    # #region agent log
    import json, inspect
    try:
        with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"D","location":"rate_limit.py:31","message":"rate_limit decorator called","data":{"limit":limit},"timestamp":__import__("time").time()*1000})+"\n")
    except: pass
    # #endregion
    
    def wrapper(func):
        # #region agent log
        try:
            sig = inspect.signature(func)
            params = list(sig.parameters.keys())
            param_details = {name: str(param.annotation) for name, param in sig.parameters.items()}
            has_request = "request" in params
            with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"A","location":"rate_limit.py:45","message":"Decorating function","data":{"func_name":func.__name__,"params":params,"param_details":param_details,"has_request":has_request,"limit":limit},"timestamp":__import__("time").time()*1000})+"\n")
        except Exception as e:
            try:
                with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"A","location":"rate_limit.py:50","message":"Error inspecting function","data":{"func_name":getattr(func,"__name__","unknown"),"error":str(e)},"timestamp":__import__("time").time()*1000})+"\n")
            except: pass
        # #endregion
        try:
            decorated = limiter.limit(limit)(func)
            # #region agent log
            try:
                with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"A","location":"rate_limit.py:63","message":"Decorator applied successfully","data":{"func_name":func.__name__},"timestamp":__import__("time").time()*1000})+"\n")
            except: pass
            # #endregion
            return decorated
        except Exception as e:
            # #region agent log
            try:
                with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"post-fix","hypothesisId":"A","location":"rate_limit.py:70","message":"Error applying decorator","data":{"func_name":func.__name__,"error":str(e),"error_type":type(e).__name__},"timestamp":__import__("time").time()*1000})+"\n")
            except: pass
            # #endregion
            raise
    
    return wrapper


