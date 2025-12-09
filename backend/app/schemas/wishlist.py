"""Wishlist schemas."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class WishlistItem(BaseModel):
    """Wishlist item schema."""
    id: str
    user_id: str
    product_id: str
    created_at: datetime
    # Product details (joined)
    product_name: Optional[str] = None
    product_price: Optional[Decimal] = None
    product_image: Optional[str] = None
    product_slug: Optional[str] = None
    
    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    """Wishlist response schema."""
    items: List[WishlistItem]
    total_items: int


class WishlistItemCreate(BaseModel):
    """Wishlist item creation schema."""
    product_id: str

