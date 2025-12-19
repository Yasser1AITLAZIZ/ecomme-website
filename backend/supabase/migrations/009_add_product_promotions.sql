-- Add promotion fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS promo_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS promo_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promo_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_promo_active BOOLEAN DEFAULT false;

-- Add check constraint: promo_price must be less than price when set
ALTER TABLE products
ADD CONSTRAINT check_promo_price_valid 
CHECK (promo_price IS NULL OR promo_price < price);

-- Add check constraint: promo_end_date must be after promo_start_date when both are set
ALTER TABLE products
ADD CONSTRAINT check_promo_dates_valid 
CHECK (
    promo_start_date IS NULL OR 
    promo_end_date IS NULL OR 
    promo_end_date > promo_start_date
);

-- Add index for active promotions
CREATE INDEX IF NOT EXISTS idx_products_promo_active 
ON products(is_promo_active, promo_start_date, promo_end_date) 
WHERE is_promo_active = true;

COMMENT ON COLUMN products.promo_price IS 'Promotional price for the product';
COMMENT ON COLUMN products.promo_start_date IS 'Start date and time for the promotion';
COMMENT ON COLUMN products.promo_end_date IS 'End date and time for the promotion';
COMMENT ON COLUMN products.is_promo_active IS 'Whether the promotion is currently active';

