"""Order routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from app.api.v1.deps import get_db, get_current_user, get_current_user_optional, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.order import Order, OrderCreate, OrderUpdate, OrderStatusUpdate, OrderItem
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from app.services.order_service import OrderService
from app.services.cart_service import CartService
from supabase import Client

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=List[Order])
@rate_limit("100/minute")
async def get_orders(
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's orders.
    
    Returns:
        List of user's orders
    """
    order_service = OrderService(db)
    orders = order_service.get_user_orders(current_user.id)
    
    # Convert to Order schema
    result = []
    for order in orders:
        # Get order items
        items_response = db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at,
            products:product_id (
                name
            )
            """
        ).eq("order_id", order["id"]).execute()
        
        items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        result.append(Order(
            id=order["id"],
            order_number=order["order_number"],
            user_id=order.get("user_id"),
            guest_email=order.get("guest_email"),
            guest_phone=order.get("guest_phone"),
            subtotal=order["subtotal"],
            shipping_cost=order["shipping_cost"],
            discount_amount=order["discount_amount"],
            total=order["total"],
            currency=order["currency"],
            status=order["status"],
            payment_method=order.get("payment_method"),
            payment_status=order["payment_status"],
            payment_intent_id=order.get("payment_intent_id"),
            shipping_method_id=order.get("shipping_method_id"),
            shipping_address=order["shipping_address"],
            billing_address=order.get("billing_address"),
            notes=order.get("notes"),
            admin_notes=order.get("admin_notes"),
            created_at=order["created_at"],
            updated_at=order["updated_at"],
            items=items
        ))
    
    return result


@router.get("/{order_id}", response_model=Order)
@rate_limit("100/minute")
async def get_order(
    order_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get order details.
    
    Returns:
        Order details with items
    """
    order_service = OrderService(db)
    
    try:
        order = order_service.get_order(order_id, current_user.id)
        
        # Get order items
        items_response = db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at,
            products:product_id (
                name
            )
            """
        ).eq("order_id", order_id).execute()
        
        items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=order["id"],
            order_number=order["order_number"],
            user_id=order.get("user_id"),
            guest_email=order.get("guest_email"),
            guest_phone=order.get("guest_phone"),
            subtotal=order["subtotal"],
            shipping_cost=order["shipping_cost"],
            discount_amount=order["discount_amount"],
            total=order["total"],
            currency=order["currency"],
            status=order["status"],
            payment_method=order.get("payment_method"),
            payment_status=order["payment_status"],
            payment_intent_id=order.get("payment_intent_id"),
            shipping_method_id=order.get("shipping_method_id"),
            shipping_address=order["shipping_address"],
            billing_address=order.get("billing_address"),
            notes=order.get("notes"),
            admin_notes=order.get("admin_notes"),
            created_at=order["created_at"],
            updated_at=order["updated_at"],
            items=items
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=Order, status_code=201)
@rate_limit("20/hour")
async def create_order(
    order_data: OrderCreate,
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Create a new order.
    
    Returns:
        Created order
    """
    order_service = OrderService(db)
    cart_service = CartService(db)
    
    # Get cart items
    if current_user:
        cart_items = cart_service.get_user_cart(current_user.id)
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Convert cart items to order items format
        items = []
        for item in cart_items:
            items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": float(item["product_price"])
            })
    else:
        # Guest order - items should be provided in request
        # For now, require authentication
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to create order"
        )
    
    try:
        # Get IP and user agent
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        order = order_service.create_order(
            user_id=current_user.id if current_user else None,
            cart_items=items,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            shipping_method_id=order_data.shipping_method_id,
            payment_method=order_data.payment_method,
            coupon_code=order_data.coupon_code,
            notes=order_data.notes
        )
        
        # Get order with items
        full_order = order_service.get_order(order["id"], current_user.id if current_user else None)
        
        # Get order items for response
        items_response = db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at,
            products:product_id (
                name
            )
            """
        ).eq("order_id", order["id"]).execute()
        
        order_items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            order_items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=full_order["id"],
            order_number=full_order["order_number"],
            user_id=full_order.get("user_id"),
            guest_email=full_order.get("guest_email"),
            guest_phone=full_order.get("guest_phone"),
            subtotal=full_order["subtotal"],
            shipping_cost=full_order["shipping_cost"],
            discount_amount=full_order["discount_amount"],
            total=full_order["total"],
            currency=full_order["currency"],
            status=full_order["status"],
            payment_method=full_order.get("payment_method"),
            payment_status=full_order["payment_status"],
            payment_intent_id=full_order.get("payment_intent_id"),
            shipping_method_id=full_order.get("shipping_method_id"),
            shipping_address=full_order["shipping_address"],
            billing_address=full_order.get("billing_address"),
            notes=full_order.get("notes"),
            admin_notes=full_order.get("admin_notes"),
            created_at=full_order["created_at"],
            updated_at=full_order["updated_at"],
            items=order_items
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{order_id}/status", response_model=Order)
@rate_limit("60/minute")
async def update_order_status(
    order_id: str = Depends(validate_uuid_param),
    status_update: OrderStatusUpdate = None,
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Update order status (Admin only).
    
    Returns:
        Updated order
    """
    order_service = OrderService(db)
    
    try:
        updated_order = order_service.update_order_status(
            order_id=order_id,
            status=status_update.status,
            admin_id=current_user.id,
            notes=status_update.notes
        )
        
        # Get full order with items
        full_order = order_service.get_order(order_id)
        
        # Get order items
        items_response = db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at,
            products:product_id (
                name
            )
            """
        ).eq("order_id", order_id).execute()
        
        items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=full_order["id"],
            order_number=full_order["order_number"],
            user_id=full_order.get("user_id"),
            guest_email=full_order.get("guest_email"),
            guest_phone=full_order.get("guest_phone"),
            subtotal=full_order["subtotal"],
            shipping_cost=full_order["shipping_cost"],
            discount_amount=full_order["discount_amount"],
            total=full_order["total"],
            currency=full_order["currency"],
            status=full_order["status"],
            payment_method=full_order.get("payment_method"),
            payment_status=full_order["payment_status"],
            payment_intent_id=full_order.get("payment_intent_id"),
            shipping_method_id=full_order.get("shipping_method_id"),
            shipping_address=full_order["shipping_address"],
            billing_address=full_order.get("billing_address"),
            notes=full_order.get("notes"),
            admin_notes=full_order.get("admin_notes"),
            created_at=full_order["created_at"],
            updated_at=full_order["updated_at"],
            items=items
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

