"""Shipping schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class ShippingMethodBase(BaseModel):
    """Base shipping method schema."""
    name: str
    description: Optional[str] = None
    price: Decimal = Field(ge=0)
    estimated_days_min: Optional[int] = None
    estimated_days_max: Optional[int] = None
    zones: List[str] = Field(default_factory=list)
    is_active: bool = True


class ShippingMethodCreate(ShippingMethodBase):
    """Shipping method creation schema."""
    pass


class ShippingMethodUpdate(BaseModel):
    """Shipping method update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    estimated_days_min: Optional[int] = None
    estimated_days_max: Optional[int] = None
    zones: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ShippingMethod(ShippingMethodBase):
    """Shipping method response schema."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ShippingCalculationRequest(BaseModel):
    """Shipping calculation request schema."""
    shipping_method_id: Optional[str] = None
    address: dict  # Shipping address


class ShippingCalculationResponse(BaseModel):
    """Shipping calculation response schema."""
    shipping_method_id: str
    shipping_method_name: str
    cost: Decimal
    estimated_days_min: Optional[int] = None
    estimated_days_max: Optional[int] = None

