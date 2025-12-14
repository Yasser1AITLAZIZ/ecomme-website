-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users view own profile" ON user_profiles;
CREATE POLICY "Users view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
CREATE POLICY "Users update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins full access profiles" ON user_profiles;
CREATE POLICY "Admins full access profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User Addresses Policies
DROP POLICY IF EXISTS "Users manage own addresses" ON user_addresses;
CREATE POLICY "Users manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users create own orders" ON orders;
CREATE POLICY "Users create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins full access orders" ON orders;
CREATE POLICY "Admins full access orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Order Items Policies
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
CREATE POLICY "Users view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Admins full access order items" ON order_items;
CREATE POLICY "Admins full access order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Cart Items Policies
DROP POLICY IF EXISTS "Users manage own cart" ON cart_items;
CREATE POLICY "Users manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Wishlists Policies
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlists;
CREATE POLICY "Users manage own wishlist" ON wishlists
    FOR ALL USING (auth.uid() = user_id);

-- Products Policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins full access products" ON products;
CREATE POLICY "Admins full access products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Product Images Policies
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.is_active = true 
            AND products.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins full access product images" ON product_images;
CREATE POLICY "Admins full access product images" ON product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Categories Policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins full access categories" ON categories;
CREATE POLICY "Admins full access categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Shipping Methods Policies
DROP POLICY IF EXISTS "Anyone can view active shipping methods" ON shipping_methods;
CREATE POLICY "Anyone can view active shipping methods" ON shipping_methods
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins full access shipping methods" ON shipping_methods;
CREATE POLICY "Admins full access shipping methods" ON shipping_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Coupons Policies
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (
        is_active = true 
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at >= NOW())
    );

DROP POLICY IF EXISTS "Admins full access coupons" ON coupons;
CREATE POLICY "Admins full access coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Payments Policies
DROP POLICY IF EXISTS "Users view own payments" ON payments;
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = payments.order_id 
            AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins full access payments" ON payments;
CREATE POLICY "Admins full access payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit Logs Policies (Admin only)
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;
CREATE POLICY "Admins view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Security Logs Policies (Admin only)
DROP POLICY IF EXISTS "Admins view security logs" ON security_logs;
CREATE POLICY "Admins view security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System Settings Policies (Admin only)
DROP POLICY IF EXISTS "Admins manage system settings" ON system_settings;
CREATE POLICY "Admins manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

