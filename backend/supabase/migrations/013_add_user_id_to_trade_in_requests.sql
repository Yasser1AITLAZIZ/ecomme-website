-- Add user_id column to iphone_trade_in_requests table
-- This allows linking trade-in requests to authenticated users

-- Add user_id column (nullable to support guest requests)
ALTER TABLE iphone_trade_in_requests
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_trade_in_user_id ON iphone_trade_in_requests(user_id) WHERE user_id IS NOT NULL;

-- Update RLS policies to allow users to view their own requests by user_id
DROP POLICY IF EXISTS "Users view own trade-in requests" ON iphone_trade_in_requests;

-- New policy: Users can view their own trade-in requests (by user_id or email)
CREATE POLICY "Users view own trade-in requests" ON iphone_trade_in_requests
    FOR SELECT
    TO authenticated
    USING (
        -- Match by user_id if available
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        -- Match by email if user_id is null (for guest requests converted to user)
        (user_id IS NULL AND email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        ))
    );

-- Policy: Users can update their own trade-in requests
CREATE POLICY "Users update own trade-in requests" ON iphone_trade_in_requests
    FOR UPDATE
    TO authenticated
    USING (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        (user_id IS NULL AND email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        ))
    )
    WITH CHECK (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        (user_id IS NULL AND email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        ))
    );

-- Add comment
COMMENT ON COLUMN iphone_trade_in_requests.user_id IS 'User ID of the authenticated user who submitted the request (nullable for guest requests)';

