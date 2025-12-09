"""Coupon schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CouponBase(BaseModel):
    """Base coupon schema."""
    code: str
    description: Optional[str] = None
    discount_type: str  # "percentage" or "fixed"
    discount_value: Decimal = Field(gt=0)
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True


class CouponCreate(CouponBase):
    """Coupon creation schema."""
    pass


class CouponUpdate(BaseModel):
    """Coupon update schema."""
    description: Optional[str] = None
    discount_type: Optional[str] = None  # "percentage" or "fixed"
    discount_value: Optional[Decimal] = Field(None, gt=0)
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class Coupon(CouponBase):
    """Coupon response schema."""
    id: str
    usage_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class CouponValidationRequest(BaseModel):
    """Coupon validation request schema."""
    code: str
    order_amount: Decimal


class CouponValidationResponse(BaseModel):
    """Coupon validation response schema."""
    valid: bool
    coupon: Optional[Coupon] = None
    discount_amount: Optional[Decimal] = None
    message: Optional[str] = None

