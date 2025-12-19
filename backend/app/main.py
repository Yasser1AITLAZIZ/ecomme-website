"""FastAPI app entry point with middleware setup."""
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from app.config import settings
from app.core.logging import setup_logging
from app.middleware.security import SecurityHeadersMiddleware, RequestValidationMiddleware, setup_cors
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.api.health import router as health_router

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="Secure REST API backend for e-commerce platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware (order matters!)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestValidationMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(health_router)

# Include v1 API routers
from app.api.v1.routes import (
    auth,
    products,
    cart,
    orders,
    addresses,
    coupons,
    wishlist,
    shipping,
    images,
    contact,
    delivery_fees
)

# Include admin routers
from app.api.v1.routes.admin import (
    analytics as admin_analytics,
    users as admin_users,
    orders as admin_orders,
    categories as admin_categories,
    settings as admin_settings,
    audit as admin_audit,
    security as admin_security,
    leads as admin_leads,
    products as admin_products,
    notifications as admin_notifications,
    delivery_fees as admin_delivery_fees
)

app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(products.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(cart.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(orders.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(addresses.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(coupons.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(wishlist.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(shipping.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(images.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(contact.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(delivery_fees.router, prefix=f"/api/{settings.API_VERSION}")

# Include admin routers
app.include_router(admin_analytics.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_users.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_orders.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_categories.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_products.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_settings.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_audit.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_security.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_leads.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_notifications.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin_delivery_fees.router, prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

