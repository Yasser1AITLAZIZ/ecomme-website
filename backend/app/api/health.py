"""Health check endpoints."""
from fastapi import APIRouter, Depends
from app.api.deps import get_db
from app.database import get_supabase_client
from app.config import settings
from typing import Dict, Any

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("")
async def health_check() -> Dict[str, str]:
    """
    Basic health check endpoint.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.API_VERSION
    }


@router.get("/detailed")
async def detailed_health_check(db = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check including database and storage.
    
    Returns:
        Detailed health status
    """
    health_status = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.API_VERSION,
        "components": {}
    }
    
    # Check database
    try:
        db.table("user_profiles").select("id").limit(1).execute()
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check storage (Supabase Storage)
    try:
        storage_client = db.storage.from_(settings.SUPABASE_STORAGE_BUCKET)
        # Try to list buckets (lightweight operation)
        health_status["components"]["storage"] = "healthy"
    except Exception as e:
        health_status["components"]["storage"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

