"""Stock reservation and management service."""
from typing import List, Dict
from datetime import datetime, timedelta
from app.database import get_supabase_client
from app.core.exceptions import StockError
from decimal import Decimal


class StockService:
    """Service for stock management and reservation."""
    
    def __init__(self, db=None):
        """Initialize stock service."""
        self.db = db or get_supabase_client()
    
    def check_stock_availability(self, product_id: str, quantity: int) -> bool:
        """
        Check if product has sufficient stock.
        
        Args:
            product_id: Product ID
            quantity: Required quantity
            
        Returns:
            True if stock is available
        """
        # Get product with current stock
        product = self.db.table("products").select("stock, reserved_stock").eq("id", product_id).execute()
        
        if not product.data:
            return False
        
        product_data = product.data[0]
        available_stock = product_data["stock"] - product_data["reserved_stock"]
        
        # Check active reservations
        active_reservations = self.db.table("stock_reservations").select("quantity").eq(
            "product_id", product_id
        ).gt("expires_at", datetime.utcnow().isoformat()).execute()
        
        reserved_quantity = sum(r["quantity"] for r in active_reservations.data)
        available_stock -= reserved_quantity
        
        return available_stock >= quantity
    
    def reserve_stock(
        self,
        product_id: str,
        user_id: str,
        quantity: int,
        expires_in_minutes: int = 15
    ) -> str:
        """
        Reserve stock for a user.
        
        Args:
            product_id: Product ID
            user_id: User ID
            quantity: Quantity to reserve
            expires_in_minutes: Reservation expiry in minutes
            
        Returns:
            Reservation ID
            
        Raises:
            StockError: If insufficient stock
        """
        # Check availability
        if not self.check_stock_availability(product_id, quantity):
            raise StockError(f"Insufficient stock for product {product_id}")
        
        # Create reservation
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        reservation = self.db.table("stock_reservations").insert({
            "product_id": product_id,
            "user_id": user_id,
            "quantity": quantity,
            "expires_at": expires_at.isoformat()
        }).execute()
        
        # Update reserved stock
        self.db.table("products").update({
            "reserved_stock": self.db.table("products").select("reserved_stock").eq("id", product_id).execute().data[0]["reserved_stock"] + quantity
        }).eq("id", product_id).execute()
        
        return reservation.data[0]["id"]
    
    def release_reservation(self, reservation_id: str) -> None:
        """
        Release a stock reservation.
        
        Args:
            reservation_id: Reservation ID
        """
        # Get reservation
        reservation = self.db.table("stock_reservations").select("*").eq("id", reservation_id).execute()
        
        if not reservation.data:
            return
        
        res_data = reservation.data[0]
        product_id = res_data["product_id"]
        quantity = res_data["quantity"]
        
        # Delete reservation
        self.db.table("stock_reservations").delete().eq("id", reservation_id).execute()
        
        # Update reserved stock
        current_reserved = self.db.table("products").select("reserved_stock").eq("id", product_id).execute().data[0]["reserved_stock"]
        new_reserved = max(0, current_reserved - quantity)
        
        self.db.table("products").update({
            "reserved_stock": new_reserved
        }).eq("id", product_id).execute()
    
    def confirm_reservation(self, reservation_id: str, order_id: str) -> None:
        """
        Confirm reservation by linking it to an order and deducting stock.
        
        Args:
            reservation_id: Reservation ID
            order_id: Order ID
        """
        # Get reservation
        reservation = self.db.table("stock_reservations").select("*").eq("id", reservation_id).execute()
        
        if not reservation.data:
            return
        
        res_data = reservation.data[0]
        product_id = res_data["product_id"]
        quantity = res_data["quantity"]
        
        # Link to order
        self.db.table("stock_reservations").update({
            "order_id": order_id
        }).eq("id", reservation_id).execute()
        
        # Deduct from stock
        product = self.db.table("products").select("stock, reserved_stock").eq("id", product_id).execute().data[0]
        new_stock = max(0, product["stock"] - quantity)
        new_reserved = max(0, product["reserved_stock"] - quantity)
        
        self.db.table("products").update({
            "stock": new_stock,
            "reserved_stock": new_reserved
        }).eq("id", product_id).execute()
    
    def cleanup_expired_reservations(self) -> int:
        """
        Clean up expired reservations.
        
        Returns:
            Number of reservations cleaned up
        """
        now = datetime.utcnow().isoformat()
        
        # Get expired reservations
        expired = self.db.table("stock_reservations").select("*").lt("expires_at", now).is_("order_id", "null").execute()
        
        count = len(expired.data)
        
        # Release stock for each expired reservation
        for res in expired.data:
            self.release_reservation(res["id"])
        
        return count

