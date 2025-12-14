"""Cart routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from app.api.v1.deps import get_db, get_current_user, validate_uuid_param
from app.schemas.cart import (
    CartItem,
    CartItemCreate,
    CartItemUpdate,
    CartSyncRequest,
    CartResponse
)
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from app.services.cart_service import CartService
from supabase import Client
from decimal import Decimal

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
@rate_limit("100/minute")
async def get_cart(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's cart.
    
    Returns:
        User's cart with items and totals
    """
    cart_service = CartService(db)
    items = cart_service.get_user_cart(current_user.id)
    
    # Calculate totals
    totals = cart_service.calculate_cart_total(items)
    
    # Convert items to CartItem schema
    cart_items = []
    for item in items:
        cart_items.append(CartItem(
            id=item["id"],
            user_id=item["user_id"],
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
    current_user = Depends(get_current_user)
):
    """
    Add item to cart.
    
    Returns:
        Added cart item
    """
    cart_service = CartService(db)
    
    try:
        cart_item = cart_service.add_item(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        
        # Get full cart item with product details
        items = cart_service.get_user_cart(current_user.id)
        full_item = next((i for i in items if i["id"] == cart_item["id"]), cart_item)
        
        return CartItem(
            id=full_item["id"],
            user_id=full_item["user_id"],
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
    current_user = Depends(get_current_user)
):
    """
    Update cart item quantity.
    
    Returns:
        Updated cart item
    """
    cart_service = CartService(db)
    
    try:
        updated = cart_service.update_item_quantity(
            user_id=current_user.id,
            item_id=item_id,
            quantity=item_update.quantity
        )
        
        if not updated:
            # Item was removed (quantity was 0)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item removed"
            )
        
        # Get full cart item with product details
        items = cart_service.get_user_cart(current_user.id)
        full_item = next((i for i in items if i["id"] == item_id), updated)
        
        return CartItem(
            id=full_item["id"],
            user_id=full_item["user_id"],
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
    current_user = Depends(get_current_user)
):
    """
    Remove item from cart.
    """
    cart_service = CartService(db)
    
    try:
        cart_service.remove_item(
            user_id=current_user.id,
            item_id=item_id
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/sync", response_model=CartResponse)
@rate_limit("20/hour")
async def sync_cart(
    request: Request,
    sync_request: CartSyncRequest,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Sync cart from frontend (replace existing cart).
    
    Returns:
        Synced cart with items and totals
    """
    cart_service = CartService(db)
    
    # Convert to list of dicts
    items_data = [{"product_id": item.product_id, "quantity": item.quantity} for item in sync_request.items]
    
    synced_items = cart_service.sync_cart(
        user_id=current_user.id,
        items=items_data
    )
    
    # Calculate totals
    totals = cart_service.calculate_cart_total(synced_items)
    
    # Convert to CartItem schema
    cart_items = []
    for item in synced_items:
        cart_items.append(CartItem(
            id=item["id"],
            user_id=item["user_id"],
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
    current_user = Depends(get_current_user)
):
    """
    Clear all items from cart.
    """
    cart_service = CartService(db)
    cart_service.clear_cart(current_user.id)

