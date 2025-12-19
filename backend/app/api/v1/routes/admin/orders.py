"""Admin order management routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status as http_status, Path
from typing import Optional, List
from datetime import datetime
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.core.security import validate_uuid
from app.schemas.admin import (
    AdminOrderList,
    AdminOrderDetail,
    AdminOrderStatusUpdate,
    AdminOrderPaymentStatusUpdate,
    AdminOrderNotesUpdate,
    AdminOrderDiscountUpdate,
    BulkOrderStatusUpdate
)
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.order_service import OrderService
from app.services.audit_service import AuditService
from supabase import Client

router = APIRouter(prefix="/admin/orders", tags=["Admin - Orders"])


@router.get("", response_model=List[AdminOrderList])
async def list_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    List all orders (admin only).
    
    Args:
        page: Page number
        per_page: Items per page
        status: Filter by order status
        payment_status: Filter by payment status
        start_date: Filter by start date (ISO format)
        end_date: Filter by end date (ISO format)
        user_id: Filter by user ID
        search: Search by order number
        
    Returns:
        List of orders
    """
    try:
        offset = (page - 1) * per_page
        
        query = db.table("orders").select(
            """
            id,
            order_number,
            user_id,
            guest_email,
            total,
            status,
            payment_status,
            payment_method,
            created_at
            """
        )
        
        if status:
            query = query.eq("status", status)
        
        if payment_status:
            query = query.eq("payment_status", payment_status)
        
        if start_date:
            query = query.gte("created_at", start_date)
        
        if end_date:
            query = query.lte("created_at", end_date)
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        if search:
            query = query.ilike("order_number", f"%{search}%")
        
        query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)
        response = query.execute()
        
        # Get item counts for each order
        orders = []
        # Get all user_ids from orders
        user_ids = [order.get("user_id") for order in (response.data or []) if order.get("user_id")]
        # Fetch user profiles in batch
        user_profiles_map = {}
        if user_ids:
            profiles_response = db.table("user_profiles").select("id,name").in_("id", user_ids).execute()
            user_profiles_map = {profile["id"]: profile for profile in (profiles_response.data or [])}
        
        for order in (response.data or []):
            customer_name = None
            if order.get("user_id") and order["user_id"] in user_profiles_map:
                customer_name = user_profiles_map[order["user_id"]].get("name")
            
            # Get item count
            items_response = db.table("order_items").select("id", count="exact").eq(
                "order_id", order["id"]
            ).execute()
            item_count = items_response.count or 0
            
            orders.append({
                "id": order["id"],
                "order_number": order["order_number"],
                "user_id": order.get("user_id"),
                "guest_email": order.get("guest_email"),
                "customer_name": customer_name,
                "total": order["total"],
                "status": order["status"],
                "payment_status": order["payment_status"],
                "payment_method": order.get("payment_method"),
                "created_at": order["created_at"],
                "item_count": item_count
            })
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=AdminOrderDetail)
async def get_order(
    order_id: str = Path(..., description="Order ID"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get order details (admin only).
    
    Returns:
        Order details with items and status history
    """
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    try:
        order_service = OrderService(db)
        order = order_service.get_order(order_id)
        
        # Get customer name
        customer_name = None
        customer_email = None
        if order.get("user_id"):
            user_profile = db.table("user_profiles").select("name").eq("id", order["user_id"]).execute()
            if user_profile.data:
                customer_name = user_profile.data[0].get("name")
            
            # Try to get email
            try:
                auth_response = db.table("auth.users").select("email").eq("id", order["user_id"]).execute()
                if auth_response.data:
                    customer_email = auth_response.data[0].get("email")
            except:
                pass
        
        # Get order items
        items_response = db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at
            """
        ).eq("order_id", order_id).execute()
        
        # Fetch products in a single query
        product_ids = [item["product_id"] for item in (items_response.data or []) if item.get("product_id")]
        products_map = {}
        if product_ids:
            products_response = db.table("products").select("id,name,sku").in_("id", product_ids).execute()
            products_map = {product["id"]: product for product in (products_response.data or [])}
        
        items = []
        for item in (items_response.data or []):
            product = products_map.get(item.get("product_id"), {})
            
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append({
                "id": item["id"],
                "order_id": item["order_id"],
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": float(item["price"]),
                "product_name": product.get("name") if product else None,
                "product_sku": product.get("sku") if product else None,
                "product_image": product_image
            })
        
        # Get status history
        status_history_response = db.table("order_status_history").select(
            """
            id,
            order_id,
            status,
            changed_by,
            notes,
            created_at
            """
        ).eq("order_id", order_id).order("created_at", desc=True).execute()
        
        # Get user profiles for changed_by users
        changed_by_ids = [h.get("changed_by") for h in (status_history_response.data or []) if h.get("changed_by")]
        changed_by_profiles_map = {}
        if changed_by_ids:
            profiles_response = db.table("user_profiles").select("id,name").in_("id", changed_by_ids).execute()
            changed_by_profiles_map = {profile["id"]: profile for profile in (profiles_response.data or [])}
        
        status_history = []
        for history in (status_history_response.data or []):
            changed_by_name = None
            if history.get("changed_by") and history["changed_by"] in changed_by_profiles_map:
                changed_by_name = changed_by_profiles_map[history["changed_by"]].get("name")
            
            status_history.append({
                "id": history["id"],
                "status": history["status"],
                "changed_by": history.get("changed_by"),
                "changed_by_name": changed_by_name,
                "notes": history.get("notes"),
                "created_at": history["created_at"]
            })
        
        return {
            "id": order["id"],
            "order_number": order["order_number"],
            "user_id": order.get("user_id"),
            "guest_email": order.get("guest_email"),
            "guest_phone": order.get("guest_phone"),
            "customer_name": customer_name,
            "customer_email": customer_email,
            "subtotal": order["subtotal"],
            "shipping_cost": order["shipping_cost"],
            "discount_amount": order["discount_amount"],
            "total": order["total"],
            "currency": order["currency"],
            "status": order["status"],
            "payment_method": order.get("payment_method"),
            "payment_status": order["payment_status"],
            "payment_intent_id": order.get("payment_intent_id"),
            "shipping_method_id": order.get("shipping_method_id"),
            "shipping_address": order["shipping_address"],
            "billing_address": order.get("billing_address"),
            "notes": order.get("notes"),
            "admin_notes": order.get("admin_notes"),
            "created_at": order["created_at"],
            "updated_at": order["updated_at"],
            "items": items,
            "status_history": status_history
        }
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order: {str(e)}"
        )


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str = Path(..., description="Order ID"),
    status_update: AdminOrderStatusUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    """
    Update order status (admin only).
    
    Returns:
        Updated order
    """
    try:
        order_service = OrderService(db)
        
        # Get existing order
        existing = db.table("orders").select("*").eq("id", order_id).execute()
        if not existing.data:
            raise NotFoundError("Order", order_id)
        
        old_status = existing.data[0]["status"]
        
        # Update status
        updated_order = order_service.update_order_status(
            order_id=order_id,
            status=status_update.status,
            admin_id=current_user.id,
            notes=status_update.notes
        )
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="order.status.updated",
            resource_type="order",
            resource_id=order_id,
            old_values={"status": old_status},
            new_values={"status": status_update.status, "notes": status_update.notes}
        )
        
        return updated_order
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )


@router.put("/{order_id}/payment-status")
async def update_payment_status(
    order_id: str = Path(..., description="Order ID"),
    payment_update: AdminOrderPaymentStatusUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    """
    Update order payment status (admin only).
    
    Returns:
        Updated order
    """
    try:
        # Get existing order
        existing = db.table("orders").select("*").eq("id", order_id).execute()
        if not existing.data:
            raise NotFoundError("Order", order_id)
        
        old_payment_status = existing.data[0]["payment_status"]
        
        # Update payment status
        response = db.table("orders").update({
            "payment_status": payment_update.payment_status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", order_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="order.payment_status.updated",
            resource_type="order",
            resource_id=order_id,
            old_values={"payment_status": old_payment_status},
            new_values={"payment_status": payment_update.payment_status}
        )
        
        return response.data[0] if response.data else existing.data[0]
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update payment status: {str(e)}"
        )


@router.put("/{order_id}/notes")
async def update_order_notes(
    order_id: str = Path(..., description="Order ID"),
    notes_update: AdminOrderNotesUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    """
    Update order admin notes (admin only).
    
    Returns:
        Updated order
    """
    try:
        # Get existing order
        existing = db.table("orders").select("*").eq("id", order_id).execute()
        if not existing.data:
            raise NotFoundError("Order", order_id)
        
        old_notes = existing.data[0].get("admin_notes")
        
        # Update notes
        response = db.table("orders").update({
            "admin_notes": notes_update.admin_notes,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", order_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="order.notes.updated",
            resource_type="order",
            resource_id=order_id,
            old_values={"admin_notes": old_notes},
            new_values={"admin_notes": notes_update.admin_notes}
        )
        
        return response.data[0] if response.data else existing.data[0]
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order notes: {str(e)}"
        )


@router.put("/{order_id}/discount")
async def update_order_discount(
    order_id: str = Path(..., description="Order ID"),
    discount_update: AdminOrderDiscountUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    """
    Update order discount (admin only).
    
    Returns:
        Updated order
    """
    try:
        from decimal import Decimal
        
        # Get existing order
        existing = db.table("orders").select("*").eq("id", order_id).execute()
        if not existing.data:
            raise NotFoundError("Order", order_id)
        
        order = existing.data[0]
        old_discount = Decimal(str(order.get("discount_amount", 0)))
        new_discount = Decimal(str(discount_update.discount_amount))
        
        # Ensure discount is not negative
        if new_discount < 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Discount amount cannot be negative"
            )
        
        # Ensure discount doesn't exceed subtotal
        subtotal = Decimal(str(order["subtotal"]))
        if new_discount > subtotal:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Discount amount cannot exceed subtotal"
            )
        
        # Recalculate total
        shipping_cost = Decimal(str(order.get("shipping_cost", 0)))
        new_total = subtotal + shipping_cost - new_discount
        
        # Update discount and total
        response = db.table("orders").update({
            "discount_amount": float(new_discount),
            "total": float(new_total),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", order_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="order.discount.updated",
            resource_type="order",
            resource_id=order_id,
            old_values={"discount_amount": float(old_discount), "total": float(order["total"])},
            new_values={"discount_amount": float(new_discount), "total": float(new_total)}
        )
        
        return response.data[0] if response.data else existing.data[0]
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order discount: {str(e)}"
        )


@router.post("/bulk-status-update")
async def bulk_update_order_status(
    bulk_update: BulkOrderStatusUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Bulk update order status (admin only).
    
    Returns:
        Number of updated orders
    """
    try:
        updated_count = 0
        order_service = OrderService(db)
        
        for order_id in bulk_update.order_ids:
            try:
                # Validate order exists
                existing = db.table("orders").select("status").eq("id", order_id).execute()
                if not existing.data:
                    continue
                
                old_status = existing.data[0]["status"]
                
                # Update status
                order_service.update_order_status(
                    order_id=order_id,
                    status=bulk_update.status,
                    admin_id=current_user.id,
                    notes=bulk_update.notes
                )
                
                # Log audit
                AuditService.log_action(
                    user_id=current_user.id,
                    action="order.status.bulk_updated",
                    resource_type="order",
                    resource_id=order_id,
                    old_values={"status": old_status},
                    new_values={"status": bulk_update.status}
                )
                
                updated_count += 1
            except Exception:
                continue  # Skip failed updates
        
        return {"updated_count": updated_count, "total": len(bulk_update.order_ids)}
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update orders: {str(e)}"
        )
