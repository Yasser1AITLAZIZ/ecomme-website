-- Add delivery_type column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'delivery' 
CHECK (delivery_type IN ('pickup', 'delivery'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON orders(delivery_type);

-- Update existing orders to have 'delivery' as default (already set by DEFAULT clause)
-- This is just for documentation purposes

