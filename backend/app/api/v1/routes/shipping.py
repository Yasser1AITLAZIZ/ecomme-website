"""Shipping routes."""
from fastapi import APIRouter, Depends, Request
from typing import List
from app.api.v1.deps import get_db
from app.schemas.shipping import (
    ShippingMethod,
    ShippingCalculationRequest,
    ShippingCalculationResponse
)
from app.core.rate_limit import rate_limit
from app.services.shipping_service import ShippingService
from supabase import Client

router = APIRouter(prefix="/shipping", tags=["Shipping"])


@router.get("/methods", response_model=List[ShippingMethod])
@rate_limit("100/minute")
async def get_shipping_methods(
    request: Request,
    db: Client = Depends(get_db)
):
    """
    Get available shipping methods.
    
    Returns:
        List of shipping methods
    """
    shipping_service = ShippingService(db)
    methods = shipping_service.get_shipping_methods()
    
    return [ShippingMethod(**method) for method in methods]


@router.post("/calculate", response_model=ShippingCalculationResponse)
@rate_limit("100/minute")
async def calculate_shipping(
    http_request: Request,
    request: ShippingCalculationRequest,
    db: Client = Depends(get_db)
):
    """
    Calculate shipping cost.
    
    Returns:
        Shipping calculation result
    """
    shipping_service = ShippingService(db)
    
    result = shipping_service.calculate_shipping(
        shipping_method_id=request.shipping_method_id,
        address=request.address
    )
    
    return ShippingCalculationResponse(
        shipping_method_id=result["shipping_method_id"],
        shipping_method_name=result["shipping_method_name"],
        cost=result["cost"],
        estimated_days_min=result.get("estimated_days_min"),
        estimated_days_max=result.get("estimated_days_max")
    )

