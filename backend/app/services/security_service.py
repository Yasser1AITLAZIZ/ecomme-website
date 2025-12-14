"""Security event logging service."""
from typing import Optional, Dict, Any
from fastapi import Request
from app.database import get_supabase_client
from app.core.security import log_security_event


class SecurityService:
    """Service for security event logging."""
    
    @staticmethod
    def log_event(
        event_type: str,
        request: Request,
        user_id: Optional[str] = None,
        severity: str = "warning",
        request_data: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log a security event.
        
        Args:
            event_type: Type of security event
            request: FastAPI request object
            user_id: Optional user ID
            severity: Severity level
            request_data: Optional request data
        """
        await log_security_event(
            event_type=event_type,
            request=request,
            user_id=user_id,
            severity=severity,
            request_data=request_data
        )
    
    @staticmethod
    def get_security_logs(
        limit: int = 100,
        severity: Optional[str] = None,
        event_type: Optional[str] = None
    ) -> list:
        """
        Get security logs.
        
        Args:
            limit: Maximum number of logs to return
            severity: Filter by severity
            event_type: Filter by event type
            
        Returns:
            List of security logs
        """
        db = get_supabase_client()
        query = db.table("security_logs").select("*").order("created_at", desc=True).limit(limit)
        
        if severity:
            query = query.eq("severity", severity)
        if event_type:
            query = query.eq("event_type", event_type)
        
        response = query.execute()
        return response.data

