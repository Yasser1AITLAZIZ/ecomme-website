"""Shipping service for calculating shipping costs."""
from typing import List, Dict, Optional
from decimal import Decimal
from supabase import Client
from app.database import get_supabase_client
from app.core.exceptions import NotFoundError


class ShippingService:
    """Service for shipping operations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize shipping service."""
        self.db = db or get_supabase_client()
    
    def get_shipping_methods(self) -> List[Dict]:
        """
        Get all active shipping methods.
        
        Returns:
            List of shipping methods
        """
        response = self.db.table("shipping_methods").select("*").eq(
            "is_active", True
        ).order("price").execute()
        
        return response.data or []
    
    def get_shipping_method(self, method_id: str) -> Dict:
        """
        Get shipping method by ID.
        
        Args:
            method_id: Shipping method ID
            
        Returns:
            Shipping method data
            
        Raises:
            NotFoundError: If method not found
        """
        response = self.db.table("shipping_methods").select("*").eq(
            "id", method_id
        ).eq("is_active", True).execute()
        
        if not response.data:
            raise NotFoundError("Shipping method", method_id)
        
        return response.data[0]
    
    def calculate_shipping(
        self,
        shipping_method_id: Optional[str],
        address: Dict
    ) -> Dict:
        """
        Calculate shipping cost for an address.
        
        Args:
            shipping_method_id: Shipping method ID (optional, uses default if not provided)
            address: Shipping address dict
            
        Returns:
            Shipping calculation result with cost and estimated days
        """
        if shipping_method_id:
            method = self.get_shipping_method(shipping_method_id)
        else:
            # Get default (cheapest) method
            methods = self.get_shipping_methods()
            if not methods:
                raise NotFoundError("Shipping method", "default")
            method = methods[0]
        
        # Check if address zone is supported
        country = address.get("country", "").upper()
        zones = method.get("zones", [])
        
        if zones and country not in zones:
            # If zones specified and country not in zones, use default method
            methods = self.get_shipping_methods()
            if methods:
                method = methods[0]
            else:
                raise NotFoundError("Shipping method", "default")
        
        return {
            "shipping_method_id": method["id"],
            "shipping_method_name": method["name"],
            "cost": Decimal(str(method["price"])),
            "estimated_days_min": method.get("estimated_days_min"),
            "estimated_days_max": method.get("estimated_days_max")
        }

