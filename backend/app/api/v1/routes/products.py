"""Product routes."""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from app.api.v1.deps import get_db, get_current_user_optional, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.core.rate_limit import rate_limit
from app.core.security import sanitize_input, sanitize_dict, validate_uuid
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from supabase import Client

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[Product])
@rate_limit("100/minute")
async def list_products(
    db: Client = Depends(get_db),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_user_optional)
):
    """
    List products with pagination and filters.
    
    Returns:
        List of products
    """
    query = db.table("products").select("*")
    
    # Apply filters
    query = query.eq("is_active", True).is_("deleted_at", "null")
    
    if category:
        query = query.eq("category_id", category)
    if brand:
        query = query.eq("brand", brand)
    if featured is not None:
        query = query.eq("is_featured", featured)
    if search:
        search_clean = sanitize_input(search)
        query = query.or_(f"name.ilike.%{search_clean}%,description.ilike.%{search_clean}%")
    
    # Pagination
    offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)
    
    # Order by created_at desc
    query = query.order("created_at", desc=True)
    
    response = query.execute()
    return [Product(**item) for item in response.data]


@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    db: Client = Depends(get_db)
):
    """
    Get product by ID or slug.
    
    Returns:
        Product details
    """
    # Try as UUID first
    if validate_uuid(product_id):
        query = db.table("products").select("*").eq("id", product_id)
    else:
        # Try as slug
        query = db.table("products").select("*").eq("slug", sanitize_input(product_id))
    
    query = query.eq("is_active", True).is_("deleted_at", "null")
    response = query.execute()
    
    if not response.data:
        raise NotFoundError("Product", product_id)
    
    return Product(**response.data[0])


@router.post("", response_model=Product, status_code=201)
@rate_limit("20/hour")
async def create_product(
    product: ProductCreate,
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Create a new product (Admin only).
    
    Returns:
        Created product
    """
    # Validate specifications if category provided
    if product.category_id:
        from app.core.validators import validate_product_specs
        # Get category to validate specs
        category = db.table("categories").select("slug").eq("id", product.category_id).execute()
        if category.data:
            validate_product_specs(category.data[0]["slug"], product.specifications)
    
    # Sanitize inputs
    product_data = product.model_dump()
    product_data = sanitize_dict(product_data)
    
    # Insert product
    response = db.table("products").insert(product_data).execute()
    
    # Log audit
    AuditService.log_action(
        user_id=current_user.id,
        action="product.created",
        resource_type="product",
        resource_id=response.data[0]["id"]
    )
    
    return Product(**response.data[0])


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str = Depends(validate_uuid_param),
    product: ProductUpdate = None,
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Update a product (Admin only).
    
    Returns:
        Updated product
    """
    # Get existing product
    existing = db.table("products").select("*").eq("id", product_id).execute()
    if not existing.data:
        raise NotFoundError("Product", product_id)
    
    old_values = existing.data[0]
    
    # Update product
    update_data = product.model_dump(exclude_unset=True)
    if update_data:
        update_data = sanitize_dict(update_data)
        response = db.table("products").update(update_data).eq("id", product_id).execute()
        
        # Log audit
        AuditService.log_action(
            user_id=current_user.id,
            action="product.updated",
            resource_type="product",
            resource_id=product_id,
            old_values=old_values,
            new_values=response.data[0] if response.data else update_data
        )
        
        return Product(**response.data[0])
    
    return Product(**old_values)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Soft delete a product (Admin only).
    """
    # Get existing product
    existing = db.table("products").select("*").eq("id", product_id).execute()
    if not existing.data:
        raise NotFoundError("Product", product_id)
    
    # Soft delete
    from datetime import datetime
    db.table("products").update({
        "deleted_at": datetime.utcnow().isoformat(),
        "is_active": False
    }).eq("id", product_id).execute()
    
    # Log audit
    AuditService.log_action(
        user_id=current_user.id,
        action="product.deleted",
        resource_type="product",
        resource_id=product_id,
        old_values=existing.data[0]
    )

