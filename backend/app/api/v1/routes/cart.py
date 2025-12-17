"""Cart routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from typing import List, Optional
from app.api.v1.deps import get_db, get_current_user, get_current_user_optional, validate_uuid_param
from app.schemas.cart import (
    CartItem,
    CartItemCreate,
    CartItemUpdate,
    CartSyncRequest,
    CartResponse,
    CartMergeRequest
)
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from app.services.cart_service import CartService
from supabase import Client
from decimal import Decimal

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_guest_session_id(
    request: Request,
    x_guest_session_id: Optional[str] = Header(None, alias="X-Guest-Session-Id")
) -> Optional[str]:
    """Extract guest session ID from header."""
    return x_guest_session_id


@router.get("", response_model=CartResponse)
@rate_limit("100/minute")
async def get_cart(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Get user's or guest's cart.
    
    Returns:
        Cart with items and totals
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    if current_user:
        items = cart_service.get_user_cart(user_id=current_user.id)
    else:
        items = cart_service.get_user_cart(guest_session_id=guest_session_id)
    
    # Calculate totals
    totals = cart_service.calculate_cart_total(items)
    
    # Convert items to CartItem schema
    cart_items = []
    for item in items:
        cart_items.append(CartItem(
            id=item["id"],
            user_id=item.get("user_id"),
            guest_session_id=item.get("guest_session_id"),
            product_id=item["product_id"],
            quantity=item["quantity"],
            created_at=item["created_at"],
            updated_at=item["updated_at"],
            product_name=item.get("product_name"),
            product_price=item.get("product_price"),
            product_image=item.get("product_image")
        ))
    
    return CartResponse(
        items=cart_items,
        total_items=totals["total_items"],
        total_price=totals["total_price"]
    )


@router.post("/items", response_model=CartItem, status_code=201)
@rate_limit("60/minute")
async def add_cart_item(
    request: Request,
    item: CartItemCreate,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Add item to cart.
    
    Returns:
        Added cart item
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    
    try:
        cart_item = cart_service.add_item(
            product_id=item.product_id,
            quantity=item.quantity,
            user_id=current_user.id if current_user else None,
            guest_session_id=guest_session_id
        )
        
        # Get full cart item with product details
        if current_user:
            items = cart_service.get_user_cart(user_id=current_user.id)
        else:
            items = cart_service.get_user_cart(guest_session_id=guest_session_id)
        
        full_item = next((i for i in items if i["id"] == cart_item["id"]), cart_item)
        
        return CartItem(
            id=full_item["id"],
            user_id=full_item.get("user_id"),
            guest_session_id=full_item.get("guest_session_id"),
            product_id=full_item["product_id"],
            quantity=full_item["quantity"],
            created_at=full_item["created_at"],
            updated_at=full_item["updated_at"],
            product_name=full_item.get("product_name"),
            product_price=full_item.get("product_price"),
            product_image=full_item.get("product_image")
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/items/{item_id}", response_model=CartItem)
@rate_limit("60/minute")
async def update_cart_item(
    request: Request,
    item_id: str = Depends(validate_uuid_param),
    item_update: CartItemUpdate = None,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Update cart item quantity.
    
    Returns:
        Updated cart item
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    
    try:
        updated = cart_service.update_item_quantity(
            item_id=item_id,
            quantity=item_update.quantity,
            user_id=current_user.id if current_user else None,
            guest_session_id=guest_session_id
        )
        
        if not updated:
            # Item was removed (quantity was 0)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item removed"
            )
        
        # Get full cart item with product details
        if current_user:
            items = cart_service.get_user_cart(user_id=current_user.id)
        else:
            items = cart_service.get_user_cart(guest_session_id=guest_session_id)
        
        full_item = next((i for i in items if i["id"] == item_id), updated)
        
        return CartItem(
            id=full_item["id"],
            user_id=full_item.get("user_id"),
            guest_session_id=full_item.get("guest_session_id"),
            product_id=full_item["product_id"],
            quantity=full_item["quantity"],
            created_at=full_item["created_at"],
            updated_at=full_item["updated_at"],
            product_name=full_item.get("product_name"),
            product_price=full_item.get("product_price"),
            product_image=full_item.get("product_image")
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/items/{item_id}", status_code=204)
@rate_limit("60/minute")
async def remove_cart_item(
    request: Request,
    item_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Remove item from cart.
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    
    try:
        cart_service.remove_item(
            item_id=item_id,
            user_id=current_user.id if current_user else None,
            guest_session_id=guest_session_id
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/sync", response_model=CartResponse)
@rate_limit("20/hour")
async def sync_cart(
    request: Request,
    sync_request: CartSyncRequest,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Sync cart from frontend (replace existing cart).
    
    Returns:
        Synced cart with items and totals
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    
    # Convert to list of dicts
    items_data = [{"product_id": item.product_id, "quantity": item.quantity} for item in sync_request.items]
    
    try:
        synced_items = cart_service.sync_cart(
            items=items_data,
            user_id=current_user.id if current_user else None,
            guest_session_id=guest_session_id
        )
    except ValueError as e:
        error_msg = str(e)
        if "Database migration required" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Calculate totals
    totals = cart_service.calculate_cart_total(synced_items)
    
    # Convert to CartItem schema
    cart_items = []
    for item in synced_items:
        cart_items.append(CartItem(
            id=item["id"],
            user_id=item.get("user_id"),
            guest_session_id=item.get("guest_session_id"),
            product_id=item["product_id"],
            quantity=item["quantity"],
            created_at=item["created_at"],
            updated_at=item["updated_at"],
            product_name=item.get("product_name"),
            product_price=item.get("product_price"),
            product_image=item.get("product_image")
        ))
    
    return CartResponse(
        items=cart_items,
        total_items=totals["total_items"],
        total_price=totals["total_price"]
    )


@router.delete("", status_code=204)
@rate_limit("20/hour")
async def clear_cart(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    guest_session_id: Optional[str] = Depends(get_guest_session_id)
):
    """
    Clear all items from cart.
    """
    if not current_user and not guest_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either authentication or X-Guest-Session-Id header is required"
        )
    
    cart_service = CartService(db)
    cart_service.clear_cart(
        user_id=current_user.id if current_user else None,
        guest_session_id=guest_session_id
    )


@router.post("/merge", response_model=CartResponse)
@rate_limit("10/hour")
async def merge_cart(
    request: Request,
    merge_request: CartMergeRequest,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Merge guest cart into user cart (authenticated only).
    
    Returns:
        Merged cart with items and totals
    """
    cart_service = CartService(db)
    
    try:
        merged_items = cart_service.merge_guest_cart_to_user(
            guest_session_id=merge_request.guest_session_id,
            user_id=current_user.id
        )
        
        # Calculate totals
        totals = cart_service.calculate_cart_total(merged_items)
        
        # Convert to CartItem schema
        cart_items = []
        for item in merged_items:
            cart_items.append(CartItem(
                id=item["id"],
                user_id=item.get("user_id"),
                guest_session_id=item.get("guest_session_id"),
                product_id=item["product_id"],
                quantity=item["quantity"],
                created_at=item["created_at"],
                updated_at=item["updated_at"],
                product_name=item.get("product_name"),
                product_price=item.get("product_price"),
                product_image=item.get("product_image")
            ))
        
        return CartResponse(
            items=cart_items,
            total_items=totals["total_items"],
            total_price=totals["total_price"]
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

