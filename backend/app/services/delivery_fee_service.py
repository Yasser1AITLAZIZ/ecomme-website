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
    
    def get_city_shipping_fee_settings(self) -> Dict:
        """
        Get city-based shipping fee settings from system_settings.
        
        Returns:
            City shipping fee configuration dict with city names as keys
        """
        try:
            response = self.db.table("system_settings").select("*").eq(
                "key", "city_shipping_fees"
            ).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get("value", {})
            
            # Return default settings if not configured
            return {
                "default": 150.0
            }
        except Exception:
            # Return default settings on error
            return {
                "default": 150.0
            }
    
    def normalize_city_name(self, city: str) -> str:
        """
        Normalize city name for lookup (lowercase, trim, remove accents).
        
        Args:
            city: City name to normalize
            
        Returns:
            Normalized city name
        """
        if not city:
            return ""
        
        # Convert to lowercase and trim
        normalized = city.lower().strip()
        
        # Remove common diacritics (for French/Arabic city names)
        # This is a simple approach - for production, consider using unidecode
        normalized = normalized.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
        normalized = normalized.replace('à', 'a').replace('â', 'a')
        normalized = normalized.replace('î', 'i').replace('ï', 'i')
        normalized = normalized.replace('ô', 'o').replace('ö', 'o')
        normalized = normalized.replace('ù', 'u').replace('û', 'u').replace('ü', 'u')
        normalized = normalized.replace('ç', 'c')
        
        return normalized
    
    def get_city_shipping_fee(self, city: str) -> Optional[float]:
        """
        Get shipping fee for a specific city.
        
        Args:
            city: City name
            
        Returns:
            Shipping fee for the city, or None if city not found (use default)
        """
        if not city:
            return None
        
        city_settings = self.get_city_shipping_fee_settings()
        normalized_city = self.normalize_city_name(city)
        
        # Check if city has specific fee
        if normalized_city in city_settings:
            fee = city_settings[normalized_city]
            if isinstance(fee, (int, float)):
                return float(fee)
        
        return None
    
    def calculate_delivery_fee_by_city(self, city: str, order_total: float) -> Dict:
        """
        Calculate delivery fee based on city and order total.
        First checks city-specific fees, then applies order total logic if needed.
        
        Args:
            city: City name
            order_total: Total order amount (subtotal)
            
        Returns:
            Dict with fee, is_free, and tier_info
        """
        # First, check if city has specific fee
        city_fee = self.get_city_shipping_fee(city)
        
        if city_fee is not None:
            # City has specific fee (can be 0 for free shipping)
            return {
                "fee": city_fee,
                "is_free": city_fee == 0.0,
                "tier_info": {
                    "reason": "city_specific",
                    "city": city,
                    "fee": city_fee
                }
            }
        
        # If no city-specific fee, use default from city settings or fallback to order total logic
        city_settings = self.get_city_shipping_fee_settings()
        default_city_fee = city_settings.get("default", None)
        
        if default_city_fee is not None:
            # Use default city fee
            default_fee = float(default_city_fee)
            return {
                "fee": default_fee,
                "is_free": default_fee == 0.0,
                "tier_info": {
                    "reason": "city_default",
                    "city": city,
                    "fee": default_fee
                }
            }
        
        # Fallback to order total-based calculation
        return self.calculate_delivery_fee(order_total)

