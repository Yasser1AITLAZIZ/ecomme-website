"""Security headers, CORS, request validation."""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.security import log_security_event


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""
    
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }
    
    async def dispatch(self, request: Request, call_next):
        """Add security headers to response."""
        response = await call_next(request)
        
        if settings.ENABLE_SECURITY_HEADERS:
            for header, value in self.SECURITY_HEADERS.items():
                response.headers[header] = value
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Middleware to validate and log suspicious requests."""
    
    BLOCKED_USER_AGENTS = ["sqlmap", "nikto", "nmap", "scanner", "bot"]
    MAX_REQUEST_SIZE = settings.MAX_REQUEST_SIZE_MB * 1024 * 1024  # Convert to bytes
    
    async def dispatch(self, request: Request, call_next):
        """Validate request and block suspicious ones."""
        # Check User-Agent
        user_agent = request.headers.get("user-agent", "").lower()
        for blocked in self.BLOCKED_USER_AGENTS:
            if blocked in user_agent:
                log_security_event(
                    event_type="blocked_user_agent",
                    request=request,
                    severity="high"
                )
                return Response(
                    status_code=403,
                    content="Forbidden"
                )
        
        # Check request size
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                if size > self.MAX_REQUEST_SIZE:
                    log_security_event(
                        event_type="request_too_large",
                        request=request,
                        severity="warning"
                    )
                    return Response(
                        status_code=413,
                        content="Request too large"
                    )
            except ValueError:
                pass
        
        # Check blocked IPs
        client_ip = request.client.host if request.client else None
        if client_ip and client_ip in settings.blocked_ips_list:
            log_security_event(
                event_type="blocked_ip",
                request=request,
                severity="critical"
            )
            return Response(
                status_code=403,
                content="Forbidden"
            )
        
        return await call_next(request)


def setup_cors(app):
    """Setup CORS middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

