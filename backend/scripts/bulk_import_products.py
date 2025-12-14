"""Bulk import products from CSV or Excel file.

This script allows you to import multiple products with their images at once.
Supports both CSV and Excel (.xlsx) formats.

CSV/Excel Format:
- Required columns: name, sku, price, category_slug, stock
- Optional columns: description, short_description, brand, compare_at_price, 
  cost_price, weight, is_featured, specifications (JSON string)
- Image columns: image_url_1, image_url_2, ... (URLs) OR image_path_1, image_path_2, ... (local paths)

Example CSV:
name,sku,price,category_slug,stock,brand,image_url_1,image_url_2
iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,https://example.com/img1.jpg,https://example.com/img2.jpg

Usage:
    python scripts/bulk_import_products.py products.csv
    python scripts/bulk_import_products.py products.xlsx
"""
import sys
import os
import json
import csv
from pathlib import Path
from typing import List, Dict, Optional, Any
from io import BytesIO
from urllib.parse import urlparse
import requests

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import pandas as pd
except ImportError:
    print("ERROR: pandas is required. Install it with: pip install pandas openpyxl")
    sys.exit(1)

from PIL import Image
from app.database import get_supabase_client
from app.config import settings
import structlog

logger = structlog.get_logger()


def ensure_bucket_exists(db, bucket_name: str) -> None:
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


def download_image(url: str) -> Optional[BytesIO]:
    """Download image from URL and return as BytesIO."""
    try:
        response = requests.get(url, timeout=10, stream=True)
        response.raise_for_status()
        
        img = Image.open(BytesIO(response.content))
        # Convert to RGB if necessary (for JPEG)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        return compress_image(img)
    except Exception as e:
        logger.error("Failed to download image", url=url, error=str(e))
        return None


def load_local_image(path: str) -> Optional[BytesIO]:
    """Load image from local file path and return as BytesIO."""
    try:
        img_path = Path(path)
        if not img_path.exists():
            logger.error("Image file not found", path=path)
            return None
        
        img = Image.open(img_path)
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        return compress_image(img)
    except Exception as e:
        logger.error("Failed to load local image", path=path, error=str(e))
        return None


def upload_image_to_storage(
    db,
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


def get_category_id(db, category_slug: str) -> Optional[str]:
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
    if not specs_str or not specs_str.strip():
        return {}
    
    try:
        return json.loads(specs_str)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON in specifications", specs=specs_str[:50])
        return {}


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from product name."""
    slug = name.lower()
    # Replace spaces and special chars
    slug = slug.replace(" ", "-").replace("'", "").replace('"', "")
    # Remove multiple dashes
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def import_product(
    db,
    row: Dict[str, Any],
    image_urls: List[str],
    image_paths: List[str]
) -> Dict[str, Any]:
    """Import a single product with its images."""
    result = {
        "success": False,
        "product_id": None,
        "product_name": row.get("name", "Unknown"),
        "errors": []
    }
    
    try:
        # Validate required fields
        required_fields = ["name", "sku", "price", "category_slug", "stock"]
        for field in required_fields:
            if not row.get(field):
                result["errors"].append(f"Missing required field: {field}")
                return result
        
        # Get category ID
        category_id = get_category_id(db, row["category_slug"])
        if not category_id:
            result["errors"].append(f"Category '{row['category_slug']}' not found")
            return result
        
        # Check if SKU already exists
        existing = db.table("products").select("id").eq("sku", row["sku"]).execute()
        if existing.data:
            result["errors"].append(f"SKU '{row['sku']}' already exists")
            return result
        
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
        result["product_id"] = product_id
        logger.info("Product created", product_id=product_id, name=product_data["name"])
        
        # Upload and link images
        uploaded_images = 0
        for idx, image_url in enumerate(image_urls, 1):
            if not image_url or not str(image_url).strip():
                continue
            
            image_url = str(image_url).strip()
            image_bytes = None
            
            # Check if it's a URL or local path
            if image_url.startswith(("http://", "https://")):
                image_bytes = download_image(image_url)
            elif os.path.exists(image_url):
                image_bytes = load_local_image(image_url)
            else:
                logger.warning("Image not found (URL or path)", image=image_url)
                continue
            
            if image_bytes:
                filename = f"image-{idx}.jpg"
                public_url = upload_image_to_storage(db, product_id, image_bytes, filename)
                if public_url:
                    # Insert image record
                    db.table("product_images").insert({
                        "product_id": product_id,
                        "image_url": public_url,
                        "is_primary": idx == 1,  # First image is primary
                        "order": idx - 1
                    }).execute()
                    uploaded_images += 1
        
        # Handle local image paths
        for idx, image_path in enumerate(image_paths, len(image_urls) + 1):
            if not image_path or not str(image_path).strip():
                continue
            
            image_path = str(image_path).strip()
            image_bytes = load_local_image(image_path)
            
            if image_bytes:
                filename = f"image-{idx}.jpg"
                public_url = upload_image_to_storage(db, product_id, image_bytes, filename)
                if public_url:
                    db.table("product_images").insert({
                        "product_id": product_id,
                        "image_url": public_url,
                        "is_primary": uploaded_images == 0 and idx == len(image_paths) + 1,
                        "order": idx - 1
                    }).execute()
                    uploaded_images += 1
        
        result["success"] = True
        result["images_uploaded"] = uploaded_images
        logger.info("Product imported successfully", product_id=product_id, images=uploaded_images)
        
    except Exception as e:
        result["errors"].append(f"Import error: {str(e)}")
        logger.error("Failed to import product", product=row.get("name"), error=str(e))
    
    return result


def read_file(file_path: str) -> List[Dict[str, Any]]:
    """Read CSV or Excel file and return list of dictionaries."""
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if path.suffix.lower() == '.csv':
        df = pd.read_csv(file_path)
    elif path.suffix.lower() in ['.xlsx', '.xls']:
        df = pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file format: {path.suffix}. Use .csv or .xlsx")
    
    # Convert NaN to None
    df = df.where(pd.notna(df), None)
    
    return df.to_dict('records')


def extract_images(row: Dict[str, Any]) -> tuple[List[str], List[str]]:
    """Extract image URLs and paths from row."""
    image_urls = []
    image_paths = []
    
    # Find all image columns
    for key, value in row.items():
        if value and pd.notna(value):
            if key.startswith("image_url_"):
                image_urls.append(str(value).strip())
            elif key.startswith("image_path_"):
                image_paths.append(str(value).strip())
    
    # Sort by column number
    image_urls.sort(key=lambda x: int(x.split("_")[-1]) if x.split("_")[-1].isdigit() else 0)
    image_paths.sort(key=lambda x: int(x.split("_")[-1]) if x.split("_")[-1].isdigit() else 0)
    
    return image_urls, image_paths


def main():
    """Main function to bulk import products."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/bulk_import_products.py <file.csv or file.xlsx>")
        print("\nCSV/Excel Format:")
        print("Required columns: name, sku, price, category_slug, stock")
        print("Optional columns: description, short_description, brand, compare_at_price,")
        print("                  cost_price, weight, is_featured, specifications (JSON)")
        print("Image columns: image_url_1, image_url_2, ... (URLs)")
        print("              OR image_path_1, image_path_2, ... (local file paths)")
        print("\nExample:")
        print("name,sku,price,category_slug,stock,brand,image_url_1")
        print("iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,https://example.com/img.jpg")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    logger.info("Starting bulk product import", file=file_path)
    
    # Initialize Supabase client
    db = get_supabase_client()
    
    # Ensure storage bucket exists
    ensure_bucket_exists(db, settings.SUPABASE_STORAGE_BUCKET)
    
    # Read file
    try:
        rows = read_file(file_path)
        logger.info("File read successfully", rows=len(rows))
    except Exception as e:
        logger.error("Failed to read file", error=str(e))
        print(f"ERROR: Failed to read file: {e}")
        sys.exit(1)
    
    # Process each row
    results = []
    success_count = 0
    error_count = 0
    
    for idx, row in enumerate(rows, 1):
        logger.info("Processing row", row_number=idx, product_name=row.get("name"))
        
        # Extract images
        image_urls, image_paths = extract_images(row)
        
        # Import product
        result = import_product(db, row, image_urls, image_paths)
        results.append(result)
        
        if result["success"]:
            success_count += 1
        else:
            error_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Bulk Import Summary")
    print(f"{'='*60}")
    print(f"Total rows processed: {len(rows)}")
    print(f"Successfully imported: {success_count}")
    print(f"Failed: {error_count}")
    print(f"{'='*60}\n")
    
    # Show errors
    if error_count > 0:
        print("Errors:")
        for result in results:
            if not result["success"]:
                print(f"  - {result['product_name']}: {', '.join(result['errors'])}")
        print()
    
    # Show successful imports
    if success_count > 0:
        print("Successfully imported products:")
        for result in results:
            if result["success"]:
                images_info = f" ({result.get('images_uploaded', 0)} images)" if result.get('images_uploaded', 0) > 0 else ""
                print(f"  ✓ {result['product_name']}{images_info}")
        print()


if __name__ == "__main__":
    main()
