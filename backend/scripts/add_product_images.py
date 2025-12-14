"""Script to add compressed product images to existing products.

This script:
1. Queries existing products from the database
2. Generates placeholder images for each product based on category
3. Compresses images to keep file sizes < 200KB
4. Uploads images to Supabase Storage
5. Inserts image records into product_images table
"""
import sys
import os
from pathlib import Path
from io import BytesIO
from typing import List, Dict, Optional

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from PIL import Image, ImageDraw, ImageFont
from app.database import get_supabase_client
from app.config import settings
import structlog

logger = structlog.get_logger()


def generate_placeholder_image(
    product_name: str,
    category: str,
    width: int = 800,
    height: int = 800
) -> BytesIO:
    """Generate a placeholder image for a product.
    
    Args:
        product_name: Name of the product
        category: Category slug (iphone, android, accessories)
        width: Image width in pixels
        height: Image height in pixels
        
    Returns:
        BytesIO object containing the compressed image
    """
    # Create image with gradient background based on category
    img = Image.new('RGB', (width, height), color='#1a1a1a')
    draw = ImageDraw.Draw(img)
    
    # Category-specific colors
    colors = {
        'iphone': ('#007AFF', '#0051D5'),  # Apple blue
        'android': ('#3DDC84', '#0F9D58'),  # Android green
        'accessories': ('#FF6B35', '#F7931E'),  # Orange
    }
    
    primary_color, secondary_color = colors.get(category, ('#666666', '#333333'))
    
    # Draw gradient background (simplified - solid color with pattern)
    for y in range(height):
        # Simple gradient effect
        ratio = y / height
        r1, g1, b1 = tuple(int(primary_color[i:i+2], 16) for i in (1, 3, 5))
        r2, g2, b2 = tuple(int(secondary_color[i:i+2], 16) for i in (1, 3, 5))
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Add product name text
    try:
        # Try to use a default font, fallback to basic if not available
        try:
            font_large = ImageFont.truetype("arial.ttf", 48)
            font_small = ImageFont.truetype("arial.ttf", 24)
        except:
            try:
                font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
                font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
            except:
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw product name (split into lines if too long)
    text_lines = []
    words = product_name.split()
    current_line = ""
    
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        bbox = draw.textbbox((0, 0), test_line, font=font_large)
        text_width = bbox[2] - bbox[0]
        
        if text_width > width - 80:
            if current_line:
                text_lines.append(current_line)
            current_line = word
        else:
            current_line = test_line
    
    if current_line:
        text_lines.append(current_line)
    
    # Center text vertically
    total_text_height = len(text_lines) * 60
    start_y = (height - total_text_height) // 2
    
    for i, line in enumerate(text_lines):
        bbox = draw.textbbox((0, 0), line, font=font_large)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        y = start_y + i * 60
        
        # Draw text with shadow for better visibility
        draw.text((x + 2, y + 2), line, font=font_large, fill=(0, 0, 0, 180))
        draw.text((x, y), line, font=font_large, fill='#FFFFFF')
    
    # Add category label at bottom
    category_label = category.upper()
    bbox = draw.textbbox((0, 0), category_label, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = height - 50
    
    draw.text((x + 1, y + 1), category_label, font=font_small, fill=(0, 0, 0, 180))
    draw.text((x, y), category_label, font=font_small, fill='#CCCCCC')
    
    # Compress image
    return compress_image(img)


def compress_image(img: Image.Image, max_size_kb: int = 200) -> BytesIO:
    """Compress an image to keep file size under max_size_kb.
    
    Args:
        img: PIL Image object
        max_size_kb: Maximum file size in KB
        
    Returns:
        BytesIO object containing compressed image
    """
    quality = 85
    output = BytesIO()
    
    # Save with initial quality
    img.save(output, format='JPEG', quality=quality, optimize=True)
    
    # Reduce quality if file is too large
    while output.tell() > max_size_kb * 1024 and quality > 50:
        quality -= 5
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
    
    output.seek(0)
    return output


def ensure_bucket_exists(db, bucket_name: str) -> None:
    """Ensure storage bucket exists, create if it doesn't.
    
    Args:
        db: Supabase client
        bucket_name: Name of the bucket
    """
    try:
        # Try to list buckets to check if it exists
        buckets = db.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if bucket_name not in bucket_names:
            logger.info("Creating storage bucket", bucket_name=bucket_name)
            # Create bucket with public access
            db.storage.create_bucket(
                bucket_name,
                options={"public": True, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]}
            )
            logger.info("Storage bucket created", bucket_name=bucket_name)
        else:
            logger.info("Storage bucket already exists", bucket_name=bucket_name)
    except Exception as e:
        # If listing fails, try to create anyway (might be permission issue)
        logger.warning("Could not verify bucket existence, attempting to create", bucket_name=bucket_name, error=str(e))
        try:
            db.storage.create_bucket(
                bucket_name,
                options={"public": True, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]}
            )
            logger.info("Storage bucket created", bucket_name=bucket_name)
        except Exception as create_error:
            # If creation fails with "already exists", that's fine
            if "already exists" in str(create_error).lower() or "duplicate" in str(create_error).lower():
                logger.info("Bucket already exists (creation returned error)", bucket_name=bucket_name)
            else:
                logger.error("Failed to create bucket", bucket_name=bucket_name, error=str(create_error))
                raise


def upload_image_to_storage(
    db,
    product_id: str,
    image_bytes: BytesIO,
    filename: str = "primary.jpg"
) -> str:
    """Upload image to Supabase Storage and return public URL.
    
    Args:
        db: Supabase client
        product_id: Product UUID
        image_bytes: BytesIO object containing image data
        filename: Name of the file
        
    Returns:
        Public URL of the uploaded image
    """
    file_path = f"{product_id}/{filename}"
    
    try:
        # Ensure bucket exists
        ensure_bucket_exists(db, settings.SUPABASE_STORAGE_BUCKET)
        
        # Upload to storage
        db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            file_path,
            image_bytes.getvalue(),
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )
        
        # Get public URL
        public_url = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(file_path)
        
        logger.info("Image uploaded successfully", product_id=product_id, file_path=file_path)
        return public_url
    
    except Exception as e:
        logger.error("Failed to upload image", product_id=product_id, error=str(e))
        raise


def insert_image_record(
    db,
    product_id: str,
    image_url: str,
    is_primary: bool = True,
    order: int = 0
) -> None:
    """Insert image record into product_images table.
    
    Args:
        db: Supabase client
        product_id: Product UUID
        image_url: Public URL of the image
        is_primary: Whether this is the primary image
        order: Display order
    """
    try:
        # If this is primary, unset other primaries first
        if is_primary:
            db.table("product_images").update({"is_primary": False}).eq(
                "product_id", product_id
            ).execute()
        
        # Insert new image record
        response = db.table("product_images").insert({
            "product_id": product_id,
            "image_url": image_url,
            "is_primary": is_primary,
            "order": order
        }).execute()
        
        logger.info("Image record inserted", product_id=product_id, image_url=image_url)
    
    except Exception as e:
        logger.error("Failed to insert image record", product_id=product_id, error=str(e))
        raise


def get_products_by_category(db) -> List[Dict]:
    """Query products grouped by category.
    
    Args:
        db: Supabase client
        
    Returns:
        List of product dictionaries with category information
    """
    try:
        response = db.table("products").select(
            "id, name, sku, category_id, categories!inner(slug, name)"
        ).eq("is_active", True).is_("deleted_at", "null").execute()
        
        products = []
        for item in response.data or []:
            category = item.get("categories", {})
            products.append({
                "id": item["id"],
                "name": item["name"],
                "sku": item["sku"],
                "category_id": item["category_id"],
                "category_slug": category.get("slug", "unknown"),
                "category_name": category.get("name", "Unknown")
            })
        
        return products
    
    except Exception as e:
        logger.error("Failed to query products", error=str(e))
        raise


def check_existing_images(db, product_id: str) -> bool:
    """Check if product already has images.
    
    Args:
        db: Supabase client
        product_id: Product UUID
        
    Returns:
        True if product has images, False otherwise
    """
    try:
        response = db.table("product_images").select("id").eq("product_id", product_id).execute()
        return len(response.data or []) > 0
    except:
        return False


def main():
    """Main function to add images to all products."""
    logger.info("Starting product image addition workflow")
    
    # Initialize Supabase client
    db = get_supabase_client()
    
    # Ensure storage bucket exists
    logger.info("Ensuring storage bucket exists", bucket=settings.SUPABASE_STORAGE_BUCKET)
    try:
        ensure_bucket_exists(db, settings.SUPABASE_STORAGE_BUCKET)
    except Exception as e:
        logger.error("Failed to ensure bucket exists", error=str(e))
        print(f"\nERROR: Could not create storage bucket '{settings.SUPABASE_STORAGE_BUCKET}'")
        print("Please create it manually in Supabase Dashboard:")
        print("1. Go to Storage in Supabase Dashboard")
        print(f"2. Create a new bucket named '{settings.SUPABASE_STORAGE_BUCKET}'")
        print("3. Make it public")
        print("4. Run this script again\n")
        return
    
    # Get all products
    logger.info("Querying products from database")
    products = get_products_by_category(db)
    
    if not products:
        logger.warning("No products found in database")
        return
    
    logger.info(f"Found {len(products)} products to process")
    
    # Group by category for logging
    by_category = {}
    for product in products:
        cat = product["category_slug"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(product)
    
    for cat, prods in by_category.items():
        logger.info(f"Category {cat}: {len(prods)} products")
    
    # Process each product
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for product in products:
        product_id = product["id"]
        product_name = product["name"]
        category_slug = product["category_slug"]
        
        logger.info(
            "Processing product",
            product_id=product_id,
            product_name=product_name,
            category=category_slug
        )
        
        # Check if product already has images
        if check_existing_images(db, product_id):
            logger.info("Product already has images, skipping", product_id=product_id)
            skip_count += 1
            continue
        
        try:
            # Generate placeholder image
            logger.info("Generating placeholder image", product_id=product_id)
            image_bytes = generate_placeholder_image(product_name, category_slug)
            
            # Get file size for logging
            file_size_kb = len(image_bytes.getvalue()) / 1024
            logger.info("Image generated", product_id=product_id, size_kb=round(file_size_kb, 2))
            
            # Upload to Supabase Storage
            logger.info("Uploading image to Supabase Storage", product_id=product_id)
            public_url = upload_image_to_storage(db, product_id, image_bytes)
            
            # Insert image record
            logger.info("Inserting image record", product_id=product_id)
            insert_image_record(db, product_id, public_url, is_primary=True, order=0)
            
            success_count += 1
            logger.info("Product image added successfully", product_id=product_id)
        
        except Exception as e:
            error_count += 1
            logger.error(
                "Failed to add image to product",
                product_id=product_id,
                product_name=product_name,
                error=str(e)
            )
    
    # Summary
    logger.info(
        "Product image addition workflow completed",
        total=len(products),
        success=success_count,
        skipped=skip_count,
        errors=error_count
    )
    
    print(f"\n{'='*60}")
    print(f"Product Image Addition Summary")
    print(f"{'='*60}")
    print(f"Total products: {len(products)}")
    print(f"Successfully added images: {success_count}")
    print(f"Skipped (already have images): {skip_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
