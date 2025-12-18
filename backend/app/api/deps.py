"""Dependencies (auth, supabase client, role checks)."""
from typing import Optional, Annotated
import jwt
from fastapi import Depends, HTTPException, status, Header, Request, Path
from supabase import Client
from app.database import get_supabase_client
from app.config import settings
from app.schemas.user import UserProfile
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.core.security import validate_uuid
from app.core.jwt_keys import get_jwt_key_manager


async def get_db() -> Client:
    """
    Dependency to get Supabase client.
    
    Returns:
        Supabase client instance
    """
    return get_supabase_client()


async def get_current_user(
    request: Request,
    db: Client = Depends(get_db)
) -> UserProfile:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        request: FastAPI Request object to extract headers
        db: Supabase client
        
    Returns:
        User profile
        
    Raises:
        UnauthorizedError: If token is missing or invalid
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Extract Authorization header from request
    authorization = request.headers.get("Authorization") or request.headers.get("authorization")
    
    if not authorization:
        # Only log as debug since this is expected for public endpoints
        # Warning will be logged by the caller if authentication was required
        logger.debug("Authorization header missing in request")
        raise UnauthorizedError("Authorization header missing")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split(maxsplit=1)
        if scheme.lower() != "bearer":
            logger.warning(f"Invalid authorization scheme: {scheme}")
            raise UnauthorizedError("Invalid authorization scheme")
    except ValueError as e:
        logger.warning(f"Invalid authorization header format: {authorization[:20]}...")
        raise UnauthorizedError("Invalid authorization header format")
    
    try:
        # Get JWT key manager instance
        key_manager = get_jwt_key_manager()
        
        # First, check token header for algorithm
        try:
            unverified_header = jwt.get_unverified_header(token)
            alg = unverified_header.get("alg", "unknown")
            logger.debug(f"Token header: alg={alg}, kid={unverified_header.get('kid')}")
        except Exception as e:
            logger.error(f"Failed to decode token header: {str(e)}")
            raise UnauthorizedError("Invalid token format")
        
        # Check token algorithm from header (not payload)
        # Support both ES256 (new) and HS256 (legacy) during transition
        if alg not in ["ES256", "HS256"]:
            logger.warning(f"Unsupported token algorithm: {alg}. Only ES256 and HS256 are supported.")
            raise UnauthorizedError(f"Unsupported token algorithm: {alg}. Only ES256 (ECC P-256) and HS256 (Legacy) tokens are supported.")
        
        # Decode without verification to check token structure (for logging)
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            logger.debug(f"Token claims (unverified): aud={unverified.get('aud')}, sub={unverified.get('sub')}")
        except Exception as e:
            logger.error(f"Failed to decode token (even without verification): {str(e)}")
            raise UnauthorizedError("Invalid token format")
        
        # Verify token using JWK key manager (ES256)
        decoded_token = None
        user_id = None
        
        # Try with audience verification first
        try:
            decoded_token = await key_manager.verify_token(
                token,
                audience="authenticated",
                options={"verify_aud": True}
            )
            user_id = decoded_token.get("sub")
            logger.debug(f"Token verified successfully with user_id: {user_id}")
        except jwt.InvalidAudienceError:
            # Try without audience verification
            logger.debug("Token audience mismatch, trying without audience check")
            try:
                decoded_token = await key_manager.verify_token(
                    token,
                    audience=None,
                    options={"verify_aud": False}
                )
                user_id = decoded_token.get("sub")
                logger.debug(f"Token verified successfully (no audience check) with user_id: {user_id}")
            except jwt.ExpiredSignatureError:
                logger.warning("Token expired")
                raise UnauthorizedError("Token expired")
            except jwt.InvalidTokenError as e:
                logger.warning(f"Invalid token: {str(e)}")
                raise UnauthorizedError(f"Invalid token: {str(e)}")
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            raise UnauthorizedError("Token expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise UnauthorizedError(f"Invalid token: {str(e)}")
        
        if not user_id:
            logger.warning("Token missing user ID")
            raise UnauthorizedError("Invalid token: missing user ID")
        
        # Get user profile from database using service role client
        profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data:
            # Create profile if it doesn't exist
            # Get user metadata from JWT token claims
            user_metadata = decoded_token.get("user_metadata", {})
            profile_data = {
                "id": user_id,
                "name": user_metadata.get("name") if user_metadata else None,
                "role": "customer"
            }
            db.table("user_profiles").insert(profile_data).execute()
            profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
        
        profile = profile_response.data[0]
        return UserProfile(**profile)
        
    except UnauthorizedError:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}", exc_info=True)
        raise UnauthorizedError(f"Token verification failed: {str(e)}")


async def get_current_user_optional(
    request: Request,
    db: Client = Depends(get_db)
) -> Optional[UserProfile]:
    """
    Dependency to get current user if authenticated, None otherwise.
    
    Args:
        request: FastAPI Request object to extract headers
        db: Supabase client
        
    Returns:
        User profile or None
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Check if authorization header exists before attempting authentication
    authorization = request.headers.get("Authorization") or request.headers.get("authorization")
    
    if not authorization:
        # No authorization header - user is not authenticated (this is OK for optional auth)
        return None
    
    # Try to get user, but don't log warnings if it fails (it's optional)
    try:
        return await get_current_user(request, db)
    except (UnauthorizedError, HTTPException):
        # Silently return None for optional auth - don't log warnings
        return None


def validate_uuid_param(param_name: str = "id"):
    """
    Create a dependency function that validates a UUID path parameter.
    
    This creates a FastAPI dependency that extracts and validates a UUID from the path.
    Usage: order_id: str = Depends(validate_uuid_param("order_id"))
    
    Args:
        param_name: Name of the path parameter to validate
        
    Returns:
        Dependency function that validates and returns the UUID
    """
    def _validate(uuid_value: Annotated[str, Path(..., description=f"{param_name} (UUID)")]) -> str:
        if not validate_uuid(uuid_value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid UUID format"
            )
        return uuid_value
    return _validate

