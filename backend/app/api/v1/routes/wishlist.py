"""Wishlist routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.v1.deps import get_db, get_current_user, validate_uuid_param
from app.schemas.wishlist import WishlistItem, WishlistItemCreate
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from supabase import Client

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistItem])
@rate_limit("100/minute")
async def get_wishlist(
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's wishlist.
    
    Returns:
        List of wishlist items
    """
    response = db.table("wishlists").select(
        """
        id,
        user_id,
        product_id,
        created_at,
        products:product_id (
            id,
            name,
            price,
            compare_at_price,
            currency,
            is_active,
            deleted_at
        ),
        product_images:product_id (
            image_url,
            is_primary,
            order
        )
        """
    ).eq("user_id", current_user.id).execute()
    
    items = []
    for item in response.data or []:
        product = item.get("products", {})
        if not product or not product.get("is_active") or product.get("deleted_at"):
            continue
        
        # Get primary image
        images = item.get("product_images", [])
        primary_image = None
        if images:
            primary_images = [img for img in images if img.get("is_primary")]
            if primary_images:
                primary_image = primary_images[0].get("image_url")
            elif images:
                sorted_images = sorted(images, key=lambda x: x.get("order", 0))
                primary_image = sorted_images[0].get("image_url")
        
        items.append(WishlistItem(
            id=item["id"],
            user_id=item["user_id"],
            product_id=item["product_id"],
            created_at=item["created_at"],
            product_name=product.get("name"),
            product_price=product.get("price"),
            product_image=primary_image
        ))
    
    return items


@router.post("/items", response_model=WishlistItem, status_code=201)
@rate_limit("60/minute")
async def add_to_wishlist(
    item: WishlistItemCreate,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Add product to wishlist.
    
    Returns:
        Added wishlist item
    """
    # Check if product exists and is active
    product = db.table("products").select("*").eq("id", item.product_id).execute()
    if not product.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product_data = product.data[0]
    if not product_data.get("is_active") or product_data.get("deleted_at"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if already in wishlist
    existing = db.table("wishlists").select("*").eq(
        "user_id", current_user.id
    ).eq("product_id", item.product_id).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in wishlist"
        )
    
    # Add to wishlist
    response = db.table("wishlists").insert({
        "user_id": current_user.id,
        "product_id": item.product_id
    }).execute()
    
    # Get product image
    images = db.table("product_images").select("image_url").eq(
        "product_id", item.product_id
    ).eq("is_primary", True).limit(1).execute()
    
    product_image = None
    if images.data:
        product_image = images.data[0]["image_url"]
    
    return WishlistItem(
        id=response.data[0]["id"],
        user_id=response.data[0]["user_id"],
        product_id=response.data[0]["product_id"],
        created_at=response.data[0]["created_at"],
        product_name=product_data.get("name"),
        product_price=product_data.get("price"),
        product_image=product_image
    )


@router.delete("/items/{item_id}", status_code=204)
@rate_limit("60/minute")
async def remove_from_wishlist(
    item_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Remove item from wishlist.
    """
    # Verify item belongs to user
    existing = db.table("wishlists").select("*").eq(
        "id", item_id
    ).eq("user_id", current_user.id).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    db.table("wishlists").delete().eq("id", item_id).execute()

