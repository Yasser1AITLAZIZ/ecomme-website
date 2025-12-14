"""Role-based access control."""
from typing import Optional
from fastapi import Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.user import UserProfile


async def require_admin(
    current_user: UserProfile = Depends(get_current_user)
) -> UserProfile:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User profile if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def check_role(user: UserProfile, required_role: str) -> bool:
    """
    Check if user has required role.
    
    Args:
        user: User profile
        required_role: Required role
        
    Returns:
        True if user has required role
    """
    return user.role == required_role

