"""Admin settings routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.admin import SystemSetting, SystemSettingUpdate
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from supabase import Client

router = APIRouter(prefix="/admin/settings", tags=["Admin - Settings"])


@router.get("", response_model=List[SystemSetting])
async def get_all_settings(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get all system settings (admin only).
    
    Returns:
        List of system settings
    """
    try:
        response = db.table("system_settings").select("*").order("key", desc=False).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}"
        )


@router.get("/{key}", response_model=SystemSetting)
async def get_setting(
    key: str,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get a specific system setting (admin only).
    
    Returns:
        System setting
    """
    try:
        response = db.table("system_settings").select("*").eq("key", key).execute()
        
        if not response.data:
            raise NotFoundError("Setting", key)
        
        return response.data[0]
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch setting: {str(e)}"
        )


@router.put("/{key}", response_model=SystemSetting)
async def update_setting(
    key: str,
    setting_update: SystemSettingUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update a system setting (admin only).
    Creates the setting if it doesn't exist.
    
    Returns:
        Updated system setting
    """
    try:
        from datetime import datetime
        
        # Check if setting exists
        existing = db.table("system_settings").select("*").eq("key", key).execute()
        
        if existing.data:
            # Update existing setting
            old_values = existing.data[0]
            
            update_data = {
                "value": setting_update.value,
                "updated_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if setting_update.description is not None:
                update_data["description"] = setting_update.description
            
            response = db.table("system_settings").update(update_data).eq("key", key).execute()
            
            # Log audit
            AuditService.log_action(
                user_id=current_user.id,
                action="setting.updated",
                resource_type="setting",
                resource_id=key,
                old_values={"value": old_values.get("value")},
                new_values={"value": setting_update.value}
            )
            
            return response.data[0]
        else:
            # Create new setting
            new_setting = {
                "key": key,
                "value": setting_update.value,
                "description": setting_update.description,
                "updated_by": current_user.id
            }
            
            response = db.table("system_settings").insert(new_setting).execute()
            
            # Log audit
            AuditService.log_action(
                user_id=current_user.id,
                action="setting.created",
                resource_type="setting",
                resource_id=key,
                new_values=new_setting
            )
            
            return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update setting: {str(e)}"
        )
