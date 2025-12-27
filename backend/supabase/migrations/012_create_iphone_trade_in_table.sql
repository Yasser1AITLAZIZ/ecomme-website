-- Create iphone_trade_in_requests table for managing iPhone trade-in requests
-- This table stores customer requests to trade in their iPhones

CREATE TABLE IF NOT EXISTS iphone_trade_in_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    iphone_model VARCHAR(100) NOT NULL,
    storage_capacity VARCHAR(20) NOT NULL,
    color VARCHAR(50),
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('excellent', 'very_good', 'good', 'acceptable', 'damaged')),
    imei VARCHAR(20),
    photos_urls JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    estimated_value DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trade_in_status ON iphone_trade_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_in_created_at ON iphone_trade_in_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_in_email ON iphone_trade_in_requests(email);
CREATE INDEX IF NOT EXISTS idx_trade_in_model ON iphone_trade_in_requests(iphone_model);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trade_in_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_trade_in_updated_at
    BEFORE UPDATE ON iphone_trade_in_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_trade_in_updated_at();

-- Enable Row Level Security
ALTER TABLE iphone_trade_in_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit trade-in requests
CREATE POLICY "Anyone can submit trade-in requests" ON iphone_trade_in_requests
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Users can view their own trade-in requests (by email)
CREATE POLICY "Users view own trade-in requests" ON iphone_trade_in_requests
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = iphone_trade_in_requests.email
        )
    );

-- Policy: Admins have full access
CREATE POLICY "Admins full access trade-in requests" ON iphone_trade_in_requests
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
COMMENT ON TABLE iphone_trade_in_requests IS 'Stores customer requests to trade in their iPhones';
COMMENT ON COLUMN iphone_trade_in_requests.condition IS 'Condition: excellent, very_good, good, acceptable, damaged';
COMMENT ON COLUMN iphone_trade_in_requests.status IS 'Status: pending, reviewing, approved, rejected, completed';
COMMENT ON COLUMN iphone_trade_in_requests.photos_urls IS 'JSONB array of photo URLs stored in Supabase Storage';

