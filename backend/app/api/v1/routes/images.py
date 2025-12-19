"""Product images routes."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Path
from typing import List
from app.api.v1.deps import get_db, get_current_user, validate_uuid_param
from app.core.security import validate_uuid
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
    request: Request,
    product_id: str = Path(..., description="Product ID"),
    db: Client = Depends(get_db)
):
    """
    Get product images.
    
    Returns:
        List of product images
    """
    # Validate UUID format
    if not validate_uuid(product_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    
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
    request: Request,
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


@router.delete("/{image_id}", status_code=204)
@rate_limit("20/hour")
async def delete_image(
    request: Request,
    image_id: str = Path(..., description="Image ID"),
    db: Client = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Delete product image (Admin only).
    """
    # Validate UUID format
    if not validate_uuid(image_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    
    try:
        # Get image record
        image_response = db.table("product_images").select("*").eq("id", image_id).execute()
        if not image_response.data:
            raise NotFoundError("Product Image", image_id)
        
        image = image_response.data[0]
        
        # Delete from storage (extract file path from URL)
        try:
            # Extract file path from image_url
            # URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
            image_url = image.get("image_url", "")
            if image_url and settings.SUPABASE_STORAGE_BUCKET in image_url:
                # Extract path after bucket name
                bucket_index = image_url.find(settings.SUPABASE_STORAGE_BUCKET)
                if bucket_index != -1:
                    file_path = image_url[bucket_index + len(settings.SUPABASE_STORAGE_BUCKET) + 1:]
                    db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
        except Exception as storage_error:
            # Log but don't fail if storage deletion fails
            print(f"Warning: Failed to delete image from storage: {storage_error}")
        
        # Delete image record
        db.table("product_images").delete().eq("id", image_id).execute()
        
        return None
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )
