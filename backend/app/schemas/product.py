"""Product schemas."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime


class ProductBase(BaseModel):
    """Base product schema."""
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal = Field(gt=0)
    compare_at_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    currency: str = "MAD"
    category_id: Optional[str] = None
    brand: Optional[str] = None
    stock: int = Field(ge=0, default=0)
    low_stock_threshold: int = Field(ge=0, default=5)
    specifications: Dict[str, Any] = Field(default_factory=dict)
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    weight: Optional[Decimal] = None
    is_featured: bool = False
    is_active: bool = True
    promo_price: Optional[Decimal] = None
    promo_start_date: Optional[datetime] = None
    promo_end_date: Optional[datetime] = None
    is_promo_active: bool = False


class ProductCreate(ProductBase):
    """Product creation schema."""
    sku: str
    slug: str


class ProductUpdate(BaseModel):
    """Product update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    compare_at_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    currency: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    specifications: Optional[Dict[str, Any]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    weight: Optional[Decimal] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    promo_price: Optional[Decimal] = None
    promo_start_date: Optional[datetime] = None
    promo_end_date: Optional[datetime] = None
    is_promo_active: Optional[bool] = None


class Product(ProductBase):
    """Product response schema."""
    id: str
    sku: str
    slug: str
    reserved_stock: int = 0
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductImage(BaseModel):
    """Product image schema."""
    id: str
    product_id: str
    image_url: str
    is_primary: bool
    order: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductImageCreate(BaseModel):
    """Product image creation schema."""
    image_url: str
    is_primary: bool = False
    order: int = 0

