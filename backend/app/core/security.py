"""Security utilities (sanitization, UUID validation, CSRF)."""
import re
import bleach
from typing import Optional, Any
from fastapi import Request, HTTPException
from app.core.exceptions import ValidationError
from app.database import get_supabase_client


# Dangerous patterns to block
DANGEROUS_PATTERNS = [
    r"<script.*?>",
    r"javascript:",
    r"on\w+\s*=",
    r"data:text/html",
    r"vbscript:",
    r"expression\s*\(",
]


def sanitize_input(value: Any) -> str:
    """
    Sanitize input against XSS attacks.
    
    Args:
        value: Input value to sanitize
        
    Returns:
        Sanitized string
        
    Raises:
        ValidationError: If dangerous patterns are detected
    """
    if not isinstance(value, str):
        return str(value)
    
    # Remove HTML tags and clean
    cleaned = bleach.clean(value, tags=[], strip=True)
    
    # Check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            raise ValidationError("Invalid input detected: potentially dangerous content")
    
    return cleaned


def validate_uuid(value: str) -> bool:
    """
    Validate UUID format to prevent injection.
    
    Args:
        value: UUID string to validate
        
    Returns:
        True if valid UUID format, False otherwise
    """
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(uuid_pattern, value.lower()))


def sanitize_dict(data: dict) -> dict:
    """
    Recursively sanitize all string values in a dictionary.
    
    Args:
        data: Dictionary to sanitize
        
    Returns:
        Sanitized dictionary
    """
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_input(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict(item) if isinstance(item, dict) else sanitize_input(item) if isinstance(item, str) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized


def log_security_event(
    event_type: str,
    request: Request,
    user_id: Optional[str] = None,
    severity: str = "warning",
    request_data: Optional[dict] = None
) -> None:
    """
    Log security events to security_logs table.
    
    Args:
        event_type: Type of security event
        request: FastAPI request object
        user_id: Optional user ID
        severity: Severity level (info, warning, error, critical)
        request_data: Optional request data to log
    """
    try:
        db = get_supabase_client()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Get endpoint
        endpoint = str(request.url.path)
        
        # Insert security log (synchronous)
        db.table("security_logs").insert({
            "event_type": event_type,
            "user_id": user_id,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "endpoint": endpoint,
            "request_data": request_data or {},
            "severity": severity
        }).execute()
    except Exception:
        # Fail silently to avoid breaking the main request flow
        pass

