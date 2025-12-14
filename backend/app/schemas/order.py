"""Order schemas."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


class OrderItemBase(BaseModel):
    """Base order item schema."""
    product_id: str
    quantity: int
    price: Decimal


class OrderItem(OrderItemBase):
    """Order item response schema."""
    id: str
    order_id: str
    created_at: datetime
    # Product details (joined)
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Order creation schema."""
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    shipping_method_id: Optional[str] = None
    payment_method: str
    coupon_code: Optional[str] = None
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    """Order update schema (admin only)."""
    status: Optional[str] = None
    payment_status: Optional[str] = None
    admin_notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    """Order status update schema."""
    status: str
    notes: Optional[str] = None


class Order(BaseModel):
    """Order response schema."""
    id: str
    order_number: str
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    subtotal: Decimal
    shipping_cost: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    status: str
    payment_method: Optional[str] = None
    payment_status: str
    payment_intent_id: Optional[str] = None
    shipping_method_id: Optional[str] = None
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Items (joined)
    items: Optional[List[OrderItem]] = None
    
    class Config:
        from_attributes = True


class OrderStatusHistory(BaseModel):
    """Order status history schema."""
    id: str
    order_id: str
    status: str
    changed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

