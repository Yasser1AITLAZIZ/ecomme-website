"""Delivery fee calculation service."""
from typing import Dict, Optional, List
from decimal import Decimal
from supabase import Client
from app.database import get_supabase_client


class DeliveryFeeService:
    """Service for calculating delivery fees based on order size."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize delivery fee service."""
        self.db = db or get_supabase_client()
    
    def get_delivery_fee_settings(self) -> Dict:
        """
        Get delivery fee settings from system_settings.
        
        Returns:
            Delivery fee configuration dict
        """
        try:
            response = self.db.table("system_settings").select("*").eq(
                "key", "delivery_fees"
            ).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get("value", {})
            
            # Return default settings if not configured
            return {
                "default_display_fee": 10.0,  # Valeur par défaut à afficher
                "default_fee_percentage": 5.0,
                "min_fee": 5.0,
                "max_fee": 50.0,
                "free_shipping_threshold": 500.0,
                "tiers": []
            }
        except Exception:
            # Return default settings on error
            return {
                "default_display_fee": 10.0,
                "default_fee_percentage": 5.0,
                "min_fee": 5.0,
                "max_fee": 50.0,
                "free_shipping_threshold": 500.0,
                "tiers": []
            }
    
    def calculate_delivery_fee(self, order_total: float) -> Dict:
        """
        Calculate delivery fee based on order total.
        
        Args:
            order_total: Total order amount (subtotal)
            
        Returns:
            Dict with fee, is_free, and tier_info
        """
        settings = self.get_delivery_fee_settings()
        order_total_decimal = Decimal(str(order_total))
        
        # Check free shipping threshold
        free_shipping_threshold = Decimal(str(settings.get("free_shipping_threshold", 500.0)))
        if order_total_decimal >= free_shipping_threshold:
            return {
                "fee": 0.0,
                "is_free": True,
                "tier_info": {
                    "reason": "free_shipping_threshold",
                    "threshold": float(free_shipping_threshold)
                }
            }
        
        # Get tiers
        tiers = settings.get("tiers", [])
        
        # Find applicable tier
        applicable_tier = None
        for tier in tiers:
            min_order = Decimal(str(tier.get("min_order", 0)))
            max_order = tier.get("max_order")
            
            if max_order is not None:
                max_order_decimal = Decimal(str(max_order))
                if min_order <= order_total_decimal < max_order_decimal:
                    applicable_tier = tier
                    break
            else:
                # No upper limit
                if order_total_decimal >= min_order:
                    applicable_tier = tier
                    break
        
        # If no tier matches, use default display fee
        if not applicable_tier:
            default_display_fee = Decimal(str(settings.get("default_display_fee", 10.0)))
            
            return {
                "fee": float(default_display_fee),
                "is_free": False,
                "tier_info": {
                    "reason": "default",
                    "fee": float(default_display_fee)
                }
            }
        
        # Use fixed fee from tier (progressive reduction system)
        tier_fee = Decimal(str(applicable_tier.get("fee", 10.0)))
        
        return {
            "fee": float(tier_fee),
            "is_free": False,
            "tier_info": {
                "reason": "tier",
                "min_order": applicable_tier.get("min_order"),
                "max_order": applicable_tier.get("max_order"),
                "fee": float(tier_fee)
            }
        }
    
    def get_default_fee_display(self) -> Dict:
        """
        Get default fee information for display on website panels.
        
        Returns:
            Dict with default display fee and free shipping threshold
        """
        settings = self.get_delivery_fee_settings()
        return {
            "default_display_fee": settings.get("default_display_fee", 10.0),
            "free_shipping_threshold": settings.get("free_shipping_threshold", 500.0),
            "min_fee": settings.get("min_fee", 5.0),
            "max_fee": settings.get("max_fee", 50.0)
        }

