# Bulk Product Import Guide

This guide explains how to bulk import products with images into your e-commerce database using CSV or Excel files.

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   cd backend
   pip install pandas openpyxl
   ```

2. **Prepare your CSV/Excel file** (see format below)

3. **Run the import script**:
   ```bash
   python scripts/bulk_import_products.py products.csv
   # OR
   python scripts/bulk_import_products.py products.xlsx
   ```

## CSV/Excel File Format

### Required Columns

- `name` - Product name (e.g., "iPhone 16 Pro")
- `sku` - Stock Keeping Unit, must be unique (e.g., "IPHONE-16-PRO")
- `price` - Product price in MAD (e.g., 8999)
- `category_slug` - Category identifier: `iphone`, `android`, or `accessories`
- `stock` - Available stock quantity (e.g., 50)

### Optional Columns

- `description` - Full product description
- `short_description` - Brief product description (max 500 chars)
- `brand` - Brand name (e.g., "Apple", "Samsung")
- `compare_at_price` - Original price for sale items
- `cost_price` - Cost price (for admin use)
- `weight` - Product weight in kg
- `is_featured` - Set to `true` or `1` to feature the product
- `specifications` - JSON string with product specs (see examples below)

### Image Columns

You can use either image URLs or local file paths:

**Option 1: Image URLs** (recommended for online images)
- `image_url_1` - Primary image URL
- `image_url_2` - Second image URL
- `image_url_3` - Third image URL
- ... (add as many as needed)

**Option 2: Local File Paths** (for images on your computer)
- `image_path_1` - Path to local image file
- `image_path_2` - Path to second image
- ... (add as many as needed)

## Examples

### Example 1: Simple Product with URL Images

```csv
name,sku,price,category_slug,stock,brand,image_url_1
iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,https://example.com/iphone.jpg
```

### Example 2: Complete Product with Multiple Images

```csv
name,sku,price,category_slug,stock,brand,description,short_description,compare_at_price,is_featured,image_url_1,image_url_2,image_url_3
iPhone 16 Pro Max,IPHONE-16-PRO-MAX,10999,iphone,25,Apple,"Latest iPhone with A18 Pro chip and 6.9 inch display","Premium smartphone",11999,true,https://example.com/front.jpg,https://example.com/back.jpg,https://example.com/side.jpg
Samsung Galaxy S25 Ultra,SAMSUNG-S25-ULTRA,9999,android,30,Samsung,"Flagship Android device","Powerful smartphone",10499,true,https://example.com/s25-front.jpg,https://example.com/s25-back.jpg,
```

### Example 3: Product with Specifications (JSON)

```csv
name,sku,price,category_slug,stock,brand,specifications,image_url_1
iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,"{""storage"": ""256GB"", ""color"": ""Space Black"", ""screen_size"": ""6.3 inch""}",https://example.com/iphone.jpg
```

### Example 4: Using Local Image Files

```csv
name,sku,price,category_slug,stock,brand,image_path_1,image_path_2
iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,/path/to/images/iphone-front.jpg,/path/to/images/iphone-back.jpg
```

## Category Slugs

Use these exact values for `category_slug`:
- `iphone` - For iPhone products
- `android` - For Android smartphones
- `accessories` - For accessories (cases, chargers, etc.)

## Image Handling

### Image URLs
- Must be publicly accessible URLs (http:// or https://)
- Images will be downloaded, compressed, and uploaded to Supabase Storage
- Supported formats: JPEG, PNG, WebP
- Images are automatically compressed to < 200KB

### Local Image Paths
- Use absolute paths or paths relative to the script location
- Images will be loaded, compressed, and uploaded to Supabase Storage
- Supported formats: JPEG, PNG, WebP, GIF

## Specifications JSON Format

For products that need specifications, use JSON format:

**iPhone:**
```json
{"storage": "256GB", "color": "Space Black", "screen_size": "6.3 inch"}
```

**Android:**
```json
{"storage": "128GB", "ram": "8GB", "color": "Black", "screen_size": "6.7 inch"}
```

**Accessories:**
```json
{"type": "Case", "compatibility": ["iPhone 15", "iPhone 15 Pro"], "material": "Silicone", "color": "Black"}
```

## Excel Format

The script also supports Excel files (.xlsx or .xls). Use the same column structure as CSV:

1. Create an Excel file
2. Add headers in the first row
3. Add product data in subsequent rows
4. Save as .xlsx
5. Run: `python scripts/bulk_import_products.py products.xlsx`

## Tips

1. **SKU Uniqueness**: Each SKU must be unique. The script will skip products with duplicate SKUs.

2. **Image Compression**: All images are automatically compressed to keep file sizes small (< 200KB) while maintaining quality.

3. **Primary Image**: The first image (image_url_1 or image_path_1) is automatically set as the primary image.

4. **Error Handling**: If a product fails to import, the script will continue with the next product and show all errors at the end.

5. **Validation**: The script validates:
   - Required fields are present
   - Category exists
   - SKU is unique
   - Price and stock are valid numbers

## Troubleshooting

### "Category not found"
- Make sure you're using the correct category slug: `iphone`, `android`, or `accessories`
- Check that categories exist in your database

### "SKU already exists"
- Each SKU must be unique
- Check your existing products or use a different SKU

### "Image not found"
- For URLs: Make sure the URL is publicly accessible
- For local paths: Use absolute paths or check the file exists

### "Failed to upload image"
- Check your Supabase Storage bucket exists
- Verify you have proper permissions
- Check your internet connection for URL downloads

## Template File

A template CSV file is available at `backend/scripts/products_template.csv` - use it as a starting point!

## Advanced Usage

### Batch Processing
You can process multiple files:
```bash
python scripts/bulk_import_products.py products1.csv
python scripts/bulk_import_products.py products2.csv
```

### Combining with Image Generation
If you don't have images ready, you can:
1. Import products without images first
2. Run `add_product_images.py` to generate placeholder images for products without images
