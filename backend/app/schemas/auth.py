"""Authentication schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None


class UserMeResponse(BaseModel):
    """Current user response schema."""
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    phone: Optional[str] = None

