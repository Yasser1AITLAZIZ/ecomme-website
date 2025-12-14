"""Admin user management routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status, Request, Path
from typing import Optional, List
import httpx
from app.api.v1.deps import get_db
from app.api.deps import validate_uuid
from app.core.permissions import require_admin
from app.schemas.admin import (
    AdminUserList,
    AdminUserListResponse,
    AdminUserDetail,
    AdminUserUpdate,
    AdminUserRoleUpdate,
    AdminUserCreate
)
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from app.config import settings
from supabase import Client

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("", response_model=AdminUserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    List all users (admin only).
    
    Args:
        page: Page number
        per_page: Items per page
        search: Search term (name or email)
        role: Filter by role
        
    Returns:
        List of users with total count
    """
    try:
        offset = (page - 1) * per_page
        
        # Get all user profiles first (no pagination yet - we need to filter by search)
        query = db.table("user_profiles").select(
            """
            id,
            name,
            phone,
            role,
            created_at
            """
        )
        
        if role:
            query = query.eq("role", role)
        
        # Get ALL profiles first (before search filtering)
        all_profiles_response = query.order("created_at", desc=True).execute()
        all_profiles = all_profiles_response.data or []
        
        # Get all user IDs as a set for faster lookup
        user_ids_set = set(profile["id"] for profile in all_profiles)
        
        # Fetch emails from auth.users using Admin API
        emails_map = {}
        if user_ids_set:
            try:
                admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
                headers = {
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                }
                
                # Fetch all users from Admin API
                async with httpx.AsyncClient() as client:
                    admin_response = await client.get(
                        admin_api_url,
                        headers=headers,
                        timeout=10.0
                    )
                    
                    if admin_response.status_code == 200:
                        all_auth_users = admin_response.json().get("users", [])
                        for auth_user in all_auth_users:
                            user_id = auth_user.get("id")
                            if user_id in user_ids_set:
                                emails_map[user_id] = auth_user.get("email")
            except Exception as e:
                # If Admin API fails, continue without emails
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to fetch emails from auth.users: {str(e)}")
                # Users will still be returned, just without email addresses
        
        # Combine profiles with emails and apply search filter
        combined_users = []
        for profile in all_profiles:
            user_id = profile["id"]
            email = emails_map.get(user_id, "")
            
            # Apply search filter if provided
            if search:
                search_lower = search.lower()
                name_match = profile.get("name") and search_lower in profile.get("name", "").lower()
                email_match = email and search_lower in email.lower()
                if not name_match and not email_match:
                    continue  # Skip users that don't match search
            
            combined_users.append({
                "profile": profile,
                "email": email,
                "user_id": user_id
            })
        
        # Get total count AFTER search filtering
        total_count = len(combined_users)
        
        # Apply pagination
        paginated_users = combined_users[offset:offset + per_page]
        
        # Get order counts and totals for each user
        users = []
        for item in paginated_users:
            profile = item["profile"]
            user_id = item["user_id"]
            email = item["email"]
            
            # Get order count and total spent
            orders_response = db.table("orders").select("total").eq("user_id", user_id).execute()
            order_count = len(orders_response.data or [])
            total_spent = sum(float(o["total"]) for o in (orders_response.data or []))
            
            users.append({
                "id": user_id,
                "email": email,
                "name": profile.get("name"),
                "phone": profile.get("phone"),
                "role": profile.get("role", "customer"),
                "created_at": profile["created_at"],
                "order_count": order_count,
                "total_spent": total_spent
            })
        
        # Return users with pagination metadata
        return {
            "users": users,
            "total": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_count + per_page - 1) // per_page if total_count > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.post("", response_model=AdminUserDetail, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: AdminUserCreate,
    request: Request,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Create a new user (admin only).
    
    Returns:
        Created user details
    """
    try:
        admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        check_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
        check_params = {"email": user_data.email}
        
        async with httpx.AsyncClient() as client:
            check_response = await client.get(
                check_url,
                headers=headers,
                params=check_params,
                timeout=10.0
            )
            
            if check_response.status_code == 200:
                users = check_response.json().get("users", [])
                existing_user = next((u for u in users if u.get("email") == user_data.email), None)
                
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already registered"
                    )
            
            user_payload = {
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True,
                "user_metadata": {
                    "name": user_data.name,
                    "phone": user_data.phone
                }
            }
            
            create_response = await client.post(
                admin_api_url,
                headers=headers,
                json=user_payload,
                timeout=10.0
            )
            
            if create_response.status_code not in [200, 201]:
                error_msg = create_response.json().get("msg", "Failed to create user")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: {error_msg}"
                )
            
            user = create_response.json()
            user_id = user.get("id")
            
            profile_data = {
                "id": user_id,
                "name": user_data.name,
                "phone": user_data.phone,
                "role": user_data.role
            }
            
            try:
                db.table("user_profiles").insert(profile_data).execute()
            except Exception:
                db.table("user_profiles").update({
                    "name": user_data.name,
                    "phone": user_data.phone,
                    "role": user_data.role
                }).eq("id", user_id).execute()
            
            profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
            profile = profile_response.data[0] if profile_response.data else profile_data
            
            AuditService.log_action(
                user_id=current_user.id,
                action="user.created",
                resource_type="user",
                resource_id=user_id,
                new_values=profile
            )
            
            return {
                "id": profile["id"],
                "email": user_data.email,
                "name": profile.get("name"),
                "phone": profile.get("phone"),
                "role": profile.get("role", "customer"),
                "created_at": profile["created_at"],
                "updated_at": profile.get("updated_at", profile["created_at"]),
                "orders": []
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.get("/{user_id}", response_model=AdminUserDetail)
async def get_user(
    user_id: str = Path(..., description="User ID"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get user details (admin only).
    
    Returns:
        User details with orders
    """
    # Validate UUID
    if not validate_uuid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )
    try:
        # Get user profile
        profile_response = db.table("user_profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data:
            raise NotFoundError("User", user_id)
        
        profile = profile_response.data[0]
        
        # Get email from Admin API
        email = None
        try:
            admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                admin_response = await client.get(
                    admin_api_url,
                    headers=headers,
                    timeout=10.0
                )
                
                if admin_response.status_code == 200:
                    auth_user = admin_response.json()
                    email = auth_user.get("email")
        except Exception as e:
            # If Admin API fails, continue without email
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to fetch email from Admin API: {str(e)}")
        
        # Get user orders
        orders_response = db.table("orders").select("*").eq("user_id", user_id).order(
            "created_at", desc=True
        ).limit(10).execute()
        
        return {
            "id": profile["id"],
            "email": email,
            "name": profile.get("name"),
            "phone": profile.get("phone"),
            "role": profile.get("role", "customer"),
            "created_at": profile["created_at"],
            "updated_at": profile.get("updated_at", profile["created_at"]),
            "orders": orders_response.data or []
        }
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )


@router.put("/{user_id}", response_model=AdminUserDetail)
async def update_user(
    user_id: str = Path(..., description="User ID"),
    user_update: AdminUserUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update user (admin only).
    
    Returns:
        Updated user details
    """
    try:
        # Get existing user
        existing = db.table("user_profiles").select("*").eq("id", user_id).execute()
        if not existing.data:
            raise NotFoundError("User", user_id)
        
        old_values = existing.data[0]
        
        # Validate UUID
        if not validate_uuid(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid UUID format"
            )
        
        # Validate user_update is provided
        if not user_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User update data is required"
            )
        
        # Update user
        update_data = user_update.model_dump(exclude_unset=True)
        
        # Get email from Admin API (before update)
        email = None
        try:
            admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                admin_response = await client.get(
                    admin_api_url,
                    headers=headers,
                    timeout=10.0
                )
                
                if admin_response.status_code == 200:
                    auth_user = admin_response.json()
                    email = auth_user.get("email")
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to fetch email from Admin API: {str(e)}")
        
        if update_data:
            from datetime import datetime
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = db.table("user_profiles").update(update_data).eq("id", user_id).execute()
            
            # Log audit
            AuditService.log_action(
                user_id=current_user.id,
                action="user.updated",
                resource_type="user",
                resource_id=user_id,
                old_values=old_values,
                new_values=response.data[0] if response.data else update_data
            )
            
            updated = response.data[0] if response.data else old_values
            
            return {
                "id": updated["id"],
                "email": email,
                "name": updated.get("name"),
                "phone": updated.get("phone"),
                "role": updated.get("role", "customer"),
                "created_at": updated["created_at"],
                "updated_at": updated["updated_at"],
                "orders": []
            }
        
        # No update data provided, return current user
        return {
            "id": old_values["id"],
            "email": email,
            "name": old_values.get("name"),
            "phone": old_values.get("phone"),
            "role": old_values.get("role", "customer"),
            "created_at": old_values["created_at"],
            "updated_at": old_values.get("updated_at", old_values["created_at"]),
            "orders": []
        }
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.put("/{user_id}/role", response_model=AdminUserDetail)
async def update_user_role(
    user_id: str = Path(..., description="User ID"),
    role_update: AdminUserRoleUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update user role (admin only).
    
    Returns:
        Updated user details
    """
    # Validate UUID
    if not validate_uuid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )
    try:
        # Get existing user
        existing = db.table("user_profiles").select("*").eq("id", user_id).execute()
        if not existing.data:
            raise NotFoundError("User", user_id)
        
        old_values = existing.data[0]
        
        # Validate role_update is provided
        if not role_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role update data is required"
            )
        
        # Validate role
        if role_update.role not in ["customer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'customer' or 'admin'"
            )
        
        # Update role
        from datetime import datetime
        response = db.table("user_profiles").update({
            "role": role_update.role,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="user.role.updated",
            resource_type="user",
            resource_id=user_id,
            old_values={"role": old_values.get("role")},
            new_values={"role": role_update.role}
        )
        
        updated = response.data[0] if response.data else old_values
        
        # Get email from Admin API
        email = None
        try:
            admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                admin_response = await client.get(
                    admin_api_url,
                    headers=headers,
                    timeout=10.0
                )
                
                if admin_response.status_code == 200:
                    auth_user = admin_response.json()
                    email = auth_user.get("email")
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to fetch email from Admin API: {str(e)}")
        
        return {
            "id": updated["id"],
            "email": email,
            "name": updated.get("name"),
            "phone": updated.get("phone"),
            "role": updated.get("role", "customer"),
            "created_at": updated["created_at"],
            "updated_at": updated["updated_at"],
            "orders": []
        }
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user role: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str = Path(..., description="User ID"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Delete user (admin only).
    Deletes user from both auth.users and user_profiles.
    """
    # Validate UUID
    if not validate_uuid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )
    try:
        # Get existing user
        existing = db.table("user_profiles").select("*").eq("id", user_id).execute()
        if not existing.data:
            raise NotFoundError("User", user_id)
        
        # Prevent deleting yourself
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Log audit before deletion
        AuditService.log_action(
            user_id=current_user.id,
            action="user.deleted",
            resource_type="user",
            resource_id=user_id,
            old_values=existing.data[0]
        )
        
        # Delete from auth.users using Admin API
        try:
            admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                delete_response = await client.delete(
                    admin_api_url,
                    headers=headers,
                    timeout=10.0
                )
                
                if delete_response.status_code not in [200, 204]:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Failed to delete user from auth: {delete_response.status_code}")
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to delete user from auth.users: {str(e)}")
            # Continue to delete profile even if auth deletion fails
        
        # Delete user profile
        db.table("user_profiles").delete().eq("id", user_id).execute()
        
        return None
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )


@router.get("/count")
async def get_users_count(
    role: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get total count of users (admin only).
    
    Returns:
        Total user count
    """
    try:
        query = db.table("user_profiles").select("id", count="exact")
        
        if role:
            query = query.eq("role", role)
        
        response = query.execute()
        return {"total": response.count or 0}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user count: {str(e)}"
        )


@router.get("/{user_id}/orders")
async def get_user_orders(
    user_id: str = Path(..., description="User ID"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get user's orders (admin only).
    
    Returns:
        List of user's orders
    """
    # Validate UUID
    if not validate_uuid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )
    try:
        response = db.table("orders").select("*").eq("user_id", user_id).order(
            "created_at", desc=True
        ).execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user orders: {str(e)}"
        )
