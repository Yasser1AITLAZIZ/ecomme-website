"""Admin product management routes."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from typing import List, Dict, Any, Optional
import json
import pandas as pd
from io import BytesIO
from pathlib import Path
import os

from app.api.v1.deps import get_db, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from supabase import Client
from app.config import settings
from app.database import get_supabase_client
import structlog
from PIL import Image
import requests

logger = structlog.get_logger()


def ensure_bucket_exists(db: Client, bucket_name: str) -> None:
    """Ensure storage bucket exists, create if it doesn't."""
    try:
        buckets = db.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if bucket_name not in bucket_names:
            logger.info("Creating storage bucket", bucket_name=bucket_name)
            db.storage.create_bucket(
                bucket_name,
                options={"public": True, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]}
            )
            logger.info("Storage bucket created", bucket_name=bucket_name)
    except Exception as e:
        if "already exists" not in str(e).lower():
            logger.warning("Bucket check/create issue", error=str(e))


def compress_image(img: Image.Image, max_size_kb: int = 200) -> BytesIO:
    """Compress an image to keep file size under max_size_kb."""
    quality = 85
    output = BytesIO()
    
    img.save(output, format='JPEG', quality=quality, optimize=True)
    
    while output.tell() > max_size_kb * 1024 and quality > 50:
        quality -= 5
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
    
    output.seek(0)
    return output


def upload_image_to_storage(
    db: Client,
    product_id: str,
    image_bytes: BytesIO,
    filename: str
) -> Optional[str]:
    """Upload image to Supabase Storage and return public URL."""
    file_path = f"{product_id}/{filename}"
    
    try:
        db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            file_path,
            image_bytes.getvalue(),
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )
        
        public_url = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(file_path)
        logger.info("Image uploaded", product_id=product_id, file_path=file_path)
        return public_url
    except Exception as e:
        logger.error("Failed to upload image", product_id=product_id, error=str(e))
        return None


def get_category_id(db: Client, category_slug: str) -> Optional[str]:
    """Get category ID from slug."""
    try:
        response = db.table("categories").select("id").eq("slug", category_slug).eq("is_active", True).execute()
        if response.data:
            return response.data[0]["id"]
        logger.warning("Category not found", slug=category_slug)
        return None
    except Exception as e:
        logger.error("Failed to get category", slug=category_slug, error=str(e))
        return None


def parse_specifications(specs_str: Optional[str]) -> Dict[str, Any]:
    """Parse specifications from JSON string or return empty dict."""
    if not specs_str or not str(specs_str).strip():
        return {}
    
    try:
        return json.loads(str(specs_str))
    except json.JSONDecodeError:
        logger.warning("Invalid JSON in specifications", specs=str(specs_str)[:50])
        return {}


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from product name."""
    slug = name.lower()
    slug = slug.replace(" ", "-").replace("'", "").replace('"', "")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")

router = APIRouter(prefix="/admin/products", tags=["Admin - Products"])


@router.post("/bulk-import")
async def bulk_import_products(
    request: Request,
    file: UploadFile = File(...),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Bulk import products from CSV or Excel file (Admin only).
    
    The file should contain product data with columns:
    - Required: name, sku, price, category_slug, stock
    - Optional: description, brand, compare_at_price, etc.
    - Images: image_url_1, image_url_2, ... (public URLs only)
    
    Note: Only image URLs are supported in web interface. For local file paths,
    use the command-line script: python scripts/bulk_import_products.py
    
    Returns:
        Import results with success/error counts
    """
    try:
        # Ensure storage bucket exists
        ensure_bucket_exists(db, settings.SUPABASE_STORAGE_BUCKET)
        
        # Read file content
        file_content = await file.read()
        file_extension = Path(file.filename).suffix.lower()
        
        # Parse file based on extension
        if file_extension == '.csv':
            df = pd.read_csv(BytesIO(file_content))
        elif file_extension in ['.xlsx', '.xls']:
            df = pd.read_excel(BytesIO(file_content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Use .csv or .xlsx"
            )
        
        # Convert to list of dictionaries
        df = df.where(pd.notna(df), None)
        rows = df.to_dict('records')
        
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty or contains no data"
            )
        
        # Process each row
        results = []
        success_count = 0
        error_count = 0
        
        for idx, row in enumerate(rows, 1):
            try:
                # Extract images (only URLs supported in web interface)
                image_urls = []
                
                for key, value in row.items():
                    if value and pd.notna(value):
                        if key.startswith("image_url_"):
                            image_urls.append(str(value).strip())
                
                # Sort by column number
                image_urls.sort(key=lambda x: int(x.split("_")[-1]) if x.split("_")[-1].isdigit() else 0)
                
                # Validate required fields
                required_fields = ["name", "sku", "price", "category_slug", "stock"]
                missing_fields = [f for f in required_fields if not row.get(f)]
                
                if missing_fields:
                    results.append({
                        "row": idx,
                        "success": False,
                        "product_name": row.get("name", "Unknown"),
                        "errors": [f"Missing required field: {field}" for field in missing_fields]
                    })
                    error_count += 1
                    continue
                
                # Get category ID
                category_id = get_category_id(db, row["category_slug"])
                if not category_id:
                    results.append({
                        "row": idx,
                        "success": False,
                        "product_name": row.get("name", "Unknown"),
                        "errors": [f"Category '{row['category_slug']}' not found"]
                    })
                    error_count += 1
                    continue
                
                # Check if SKU already exists
                existing = db.table("products").select("id").eq("sku", str(row["sku"]).strip().upper()).execute()
                if existing.data:
                    results.append({
                        "row": idx,
                        "success": False,
                        "product_name": row.get("name", "Unknown"),
                        "errors": [f"SKU '{row['sku']}' already exists"]
                    })
                    error_count += 1
                    continue
                
                # Prepare product data
                product_data = {
                    "name": str(row["name"]).strip(),
                    "sku": str(row["sku"]).strip().upper(),
                    "slug": generate_slug(row["name"]),
                    "price": float(row["price"]),
                    "category_id": category_id,
                    "stock": int(row["stock"]),
                    "is_active": True,
                }
                
                # Optional fields
                if row.get("description"):
                    product_data["description"] = str(row["description"]).strip()
                if row.get("short_description"):
                    product_data["short_description"] = str(row["short_description"]).strip()
                if row.get("brand"):
                    product_data["brand"] = str(row["brand"]).strip()
                if row.get("compare_at_price"):
                    product_data["compare_at_price"] = float(row["compare_at_price"])
                if row.get("cost_price"):
                    product_data["cost_price"] = float(row["cost_price"])
                if row.get("weight"):
                    product_data["weight"] = float(row["weight"])
                if row.get("is_featured"):
                    product_data["is_featured"] = bool(row.get("is_featured", False))
                if row.get("specifications"):
                    product_data["specifications"] = parse_specifications(row["specifications"])
                
                # Create product
                response = db.table("products").insert(product_data).execute()
                product_id = response.data[0]["id"]
                
                # Log audit
                AuditService.log_action(
                    user_id=current_user.id,
                    action="product.created",
                    resource_type="product",
                    resource_id=product_id
                )
                
                # Upload and link images
                uploaded_images = 0
                for img_idx, image_url in enumerate(image_urls, 1):
                    if not image_url or not str(image_url).strip():
                        continue
                    
                    image_url = str(image_url).strip()
                    image_bytes = None
                    
                    # Check if it's a URL
                    if image_url.startswith(("http://", "https://")):
                        try:
                            img_response = requests.get(image_url, timeout=10, stream=True)
                            img_response.raise_for_status()
                            img = Image.open(BytesIO(img_response.content))
                            if img.mode in ('RGBA', 'LA', 'P'):
                                background = Image.new('RGB', img.size, (255, 255, 255))
                                if img.mode == 'P':
                                    img = img.convert('RGBA')
                                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                                img = background
                            elif img.mode != 'RGB':
                                img = img.convert('RGB')
                            image_bytes = compress_image(img)
                        except Exception as e:
                            logger.warning("Failed to download image", url=image_url, error=str(e))
                            continue
                    
                    if image_bytes:
                        filename = f"image-{img_idx}.jpg"
                        public_url = upload_image_to_storage(db, product_id, image_bytes, filename)
                        if public_url:
                            db.table("product_images").insert({
                                "product_id": product_id,
                                "image_url": public_url,
                                "is_primary": img_idx == 1,
                                "order": img_idx - 1
                            }).execute()
                            uploaded_images += 1
                
                success_count += 1
                results.append({
                    "row": idx,
                    "success": True,
                    "product_id": product_id,
                    "product_name": product_data["name"],
                    "images_uploaded": uploaded_images
                })
                
            except Exception as e:
                error_count += 1
                results.append({
                    "row": idx,
                    "success": False,
                    "product_name": row.get("name", "Unknown"),
                    "errors": [f"Import error: {str(e)}"]
                })
                logger.error("Failed to import product", row=idx, error=str(e))
        
        # Return summary
        return {
            "success": True,
            "summary": {
                "total": len(rows),
                "successful": success_count,
                "failed": error_count
            },
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Bulk import failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk import failed: {str(e)}"
        )
