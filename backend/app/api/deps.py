"""Dependencies (auth, supabase client, role checks)."""
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status, Header
from supabase import Client
from app.database import get_supabase_client
from app.config import settings
from app.schemas.user import UserProfile
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.core.security import validate_uuid


async def get_db() -> Client:
    """
    Dependency to get Supabase client.
    
    Returns:
        Supabase client instance
    """
    return get_supabase_client()


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Client = Depends(get_db)
) -> UserProfile:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        authorization: Authorization header with Bearer token
        db: Supabase client
        
    Returns:
        User profile
        
    Raises:
        UnauthorizedError: If token is missing or invalid
    """
    if not authorization:
        raise UnauthorizedError("Authorization header missing")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise UnauthorizedError("Invalid authorization scheme")
    except ValueError:
        raise UnauthorizedError("Invalid authorization header format")
    
    try:
        # Decode and verify JWT token
        try:
            decoded_token = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            user_id = decoded_token.get("sub")
            
            if not user_id:
                raise UnauthorizedError("Invalid token: missing user ID")
        except jwt.ExpiredSignatureError:
            raise UnauthorizedError("Token expired")
        except jwt.InvalidTokenError as e:
            raise UnauthorizedError(f"Invalid token: {str(e)}")
        
        # Get user profile from database using service role client
        profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data:
            # Create profile if it doesn't exist
            profile_data = {
                "id": user_id,
                "name": user_response.user.user_metadata.get("name") if user_response.user.user_metadata else None,
                "role": "customer"
            }
            db.table("user_profiles").insert(profile_data).execute()
            profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
        
        profile = profile_response.data[0]
        return UserProfile(**profile)
        
    except Exception as e:
        raise UnauthorizedError(f"Token verification failed: {str(e)}")


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Client = Depends(get_db)
) -> Optional[UserProfile]:
    """
    Dependency to get current user if authenticated, None otherwise.
    
    Args:
        authorization: Authorization header with Bearer token
        db: Supabase client
        
    Returns:
        User profile or None
    """
    try:
        return await get_current_user(authorization, db)
    except (UnauthorizedError, HTTPException):
        return None


def validate_uuid_param(uuid_value: str) -> str:
    """
    Validate UUID parameter.
    
    Args:
        uuid_value: UUID string to validate
        
    Returns:
        Validated UUID string
        
    Raises:
        HTTPException: If UUID is invalid
    """
    if not validate_uuid(uuid_value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )
    return uuid_value

