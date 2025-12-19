"""Cart schemas."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class CartItemBase(BaseModel):
    """Base cart item schema."""
    product_id: str
    quantity: int


class CartItemCreate(CartItemBase):
    """Cart item creation schema."""
    pass


class CartItemUpdate(BaseModel):
    """Cart item update schema."""
    quantity: int


class CartItem(CartItemBase):
    """Cart item response schema."""
    id: str
    user_id: Optional[str] = None
    guest_session_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Product details (joined)
    product_name: Optional[str] = None
    product_price: Optional[Decimal] = None
    product_image: Optional[str] = None
    
    class Config:
        from_attributes = True


class CartSyncRequest(BaseModel):
    """Cart sync request schema."""
    items: List[CartItemCreate]


class CartMergeRequest(BaseModel):
    """Cart merge request schema."""
    guest_session_id: str


class CartResponse(BaseModel):
    """Cart response schema."""
    items: List[CartItem]
    total_items: int
    total_price: Decimal

