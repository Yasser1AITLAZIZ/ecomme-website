-- Create contact_leads table for managing contact form submissions
CREATE TABLE IF NOT EXISTS contact_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
    converted_to_user_id UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_email ON contact_leads(email);
CREATE INDEX IF NOT EXISTS idx_contact_leads_converted_to_user ON contact_leads(converted_to_user_id) WHERE converted_to_user_id IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_contact_leads_updated_at
    BEFORE UPDATE ON contact_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_leads_updated_at();
