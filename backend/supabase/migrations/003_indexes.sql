-- Additional indexes for performance optimization

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_featured ON products(category_id, is_featured, is_active) 
    WHERE deleted_at IS NULL AND is_featured = true;

CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC) 
    WHERE status IN ('pending', 'processing');

-- Full text search indexes (if needed)
-- CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_coupons_active_expires ON coupons(is_active, expires_at) 
    WHERE is_active = true AND (expires_at IS NULL OR expires_at >= NOW());

CREATE INDEX IF NOT EXISTS idx_shipping_methods_active_zones ON shipping_methods(is_active, zones) 
    WHERE is_active = true;

-- Indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders(DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_date ON audit_logs(DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_security_logs_created_date ON security_logs(DATE(created_at));

