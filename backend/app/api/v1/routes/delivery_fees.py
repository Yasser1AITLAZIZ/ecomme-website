"""Delivery fees routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import Dict, Any
from app.api.v1.deps import get_db
from app.core.rate_limit import rate_limit
from app.services.delivery_fee_service import DeliveryFeeService
from supabase import Client

router = APIRouter(prefix="/delivery-fees", tags=["Delivery Fees"])


@router.get("/calculate")
@rate_limit("100/minute")
async def calculate_delivery_fee(
    request: Request,
    order_total: float = Query(..., description="Order total amount"),
    db: Client = Depends(get_db)
):
    """
    Calculate delivery fee for an order total (public endpoint).
    
    Returns:
        Delivery fee calculation result
    """
    try:
        service = DeliveryFeeService(db)
        result = service.calculate_delivery_fee(order_total)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate delivery fee: {str(e)}"
        )


@router.get("/default")
@rate_limit("100/minute")
async def get_default_delivery_fee(
    request: Request,
    db: Client = Depends(get_db)
):
    """
    Get default delivery fee information for display (public endpoint).
    
    Returns:
        Default fee information
    """
    try:
        service = DeliveryFeeService(db)
        result = service.get_default_fee_display()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get default fee: {str(e)}"
        )

