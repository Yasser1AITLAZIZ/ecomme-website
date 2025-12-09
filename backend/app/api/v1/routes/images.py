"""Product images routes."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from app.api.v1.deps import get_db, get_current_user, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.product import ProductImage, ProductImageCreate
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from supabase import Client
from app.config import settings

router = APIRouter(prefix="/images", tags=["Images"])


@router.get("/product/{product_id}", response_model=List[ProductImage])
@rate_limit("100/minute")
async def get_product_images(
    product_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db)
):
    """
    Get product images.
    
    Returns:
        List of product images
    """
    # Verify product exists
    product = db.table("products").select("id").eq("id", product_id).execute()
    if not product.data:
        raise NotFoundError("Product", product_id)
    
    response = db.table("product_images").select("*").eq(
        "product_id", product_id
    ).order("order").order("is_primary", desc=True).execute()
    
    return [ProductImage(**img) for img in (response.data or [])]


@router.post("/upload", response_model=ProductImage, status_code=201)
@rate_limit("20/hour")
async def upload_image(
    product_id: str,
    image: UploadFile = File(...),
    is_primary: bool = False,
    order: int = 0,
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Upload product image (Admin only).
    
    Returns:
        Created image record
    """
    # Verify product exists
    product = db.table("products").select("id").eq("id", product_id).execute()
    if not product.data:
        raise NotFoundError("Product", product_id)
    
    # Read file
    file_content = await image.read()
    file_name = f"{product_id}/{image.filename}"
    
    # Upload to Supabase Storage
    try:
        storage_response = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            file_name,
            file_content,
            file_options={"content-type": image.content_type}
        )
        
        # Get public URL
        public_url = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(file_name)
        
        # If this is primary, unset other primaries
        if is_primary:
            db.table("product_images").update({"is_primary": False}).eq(
                "product_id", product_id
            ).execute()
        
        # Create image record
        response = db.table("product_images").insert({
            "product_id": product_id,
            "image_url": public_url,
            "is_primary": is_primary,
            "order": order
        }).execute()
        
        return ProductImage(**response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

