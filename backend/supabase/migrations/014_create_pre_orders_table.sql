-- Create pre_orders table for managing device pre-orders
-- This table stores customer pre-order requests for iPhone/Android devices

CREATE TABLE IF NOT EXISTS pre_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('iphone', 'android')),
    device_model VARCHAR(100) NOT NULL,
    storage_capacity VARCHAR(20) NOT NULL,
    color VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'completed', 'cancelled')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pre_order_status ON pre_orders(status);
CREATE INDEX IF NOT EXISTS idx_pre_order_created_at ON pre_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_order_email ON pre_orders(email);
CREATE INDEX IF NOT EXISTS idx_pre_order_device_type ON pre_orders(device_type);
CREATE INDEX IF NOT EXISTS idx_pre_order_user_id ON pre_orders(user_id) WHERE user_id IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pre_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_pre_order_updated_at
    BEFORE UPDATE ON pre_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_pre_order_updated_at();

-- Enable Row Level Security
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit pre-orders
CREATE POLICY "Anyone can submit pre-orders" ON pre_orders
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Users can view their own pre-orders (by user_id or email)
CREATE POLICY "Users view own pre-orders" ON pre_orders
    FOR SELECT
    TO authenticated
    USING (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        (user_id IS NULL AND email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        ))
    );

-- Policy: Admins have full access
CREATE POLICY "Admins full access pre-orders" ON pre_orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE pre_orders IS 'Stores customer pre-order requests for iPhone/Android devices';
COMMENT ON COLUMN pre_orders.device_type IS 'Device type: iphone or android';
COMMENT ON COLUMN pre_orders.status IS 'Status: pending, notified, completed, cancelled';
COMMENT ON COLUMN pre_orders.user_id IS 'User ID of the authenticated user who submitted the pre-order (nullable for guest requests)';

