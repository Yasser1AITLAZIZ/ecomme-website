# E-commerce Backend API

Secure REST API backend built with FastAPI and Supabase for the e-commerce platform.

## Features

- **Security**: Comprehensive security measures including RLS policies, input sanitization, rate limiting
- **Authentication**: Supabase Auth integration with JWT tokens
- **Payment**: Stripe integration with COD (Cash on Delivery) support
- **Features**: Products, Orders, Cart, Coupons, Wishlist, Shipping methods
- **Monitoring**: Health checks, audit logging, security event tracking
- **Admin Dashboard**: API endpoints for admin dashboard

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

3. Set up Supabase:
   - Create a Supabase project
   - Run migrations from `supabase/migrations/` in order
   - Configure RLS policies
   - Set up Storage bucket for product images

4. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── core/           # Core utilities (security, logging, etc.)
│   ├── middleware/     # Middleware components
│   ├── schemas/        # Pydantic schemas
│   ├── api/            # API routes
│   └── services/       # Business logic services
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Supabase Edge Functions
└── tests/              # Test suite
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development

Run tests:
```bash
pytest
```

Run with hot reload:
```bash
uvicorn app.main:app --reload
```

