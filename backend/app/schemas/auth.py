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


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None


class RegisterResponse(BaseModel):
    """Registration response schema."""
    user: UserMeResponse
    token: Optional[str] = None
    message: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    user: UserMeResponse
    token: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema."""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Forgot password response schema."""
    message: str


class ResetPasswordRequest(BaseModel):
    """Reset password request schema."""
    token: str
    password: str


class ResetPasswordResponse(BaseModel):
    """Reset password response schema."""
    message: str


class VerifyEmailRequest(BaseModel):
    """Email verification request schema."""
    token: str
    type: Optional[str] = "signup"


class VerifyEmailResponse(BaseModel):
    """Email verification response schema."""
    user: UserMeResponse
    token: str
    message: Optional[str] = None


class UpdateProfileResponse(BaseModel):
    """Profile update response schema."""
    user: UserMeResponse
    message: Optional[str] = None