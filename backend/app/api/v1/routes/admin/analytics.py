"""Admin analytics routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from datetime import datetime
from app.api.v1.deps import get_db
from app.core.permissions import require_admin
from app.schemas.admin import (
    DashboardStats,
    RevenueStats,
    OrderAnalytics,
    ProductAnalytics,
    UserAnalytics
)
from app.services.analytics_service import AnalyticsService
from app.schemas.user import UserProfile
from supabase import Client

router = APIRouter(prefix="/admin/analytics", tags=["Admin - Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get main dashboard statistics.
    
    Returns:
        Dashboard statistics including revenue, orders, users, products
    """
    try:
        analytics_service = AnalyticsService(db)
        stats = analytics_service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard stats: {str(e)}"
        )


@router.get("/revenue", response_model=RevenueStats)
async def get_revenue_stats(
    period: str = Query("month", regex="^(day|week|month|year)$"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get revenue statistics for a period.
    
    Args:
        period: Period type (day, week, month, year)
        
    Returns:
        Revenue statistics with trend data
    """
    try:
        analytics_service = AnalyticsService(db)
        stats = analytics_service.get_revenue_stats(period)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch revenue stats: {str(e)}"
        )


@router.get("/orders", response_model=OrderAnalytics)
async def get_order_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get order analytics.
    
    Args:
        start_date: Start date (ISO format)
        end_date: End date (ISO format)
        
    Returns:
        Order analytics
    """
    try:
        analytics_service = AnalyticsService(db)
        
        start = None
        end = None
        
        if start_date:
            start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        if end_date:
            end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        
        analytics = analytics_service.get_order_analytics(start, end)
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order analytics: {str(e)}"
        )


@router.get("/products", response_model=ProductAnalytics)
async def get_product_analytics(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get product analytics.
    
    Returns:
        Product analytics including top products and stock alerts
    """
    try:
        analytics_service = AnalyticsService(db)
        analytics = analytics_service.get_product_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch product analytics: {str(e)}"
        )


@router.get("/users", response_model=UserAnalytics)
async def get_user_analytics(
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get user analytics.
    
    Returns:
        User analytics including growth and top customers
    """
    try:
        analytics_service = AnalyticsService(db)
        analytics = analytics_service.get_user_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user analytics: {str(e)}"
        )


@router.get("/trends")
async def get_trends(
    metric: str = Query(..., regex="^(revenue|orders|users)$"),
    period: str = Query("month", regex="^(day|week|month|year)$"),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get trend data for charts.
    
    Args:
        metric: Metric type (revenue, orders, users)
        period: Period type (day, week, month, year)
        
    Returns:
        List of trend points
    """
    try:
        analytics_service = AnalyticsService(db)
        trends = analytics_service.get_trends(metric, period)
        return {"metric": metric, "period": period, "data": trends}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trends: {str(e)}"
        )
