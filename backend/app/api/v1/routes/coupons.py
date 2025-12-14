"""Coupon routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.api.v1.deps import get_db, get_current_user_optional
from app.schemas.coupon import (
    CouponValidationRequest,
    CouponValidationResponse,
    Coupon
)
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from app.services.coupon_service import CouponService
from supabase import Client
from decimal import Decimal

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("/{code}", response_model=CouponValidationResponse)
@rate_limit("60/minute")
async def validate_coupon(
    request: Request,
    code: str,
    order_amount: float,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Validate a coupon code.
    
    Returns:
        Coupon validation result
    """
    coupon_service = CouponService(db)
    
    try:
        result = coupon_service.validate_coupon(
            code=code,
            user_id=current_user.id if current_user else None,
            order_amount=Decimal(str(order_amount))
        )
        
        return CouponValidationResponse(
            valid=result["valid"],
            coupon=Coupon(**result["coupon"]) if result.get("coupon") else None,
            discount_amount=result["discount_amount"],
            message=result.get("message")
        )
    except NotFoundError:
        return CouponValidationResponse(
            valid=False,
            coupon=None,
            discount_amount=None,
            message="Coupon not found"
        )
    except ValueError as e:
        return CouponValidationResponse(
            valid=False,
            coupon=None,
            discount_amount=None,
            message=str(e)
        )


@router.post("/apply", response_model=CouponValidationResponse)
@rate_limit("60/minute")
async def apply_coupon(
    http_request: Request,
    request: CouponValidationRequest,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Apply a coupon to calculate discount.
    
    Returns:
        Coupon application result with discount amount
    """
    coupon_service = CouponService(db)
    
    try:
        result = coupon_service.validate_coupon(
            code=request.code,
            user_id=current_user.id if current_user else None,
            order_amount=request.order_amount
        )
        
        return CouponValidationResponse(
            valid=result["valid"],
            coupon=Coupon(**result["coupon"]) if result.get("coupon") else None,
            discount_amount=result["discount_amount"],
            message=result.get("message")
        )
    except NotFoundError:
        return CouponValidationResponse(
            valid=False,
            coupon=None,
            discount_amount=None,
            message="Coupon not found"
        )
    except ValueError as e:
        return CouponValidationResponse(
            valid=False,
            coupon=None,
            discount_amount=None,
            message=str(e)
        )

