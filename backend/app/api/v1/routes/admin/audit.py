"""Admin audit log routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.admin import AuditLog
from app.schemas.user import UserProfile
from supabase import Client

router = APIRouter(prefix="/admin/audit", tags=["Admin - Audit"])


@router.get("/logs", response_model=List[AuditLog])
async def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    resource_type: Optional[str] = Query(None),
    resource_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get audit logs (admin only).
    
    Args:
        page: Page number
        per_page: Items per page
        resource_type: Filter by resource type
        resource_id: Filter by resource ID
        user_id: Filter by user ID
        action: Filter by action
        
    Returns:
        List of audit logs
    """
    try:
        offset = (page - 1) * per_page
        
        query = db.table("audit_logs").select("*")
        
        if resource_type:
            query = query.eq("resource_type", resource_type)
        
        if resource_id:
            query = query.eq("resource_id", resource_id)
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        if action:
            query = query.ilike("action", f"%{action}%")
        
        query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)
        response = query.execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit logs: {str(e)}"
        )


@router.get("/logs/{log_id}", response_model=AuditLog)
async def get_audit_log(
    log_id: str,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get audit log details (admin only).
    
    Returns:
        Audit log details
    """
    try:
        response = db.table("audit_logs").select("*").eq("id", log_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit log not found"
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit log: {str(e)}"
        )
