"""User schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    """User profile schema."""
    id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """User profile update schema."""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class UserAddressBase(BaseModel):
    """Base address schema."""
    label: str
    street: str
    city: str
    state: Optional[str] = None  # Optional for backward compatibility
    zip_code: str
    country: str
    is_default: bool = False


class UserAddressCreate(UserAddressBase):
    """Address creation schema."""
    pass


class UserAddressUpdate(BaseModel):
    """Address update schema."""
    label: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None


class UserAddress(UserAddressBase):
    """Address response schema."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

