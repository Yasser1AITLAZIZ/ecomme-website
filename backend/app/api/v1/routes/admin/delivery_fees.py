"""Admin delivery fees routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.user import UserProfile
from app.services.delivery_fee_service import DeliveryFeeService
from app.services.audit_service import AuditService
from supabase import Client

router = APIRouter(prefix="/admin/delivery-fees", tags=["Admin - Delivery Fees"])


@router.get("")
async def get_delivery_fee_settings(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get delivery fee settings (admin only).
    
    Returns:
        Delivery fee configuration
    """
    try:
        service = DeliveryFeeService(db)
        settings = service.get_delivery_fee_settings()
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch delivery fee settings: {str(e)}"
        )


@router.put("")
async def update_delivery_fee_settings(
    settings: Dict[str, Any],
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update delivery fee settings (admin only).
    
    Args:
        settings: Delivery fee configuration dict
        
    Returns:
        Updated settings
    """
    try:
        from datetime import datetime
        
        # Validate settings structure
        if "tiers" in settings:
            tiers = settings.get("tiers", [])
            # Validate tiers don't overlap and have decreasing fees
            for i, tier in enumerate(tiers):
                min_order = tier.get("min_order", 0)
                max_order = tier.get("max_order")
                tier_fee = tier.get("fee")
                
                if tier_fee is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Tier {i+1}: fee is required"
                    )
                
                if max_order is not None and min_order >= max_order:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Tier {i+1}: min_order must be less than max_order"
                    )
                
                # Validate fees are decreasing (progressive reduction)
                if i > 0:
                    prev_tier_fee = tiers[i-1].get("fee", 0)
                    if tier_fee >= prev_tier_fee:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Tier {i+1}: fee must be less than previous tier (progressive reduction)"
                        )
                
                # Check for overlaps with other tiers
                for j, other_tier in enumerate(tiers):
                    if i != j:
                        other_min = other_tier.get("min_order", 0)
                        other_max = other_tier.get("max_order")
                        
                        # Check if ranges overlap (excluding exact boundaries)
                        if max_order is None:
                            if other_max is None:
                                # Both have no upper limit - overlap
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Tiers {i+1} and {j+1} overlap (both have no upper limit)"
                                )
                            elif other_min < max_order:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Tiers {i+1} and {j+1} overlap"
                                )
                        elif other_max is None:
                            if min_order < other_max:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Tiers {i+1} and {j+1} overlap"
                                )
                        elif not (max_order <= other_min or min_order >= other_max):
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Tiers {i+1} and {j+1} overlap"
                            )
        
        # Check if setting exists
        existing = db.table("system_settings").select("*").eq("key", "delivery_fees").execute()
        
        if existing.data:
            # Update existing setting
            old_values = existing.data[0].get("value", {})
            
            update_data = {
                "value": settings,
                "updated_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = db.table("system_settings").update(update_data).eq("key", "delivery_fees").execute()
            
            # Log audit (resource_id can be string for settings)
            try:
                AuditService.log_action(
                    user_id=current_user.id,
                    action="delivery_fees.updated",
                    resource_type="setting",
                    resource_id=None,  # Use None instead of string to avoid UUID parsing
                    old_values={"value": old_values},
                    new_values={"value": settings}
                )
            except Exception:
                # Ignore audit logging errors
                pass
            
            return response.data[0].get("value", {})
        else:
            # Create new setting
            new_setting = {
                "key": "delivery_fees",
                "value": settings,
                "description": "Delivery fee configuration with tiered pricing",
                "updated_by": current_user.id
            }
            
            response = db.table("system_settings").insert(new_setting).execute()
            
            # Log audit (resource_id can be string for settings)
            try:
                AuditService.log_action(
                    user_id=current_user.id,
                    action="delivery_fees.created",
                    resource_type="setting",
                    resource_id=None,  # Use None instead of string to avoid UUID parsing
                    new_values=new_setting
                )
            except Exception:
                # Ignore audit logging errors
                pass
            
            return response.data[0].get("value", {})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update delivery fee settings: {str(e)}"
        )

