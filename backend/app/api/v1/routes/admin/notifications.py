"""Admin notifications routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.admin import Notification
from app.schemas.user import UserProfile
from supabase import Client

router = APIRouter(prefix="/admin/notifications", tags=["Admin - Notifications"])


@router.get("", response_model=List[Notification])
async def get_notifications(
    last_seen: Optional[str] = Query(None, description="ISO timestamp of last check"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get admin notifications (new orders, user registrations, low stock alerts).
    
    Args:
        last_seen: ISO timestamp of last check. If provided, returns notifications
                   created after this timestamp. Otherwise, returns notifications
                   from the last 24 hours.
    
    Returns:
        List of notifications
    """
    try:
        notifications: List[Notification] = []
        
        # Calculate time threshold
        if last_seen:
            try:
                threshold = datetime.fromisoformat(last_seen.replace('Z', '+00:00'))
            except ValueError:
                # If parsing fails, default to 24 hours ago
                threshold = datetime.now(timezone.utc) - timedelta(hours=24)
        else:
            # Default to last 24 hours
            threshold = datetime.now(timezone.utc) - timedelta(hours=24)
        
        threshold_iso = threshold.isoformat()
        
        # 1. Get new orders (created after threshold)
        orders_query = db.table("orders").select("id, order_number, created_at").gte(
            "created_at", threshold_iso
        ).order("created_at", desc=True).limit(50).execute()
        
        for order in (orders_query.data or []):
            notifications.append(Notification(
                id=order["id"],
                type="order",
                title="New Order",
                message=f"Order #{order['order_number']} has been placed",
                created_at=datetime.fromisoformat(order["created_at"].replace('Z', '+00:00')),
                link=f"/admin/orders/{order['id']}"
            ))
        
        # 2. Get new user registrations (created after threshold)
        # Note: user_profiles doesn't have email - it's in auth.users
        users_query = db.table("user_profiles").select("id, name, created_at").gte(
            "created_at", threshold_iso
        ).order("created_at", desc=True).limit(50).execute()
        
        for user in (users_query.data or []):
            user_name = user.get("name") or "Unknown User"
            notifications.append(Notification(
                id=user["id"],
                type="user",
                title="New User Registration",
                message=f"{user_name} has registered",
                created_at=datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')),
                link=f"/admin/users/{user['id']}"
            ))
        
        # 3. Get low stock products (always check, not time-based)
        # Get all active products and filter for low stock in Python
        all_products_query = db.table("products").select(
            "id, name, stock, low_stock_threshold"
        ).eq("is_active", True).is_("deleted_at", "null").execute()
        
        for product in (all_products_query.data or []):
            stock = product.get("stock", 0) or 0
            threshold = product.get("low_stock_threshold", 5) or 5
            
            if stock <= threshold:
                notifications.append(Notification(
                    id=product["id"],
                    type="product",
                    title="Low Stock Alert",
                    message=f"{product['name']} ({stock} remaining)",
                    created_at=datetime.now(timezone.utc),  # Use current time for low stock alerts (timezone-aware)
                    link=f"/admin/products/{product['id']}"
                ))
        
        # Sort all notifications by created_at descending
        notifications.sort(key=lambda n: n.created_at, reverse=True)
        
        # Limit to most recent 100 notifications
        return notifications[:100]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

