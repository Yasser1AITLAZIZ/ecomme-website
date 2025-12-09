"""Authentication routes."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import get_current_user
from app.schemas.auth import UserMeResponse
from app.schemas.user import UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_info(
    current_user: UserProfile = Depends(get_current_user)
) -> UserMeResponse:
    """
    Get current authenticated user information.
    
    Returns:
        Current user information
    """
    return UserMeResponse(
        id=current_user.id,
        email=None,  # Email is in auth.users, not in user_profiles
        name=current_user.name,
        role=current_user.role,
        phone=current_user.phone
    )

