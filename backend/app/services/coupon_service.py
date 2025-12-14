"""Coupon service for validating and applying coupons."""
from typing import Optional, Dict
from decimal import Decimal
from datetime import datetime
from supabase import Client
from app.database import get_supabase_client
from app.core.exceptions import NotFoundError


class CouponService:
    """Service for coupon operations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize coupon service."""
        self.db = db or get_supabase_client()
    
    def validate_coupon(self, code: str, user_id: Optional[str], order_amount: Decimal) -> Dict:
        """
        Validate coupon code.
        
        Args:
            code: Coupon code
            user_id: User ID (optional, for usage limit checking)
            order_amount: Order amount
            
        Returns:
            Validation result with discount amount
            
        Raises:
            NotFoundError: If coupon not found
            ValueError: If coupon is invalid
        """
        # Get coupon
        response = self.db.table("coupons").select("*").eq(
            "code", code.upper().strip()
        ).eq("is_active", True).execute()
        
        if not response.data:
            raise NotFoundError("Coupon", code)
        
        coupon = response.data[0]
        
        # Check dates
        now = datetime.utcnow()
        if coupon.get("starts_at"):
            starts_at = datetime.fromisoformat(coupon["starts_at"].replace("Z", "+00:00"))
            if now < starts_at:
                raise ValueError("Coupon not yet active")
        
        if coupon.get("expires_at"):
            expires_at = datetime.fromisoformat(coupon["expires_at"].replace("Z", "+00:00"))
            if now > expires_at:
                raise ValueError("Coupon expired")
        
        # Check minimum order amount
        if coupon.get("min_order_amount"):
            min_amount = Decimal(str(coupon["min_order_amount"]))
            if order_amount < min_amount:
                raise ValueError(f"Minimum order amount not met: {min_amount}")
        
        # Check usage limit
        if coupon.get("usage_limit"):
            usage_count = coupon.get("usage_count", 0)
            if usage_count >= coupon["usage_limit"]:
                raise ValueError("Coupon usage limit reached")
        
        # Check user usage limit
        if user_id:
            user_usage = self.check_coupon_usage(user_id, coupon["id"])
            if user_usage >= 1:  # Assuming one use per user
                raise ValueError("Coupon already used by this user")
        
        # Calculate discount
        discount_amount = self.apply_coupon(order_amount, code)
        
        return {
            "valid": True,
            "coupon": coupon,
            "discount_amount": discount_amount,
            "message": None
        }
    
    def apply_coupon(self, cart_total: Decimal, coupon_code: str) -> Decimal:
        """
        Calculate discount amount for a coupon.
        
        Args:
            cart_total: Cart total amount
            coupon_code: Coupon code
            
        Returns:
            Discount amount
        """
        # Get coupon
        response = self.db.table("coupons").select("*").eq(
            "code", coupon_code.upper().strip()
        ).eq("is_active", True).execute()
        
        if not response.data:
            raise NotFoundError("Coupon", coupon_code)
        
        coupon = response.data[0]
        
        # Calculate discount
        if coupon["discount_type"] == "percentage":
            discount = cart_total * (Decimal(str(coupon["discount_value"])) / 100)
            if coupon.get("max_discount_amount"):
                max_discount = Decimal(str(coupon["max_discount_amount"]))
                discount = min(discount, max_discount)
        else:  # fixed
            discount = Decimal(str(coupon["discount_value"]))
        
        # Don't exceed cart total
        return min(discount, cart_total)
    
    def check_coupon_usage(self, user_id: str, coupon_id: str) -> int:
        """
        Check how many times a user has used a coupon.
        
        Args:
            user_id: User ID
            coupon_id: Coupon ID
            
        Returns:
            Number of times used
        """
        response = self.db.table("coupon_usages").select("*").eq(
            "user_id", user_id
        ).eq("coupon_id", coupon_id).execute()
        
        return len(response.data) if response.data else 0
    
    def record_coupon_usage(self, user_id: Optional[str], coupon_id: str, order_id: str) -> None:
        """
        Record coupon usage.
        
        Args:
            user_id: User ID (optional for guest orders)
            coupon_id: Coupon ID
            order_id: Order ID
        """
        self.db.table("coupon_usages").insert({
            "user_id": user_id,
            "coupon_id": coupon_id,
            "order_id": order_id
        }).execute()
        
        # Update coupon usage count
        coupon = self.db.table("coupons").select("usage_count").eq("id", coupon_id).execute()
        if coupon.data:
            new_count = (coupon.data[0].get("usage_count", 0) or 0) + 1
            self.db.table("coupons").update({
                "usage_count": new_count
            }).eq("id", coupon_id).execute()

