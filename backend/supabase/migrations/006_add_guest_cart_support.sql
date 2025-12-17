-- Add guest cart support to cart_items table
-- This migration allows carts to be stored for both authenticated users and guest sessions

-- Drop existing unique constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Make user_id nullable to support guest carts
ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_session_id column
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(255);

-- Add check constraint: either user_id OR guest_session_id must be set
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_or_guest_check 
    CHECK (
        (user_id IS NOT NULL AND guest_session_id IS NULL) OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    );

-- Add unique constraint for user_id and product_id (when user_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product 
    ON cart_items(user_id, product_id) 
    WHERE user_id IS NOT NULL;

-- Add unique constraint for guest_session_id and product_id (when guest_session_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_guest_product 
    ON cart_items(guest_session_id, product_id) 
    WHERE guest_session_id IS NOT NULL;

-- Add index for guest_session_id lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_guest_session ON cart_items(guest_session_id);

-- Update foreign key constraint to allow NULL user_id
-- Note: The existing foreign key should already allow NULL, but we ensure it's explicit
ALTER TABLE cart_items 
    DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey,
    ADD CONSTRAINT cart_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

