"""Admin category management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.v1.deps import get_db, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.admin import Category, CategoryCreate, CategoryUpdate
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from supabase import Client

router = APIRouter(prefix="/admin/categories", tags=["Admin - Categories"])


@router.get("", response_model=List[Category])
async def list_categories(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    List all categories (admin only).
    
    Returns:
        List of categories
    """
    try:
        response = db.table("categories").select("*").order("sort_order", desc=False).order(
            "created_at", desc=True
        ).execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )


@router.post("", response_model=Category, status_code=201)
async def create_category(
    category: CategoryCreate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Create a new category (admin only).
    
    Returns:
        Created category
    """
    try:
        # Check if slug already exists
        existing = db.table("categories").select("id").eq("slug", category.slug).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
        
        # Validate parent_id if provided
        if category.parent_id:
            parent = db.table("categories").select("id").eq("id", category.parent_id).execute()
            if not parent.data:
                raise NotFoundError("Category", category.parent_id)
        
        # Create category
        category_data = category.model_dump()
        response = db.table("categories").insert(category_data).execute()
        
        created = response.data[0]
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="category.created",
            resource_type="category",
            resource_id=created["id"],
            new_values=created
        )
        
        return created
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(e)}"
        )


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str = Depends(validate_uuid_param),
    category: CategoryUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update a category (admin only).
    
    Returns:
        Updated category
    """
    try:
        # Get existing category
        existing = db.table("categories").select("*").eq("id", category_id).execute()
        if not existing.data:
            raise NotFoundError("Category", category_id)
        
        old_values = existing.data[0]
        
        # Check slug uniqueness if slug is being updated
        if category.slug and category.slug != old_values["slug"]:
            slug_check = db.table("categories").select("id").eq("slug", category.slug).execute()
            if slug_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this slug already exists"
                )
        
        # Validate parent_id if provided
        if category.parent_id:
            if category.parent_id == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category cannot be its own parent"
                )
            parent = db.table("categories").select("id").eq("id", category.parent_id).execute()
            if not parent.data:
                raise NotFoundError("Category", category.parent_id)
        
        # Update category
        update_data = category.model_dump(exclude_unset=True)
        if update_data:
            from datetime import datetime
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = db.table("categories").update(update_data).eq("id", category_id).execute()
            
            # Log audit
            AuditService.log_action(
                user_id=current_user.id,
                action="category.updated",
                resource_type="category",
                resource_id=category_id,
                old_values=old_values,
                new_values=response.data[0] if response.data else update_data
            )
            
            return response.data[0]
        
        return old_values
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update category: {str(e)}"
        )


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Delete a category (admin only).
    Note: This will fail if category has products or child categories.
    """
    try:
        # Get existing category
        existing = db.table("categories").select("*").eq("id", category_id).execute()
        if not existing.data:
            raise NotFoundError("Category", category_id)
        
        # Check if category has products
        products = db.table("products").select("id").eq("category_id", category_id).limit(1).execute()
        if products.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with associated products"
            )
        
        # Check if category has children
        children = db.table("categories").select("id").eq("parent_id", category_id).limit(1).execute()
        if children.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with child categories"
            )
        
        # Delete category
        db.table("categories").delete().eq("id", category_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="category.deleted",
            resource_type="category",
            resource_id=category_id,
            old_values=existing.data[0]
        )
        
        return None
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete category: {str(e)}"
        )
