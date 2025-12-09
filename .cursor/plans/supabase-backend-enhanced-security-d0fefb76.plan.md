<!-- d0fefb76-bf80-47fe-92c6-cfb6cefa16ed 98ad0540-c1c1-42ae-a898-4becd7300a06 -->
# E-commerce Backend Development Plan (Supabase) - Enhanced Security & Features

## Overview

Build a complete, secure REST API backend using Python FastAPI and Supabase with comprehensive security measures, improved database schema, and additional business features. This enhanced version addresses critical security gaps, implements Row Level Security (RLS) policies, adds missing features (coupons, wishlist, shipping methods), and includes proper monitoring and error handling.

## Technology Stack

- **Backend Framework**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT tokens)
- **Image Storage**: Supabase Storage
- **Payment :** we will be providing a redirection to a prebuiled link for paiement for the customer for delivery paiement. Any other paiement is to be done with COD cash on delivery.
- **Rate Limiting**: slowapi (FastAPI rate limiting)
- **Security**: bleach (input sanitization), security headers middleware
- **API Documentation**: FastAPI auto-generated Swagger/OpenAPI docs
- **Logging**: Structured logging with security event tracking
- **Cache**: Redis (optional, for Phase 2)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point with middleware setup
│   ├── config.py               # Configuration settings (Pydantic Settings)
│   ├── database.py             # Supabase client initialization
│   │
│   ├── core/                   # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py          # Security utilities (sanitization, UUID validation, CSRF)
│   │   ├── permissions.py      # Role-based access control
│   │   ├── rate_limit.py       # Rate limiting configuration
│   │   ├── validators.py       # JSON schema validators for product specs
│   │   ├── exceptions.py       # Custom exception classes
│   │   └── logging.py          # Structured logging configuration
│   │
│   ├── middleware/             # Middleware components
│   │   ├── __init__.py
│   │   ├── security.py         # Security headers, CORS, request validation
│   │   ├── rate_limit.py       # Rate limiting middleware
│   │   ├── request_id.py       # Request ID tracking for traceability
│   │   └── error_handler.py   # Global error handling
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── cart.py
│   │   ├── payment.py
│   │   ├── coupon.py           # NEW: Coupon schemas
│   │   ├── wishlist.py         # NEW: Wishlist schemas
│   │   ├── shipping.py         # NEW: Shipping method schemas
│   │   └── audit.py
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (auth, supabase client, role checks)
│   │   ├── v1/                 # API versioning
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── products.py
│   │   │   │   ├── cart.py
│   │   │   │   ├── orders.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── addresses.py
│   │   │   │   ├── coupons.py      # NEW
│   │   │   │   ├── wishlist.py     # NEW
│   │   │   │   └── shipping.py     # NEW
│   │   │   └── deps.py
│   │   └── health.py           # Health check endpoints
│   │
│   └── services/               # Business logic services
│       ├── __init__.py
│       ├── product_service.py
│       ├── order_service.py
│       ├── cart_service.py
│       ├── payment_service.py
│       ├── stock_service.py    # Stock reservation and management
│       ├── audit_service.py    # Audit logging
│       ├── coupon_service.py   # NEW: Coupon validation and application
│       └── security_service.py # NEW: Security event logging
│
├── supabase/
│   ├── migrations/             # SQL migration files for Supabase
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_indexes.sql
│   └── functions/              # Supabase Edge Functions
│       ├── cleanup-reservations/
│       ├── order-notifications/
│       └── security-alerts/
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_security.py
│   │   ├── test_validators.py
│   │   └── test_services.py
│   ├── integration/
│   │   ├── test_api_endpoints.py
│   │   └── test_auth.py
│   └── security/
│       ├── test_rls_policies.py
│       └── test_rate_limiting.py
│
├── scripts/
│   ├── seed.py                 # Database seeding
│   └── migrate.py              # Migration runner
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema (Enhanced)

### Categories Table (NEW - Normalized)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

### User Profiles Table (Enhanced)

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

### Products Table (Enhanced)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'MAD',
    category_id UUID REFERENCES categories(id),
    brand VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved_stock INTEGER DEFAULT 0 CHECK (reserved_stock >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    specifications JSONB DEFAULT '{}',
    meta_title VARCHAR(255),
    meta_description TEXT,
    weight DECIMAL(8,2),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_active ON products(is_active, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id, is_active);
CREATE INDEX idx_products_featured ON products(is_featured, is_active) WHERE is_featured = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
```

### Shipping Methods Table (NEW)

```sql
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    zones TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipping_methods_active ON shipping_methods(is_active);
```

### Orders Table (Enhanced)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_intent_id VARCHAR(255),
    shipping_method_id UUID REFERENCES shipping_methods(id),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    admin_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

### Order Status History Table (NEW)

```sql
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id, created_at DESC);
```

### Coupons Table (NEW)

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, expires_at);
```

### Coupon Usage Table (NEW)

```sql
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES auth.users(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_id, order_id)
);

CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);
```

### Wishlists Table (NEW)

```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
```

### Security Logs Table (NEW - Critical)

```sql
CREATE TABLE security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET NOT NULL,
    user_agent TEXT,
    endpoint TEXT,
    request_data JSONB,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_logs_ip ON security_logs(ip_address, created_at DESC);
CREATE INDEX idx_security_logs_user ON security_logs(user_id, created_at DESC);
CREATE INDEX idx_security_logs_event ON security_logs(event_type, created_at DESC);
CREATE INDEX idx_security_logs_severity ON security_logs(severity, created_at DESC);
```

### Other Tables

- `user_addresses` (as in original plan)
- `product_images` (as in original plan)
- `order_items` (as in original plan)
- `cart_items` (as in original plan)
- `stock_reservations` (as in original plan)
- `payments` (enhanced with currency support)
- `audit_logs` (as in original plan)

## Security Implementation

### 1. Security Headers Middleware

File: `app/middleware/security.py`

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }
```

### 2. Input Sanitization

File: `app/core/security.py`

- Use `bleach` library to sanitize all string inputs
- Validate UUID format strictly before database queries
- Block dangerous patterns (script tags, javascript:, etc.)
- Log suspicious inputs to `security_logs` table

### 3. Row Level Security (RLS) Policies

File: `supabase/migrations/002_rls_policies.sql`

**Critical Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only view/update own profile
CREATE POLICY "Users view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can only view own orders
CREATE POLICY "Users view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can only manage own cart
CREATE POLICY "Users manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Products visible to all (read-only for non-admins)
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Admin policies (check role in user_profiles)
CREATE POLICY "Admins full access products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### 4. Request Validation Middleware

- Block suspicious User-Agents (sqlmap, nikto, nmap)
- Limit request body size (10MB max)
- Validate content-type headers
- Log blocked requests to security_logs

### 5. Rate Limiting

Enhanced rate limits:

- Order creation: 5/minute per user
- Login attempts: 10/hour per IP
- Product creation: 20/hour per admin
- Coupon validation: 30/minute per IP
- General API: 100/minute per IP
- Health checks: 1000/minute per IP

## API Endpoints (Versioned)

All endpoints under `/api/v1/`:

### Health Checks (`/api/health`)

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health (DB, storage, etc.)

### Authentication (`/api/v1/auth`)

- `GET /api/v1/auth/me` - Get current user (verify Supabase JWT)
- `POST /api/v1/auth/refresh` - Refresh token (optional)

### Products (`/api/v1/products`)

- `GET /api/v1/products` - List products (pagination, filters, search)
- `GET /api/v1/products/{id_or_slug}` - Get product by ID or slug
- `GET /api/v1/products/category/{category_slug}` - Get by category
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/search?q={query}` - Search products
- `GET /api/v1/products/{id}/related` - Get related products
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/{id}` - Update product (Admin only)
- `DELETE /api/v1/products/{id}` - Soft delete product (Admin only)

### Cart (`/api/v1/cart`)

- `POST /api/v1/cart/sync` - Sync cart (server precedence)
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/{item_id}` - Update cart item
- `DELETE /api/v1/cart/items/{item_id}` - Remove cart item
- `DELETE /api/v1/cart` - Clear cart

### Orders (`/api/v1/orders`)

- `POST /api/v1/orders` - Create order (with stock reservation)
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/{id}` - Get order by ID
- `GET /api/v1/orders/{id}/items` - Get order items
- `PUT /api/v1/orders/{id}/status` - Update status (Admin only)
- `POST /api/v1/orders/{id}/cancel` - Cancel order

### Payments (`/api/v1/payments`)

- `POST /api/v1/payments/create-intent` - Create Stripe payment intent
- `POST /api/v1/payments/webhook` - Stripe webhook (signature verified)
- `GET /api/v1/payments/{payment_intent_id}` - Get payment status

### Coupons (`/api/v1/coupons`) - NEW

- `GET /api/v1/coupons/validate?code={code}` - Validate coupon code
- `GET /api/v1/coupons` - List active coupons (Admin only)
- `POST /api/v1/coupons` - Create coupon (Admin only)
- `PUT /api/v1/coupons/{id}` - Update coupon (Admin only)
- `DELETE /api/v1/coupons/{id}` - Delete coupon (Admin only)

### Wishlist (`/api/v1/wishlist`) - NEW

- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/wishlist/items` - Add product to wishlist
- `DELETE /api/v1/wishlist/items/{product_id}` - Remove from wishlist

### Shipping (`/api/v1/shipping`) - NEW

- `GET /api/v1/shipping/methods` - Get available shipping methods
- `GET /api/v1/shipping/calculate` - Calculate shipping cost

### Users (`/api/v1/users`)

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users/me/addresses` - Get user addresses
- `POST /api/v1/users/me/addresses` - Add address
- `PUT /api/v1/users/me/addresses/{address_id}` - Update address
- `DELETE /api/v1/users/me/addresses/{address_id}` - Delete address

### Images (`/api/v1/images`)

- `POST /api/v1/images/upload` - Upload product image (Admin only)
- `DELETE /api/v1/images/{image_id}` - Delete image (Admin only)

## Implementation Phases

### Phase 1: Security Foundations (Week 1-2)

1. Set up project structure with middleware folder
2. Implement security headers middleware
3. Implement input sanitization utilities
4. Create security_logs table and logging service
5. Implement request validation middleware
6. Set up structured logging
7. Create custom exception classes

### Phase 2: Database Schema & RLS (Week 2-3)

1. Create all database tables with enhanced schema
2. Create indexes for performance
3. Implement comprehensive RLS policies
4. Test RLS policies with different user roles
5. Create database migration scripts

### Phase 3: Core API with Security (Week 3-4)

1. Implement API versioning (`/api/v1/`)
2. Create health check endpoints
3. Implement authentication dependencies with security checks
4. Implement product endpoints with input sanitization
5. Implement cart endpoints with stock validation
6. Implement order endpoints with stock reservation

### Phase 4: Payment & Additional Features (Week 4-5)

1. Implement Stripe payment integration
2. Implement COD (Cash on Delivery) support
3. Implement coupon system
4. Implement wishlist functionality
5. Implement shipping methods

### Phase 5: Testing & Documentation (Week 5-6)

1. Write unit tests for security utilities
2. Write integration tests for API endpoints
3. Test RLS policies
4. Test rate limiting
5. Document API endpoints
6. Create deployment guide

## Environment Variables

```env
# App
APP_NAME=PrimoStore
APP_ENV=development
DEBUG=false
API_VERSION=v1
SECRET_KEY=your-super-secret-key-min-32-chars

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_STORAGE_BUCKET=product-images

# CORS
ALLOWED_ORIGINS=https://ecomme-website.vercel.app,http://localhost:3000

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTH=10/hour

# Security
ENABLE_SECURITY_HEADERS=true
MAX_REQUEST_SIZE_MB=10
BLOCKED_IPS=

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Payment
SUPPORT_COD=true  # Cash on Delivery support
```

## Dependencies

```txt
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
supabase>=2.0.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-multipart>=0.0.6
python-dotenv>=1.0.0
stripe>=7.0.0
slowapi>=0.1.9
jsonschema>=4.20.0
bleach>=6.1.0
structlog>=23.2.0
```

## Security Checklist

- [x] Security headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- [x] Input sanitization with bleach
- [x] UUID validation before database queries
- [x] Row Level Security (RLS) policies on all tables
- [x] Rate limiting per IP and user
- [x] Security event logging
- [x] Request validation middleware
- [x] CORS configuration
- [x] Audit logging for admin actions
- [x] Health check endpoints
- [x] API versioning
- [x] Structured logging

## Testing Strategy

1. **Unit Tests**: Security utilities, validators, services
2. **Integration Tests**: API endpoints with authentication
3. **Security Tests**: RLS policies, rate limiting, input sanitization
4. **Load Tests**: Stock reservation race conditions
5. **Payment Tests**: Webhook handling, payment intent creation

## Migration Strategy

1. Create Supabase project
2. Run migration files in order (001, 002, 003)
3. Set up Supabase Storage bucket
4. Configure RLS policies
5. Create admin user in Supabase Auth
6. Seed database with sample data
7. Set up Stripe account
8. Configure environment variables
9. Deploy backend
10. Test end-to-end flow

## Admin Dashboard & Monitoring

### Dashboard Architecture

Le dashboard d'administration sera une application Next.js séparée qui consomme les API du backend FastAPI. Il permettra de monitorer et gérer tous les aspects du site e-commerce.

### Structure du Dashboard

```
admin-dashboard/                    # Application Next.js séparée
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # Vue d'ensemble avec statistiques
│   │   │   │   └── components/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Liste des produits
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx   # Édition produit
│   │   │   │   └── new/
│   │   │   │       └── page.tsx   # Création produit
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx       # Liste des commandes
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Détails commande
│   │   │   ├── users/
│   │   │   │   ├── page.tsx       # Liste des utilisateurs
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Détails utilisateur
│   │   │   ├── coupons/
│   │   │   │   └── page.tsx       # Gestion des coupons
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx       # Analytics et rapports
│   │   │   ├── security/
│   │   │   │   └── page.tsx       # Logs de sécurité
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # Paramètres système
│   │   │   └── monitoring/
│   │   │       └── page.tsx       # Monitoring DB et système
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── TopProducts.tsx
│   │   ├── products/
│   │   ├── orders/
│   │   └── charts/
│   ├── lib/
│   │   ├── api/
│   │   │   └── admin.ts           # Client API pour endpoints admin
│   │   └── utils/
│   └── types/
└── package.json
```

### API Endpoints Admin (Nouveaux)

Tous les endpoints admin nécessitent le rôle `admin`:

#### Analytics & Statistiques (`/api/v1/admin/analytics`)

- `GET /api/v1/admin/analytics/overview` - Vue d'ensemble (revenus, commandes, utilisateurs)
- `GET /api/v1/admin/analytics/sales?period={day|week|month|year}` - Statistiques de ventes
- `GET /api/v1/admin/analytics/products` - Top produits vendus
- `GET /api/v1/admin/analytics/revenue?start_date={date}&end_date={date}` - Revenus par période
- `GET /api/v1/admin/analytics/orders/status` - Répartition des commandes par statut
- `GET /api/v1/admin/analytics/users/growth` - Croissance des utilisateurs

#### Gestion des Produits (`/api/v1/admin/products`)

- `GET /api/v1/admin/products` - Liste complète (inclut produits supprimés)
- `GET /api/v1/admin/products/low-stock` - Produits en rupture de stock
- `POST /api/v1/admin/products/bulk-update` - Mise à jour en masse
- `POST /api/v1/admin/products/import` - Import CSV de produits
- `GET /api/v1/admin/products/export` - Export CSV

#### Gestion des Commandes (`/api/v1/admin/orders`)

- `GET /api/v1/admin/orders` - Toutes les commandes (avec filtres avancés)
- `GET /api/v1/admin/orders/pending` - Commandes en attente
- `PUT /api/v1/admin/orders/{id}/status` - Changer le statut
- `POST /api/v1/admin/orders/{id}/notes` - Ajouter note admin
- `GET /api/v1/admin/orders/export` - Export CSV des commandes

#### Gestion des Utilisateurs (`/api/v1/admin/users`)

- `GET /api/v1/admin/users` - Liste tous les utilisateurs
- `GET /api/v1/admin/users/{id}` - Détails utilisateur
- `PUT /api/v1/admin/users/{id}/role` - Changer le rôle (admin/customer)
- `GET /api/v1/admin/users/{id}/orders` - Commandes d'un utilisateur
- `POST /api/v1/admin/users` - Créer utilisateur (admin)

#### Monitoring & Sécurité (`/api/v1/admin/monitoring`)

- `GET /api/v1/admin/monitoring/system` - Santé du système (DB, storage, API)
- `GET /api/v1/admin/monitoring/database` - Stats de la base de données
- `GET /api/v1/admin/monitoring/security/logs` - Logs de sécurité
- `GET /api/v1/admin/monitoring/security/events` - Événements de sécurité récents
- `GET /api/v1/admin/monitoring/rate-limits` - Statistiques de rate limiting
- `GET /api/v1/admin/monitoring/audit-logs` - Logs d'audit complets

#### Gestion des Coupons (`/api/v1/admin/coupons`)

- `GET /api/v1/admin/coupons` - Tous les coupons
- `GET /api/v1/admin/coupons/{id}/usage` - Utilisation d'un coupon
- `POST /api/v1/admin/coupons/generate` - Générer coupons en masse

#### Paramètres Système (`/api/v1/admin/settings`)

- `GET /api/v1/admin/settings` - Récupérer paramètres
- `PUT /api/v1/admin/settings` - Mettre à jour paramètres
- `GET /api/v1/admin/settings/shipping` - Paramètres de livraison
- `PUT /api/v1/admin/settings/shipping` - Mettre à jour livraison

### Schéma de Base de Données pour Dashboard

#### System Settings Table (NEW)

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
```

### Fonctionnalités du Dashboard

#### 1. Vue d'Ensemble (Dashboard Home)

- **Statistiques en temps réel:**
  - Revenus du jour/semaine/mois
  - Nombre de commandes
  - Nouveaux utilisateurs
  - Produits en rupture de stock

- **Graphiques:**
  - Évolution des ventes (ligne)
  - Répartition par catégorie (camembert)
  - Top 10 produits (barre)
  - Commandes par statut

- **Activité récente:**
  - Dernières commandes
  - Nouveaux utilisateurs
  - Alertes de sécurité

#### 2. Gestion des Produits

- Liste avec recherche et filtres
- Création/Édition avec upload d'images
- Gestion du stock (alertes si stock faible)
- Import/Export CSV
- Gestion des catégories

#### 3. Gestion des Commandes

- Liste avec filtres (statut, date, montant)
- Détails complets d'une commande
- Changement de statut avec historique
- Notes admin
- Export CSV
- Impression facture

#### 4. Gestion des Utilisateurs

- Liste des utilisateurs
- Détails utilisateur (commandes, adresses)
- Changement de rôle
- Création utilisateur admin

#### 5. Analytics & Rapports

- Rapports de ventes personnalisables
- Analyse des produits (meilleurs vendeurs)
- Analyse des clients (CLV, commandes moyennes)
- Export de rapports (PDF, CSV)

#### 6. Monitoring de Sécurité

- Logs de sécurité en temps réel
- Tentatives d'intrusion
- Rate limiting violé
- Activité suspecte par IP
- Alertes de sécurité

#### 7. Monitoring Système

- Santé de la base de données
- Espace disque Supabase Storage
- Performance API (temps de réponse)
- Taux d'erreur
- Utilisation des ressources

#### 8. Gestion des Coupons

- Liste des coupons
- Création/Édition
- Statistiques d'utilisation
- Génération en masse

### Implémentation Backend pour Dashboard

#### Service Analytics

File: `app/services/analytics_service.py`

```python
class AnalyticsService:
    async def get_overview(self, period: str = "month"):
        # Retourne revenus, commandes, utilisateurs pour la période
        pass
    
    async def get_sales_stats(self, start_date, end_date):
        # Statistiques de ventes détaillées
        pass
    
    async def get_top_products(self, limit: int = 10):
        # Top produits par quantité vendue
        pass
```

#### Service Monitoring

File: `app/services/monitoring_service.py`

```python
class MonitoringService:
    async def get_system_health(self):
        # Vérifie DB, Storage, API
        return {
            "database": "healthy",
            "storage": "healthy",
            "api": "healthy"
        }
    
    async def get_database_stats(self):
        # Taille DB, nombre de tables, etc.
        pass
    
    async def get_security_events(self, limit: int = 100):
        # Récupère les événements de sécurité récents
        pass
```

### Sécurité du Dashboard

- **Authentification:** Supabase Auth avec rôle `admin` requis
- **Rate Limiting:** Limites plus élevées pour les admins (500/minute)
- **Audit Logging:** Toutes les actions admin sont loggées
- **IP Whitelisting:** Optionnel - limiter l'accès admin à certaines IPs
- **2FA:** Recommandé pour les comptes admin (à implémenter en Phase 2)

### Phase d'Implémentation Dashboard

#### Phase 6: Admin Dashboard API (Week 6-7)

1. Créer endpoints analytics
2. Créer endpoints monitoring
3. Créer endpoints admin pour produits/commandes/utilisateurs
4. Implémenter services analytics et monitoring
5. Créer table system_settings

#### Phase 7: Admin Dashboard Frontend (Week 7-8)

1. Créer application Next.js admin-dashboard
2. Implémenter authentification admin
3. Créer composants dashboard (stats, graphiques)
4. Implémenter pages de gestion (produits, commandes, utilisateurs)
5. Implémenter monitoring et sécurité
6. Ajouter export CSV/PDF

## Frontend Integration Notes

1. Use Supabase Auth client for authentication
2. Send JWT token in `Authorization: Bearer <token>` header
3. Handle API versioning (`/api/v1/`)
4. Integrate coupon validation in checkout
5. Add wishlist functionality
6. Support COD payment method
7. Use Supabase Storage URLs for images
8. Handle cart sync on login
9. **Admin Dashboard:** Separate Next.js app consuming admin API endpoints

### To-dos

- [ ] Before creating the backend projet strucutre reorganise and wrappe the code of frontend existing in this repository to have a structured backend/frontend folder