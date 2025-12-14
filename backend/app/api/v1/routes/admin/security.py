"""Admin security monitoring routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List, Dict
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.admin import SecurityEvent, SecurityStats
from app.schemas.user import UserProfile
from supabase import Client

router = APIRouter(prefix="/admin/security", tags=["Admin - Security"])


@router.get("/events", response_model=List[SecurityEvent])
async def get_security_events(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    severity: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get security events (admin only).
    
    Args:
        page: Page number
        per_page: Items per page
        severity: Filter by severity (low, medium, high, critical)
        event_type: Filter by event type
        user_id: Filter by user ID
        
    Returns:
        List of security events
    """
    try:
        offset = (page - 1) * per_page
        
        query = db.table("security_logs").select("*")
        
        if severity:
            query = query.eq("severity", severity)
        
        if event_type:
            query = query.eq("event_type", event_type)
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)
        response = query.execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch security events: {str(e)}"
        )


@router.get("/stats", response_model=SecurityStats)
async def get_security_stats(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get security statistics (admin only).
    
    Returns:
        Security statistics
    """
    try:
        # Get all security logs
        all_logs = db.table("security_logs").select("*").order("created_at", desc=True).limit(1000).execute()
        
        total_events = len(all_logs.data or [])
        
        # Count by severity
        by_severity = {}
        for log in (all_logs.data or []):
            severity = log.get("severity", "unknown")
            by_severity[severity] = by_severity.get(severity, 0) + 1
        
        # Count by type
        by_type = {}
        for log in (all_logs.data or []):
            event_type = log.get("event_type", "unknown")
            by_type[event_type] = by_type.get(event_type, 0) + 1
        
        # Get recent events (last 20)
        recent_events = (all_logs.data or [])[:20]
        
        return {
            "total_events": total_events,
            "by_severity": by_severity,
            "by_type": by_type,
            "recent_events": recent_events
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch security stats: {str(e)}"
        )
