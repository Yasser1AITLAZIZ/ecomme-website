"""Cart service for managing user shopping carts."""
from typing import List, Dict, Optional
from decimal import Decimal
from datetime import datetime
from supabase import Client
from app.database import get_supabase_client
from app.core.exceptions import NotFoundError
from app.services.stock_service import StockService


class CartService:
    """Service for cart operations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize cart service."""
        self.db = db or get_supabase_client()
        self.stock_service = StockService(db)
    
    def get_user_cart(self, user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> List[Dict]:
        """
        Get user's or guest's cart with product details.
        
        Args:
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
            
        Returns:
            List of cart items with product details
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        # Build query based on whether it's a user or guest cart
        query = self.db.table("cart_items").select(
            """
            id,
            user_id,
            guest_session_id,
            product_id,
            quantity,
            created_at,
            updated_at,
            products:product_id (
                name,
                price,
                compare_at_price,
                currency,
                is_active,
                deleted_at,
                product_images (
                    image_url,
                    is_primary,
                    order
                )
            )
            """
        )
        
        if user_id:
            query = query.eq("user_id", user_id)
        else:
            query = query.eq("guest_session_id", guest_session_id)
        
        response = query.execute()
        
        items = []
        for item in response.data:
            product = item.get("products", {})
            if not product or not product.get("is_active") or product.get("deleted_at"):
                # Skip inactive or deleted products
                continue
            
            # Get primary image from nested product_images
            images = product.get("product_images", []) if isinstance(product, dict) else []
            primary_image = None
            if images:
                primary_images = [img for img in images if img.get("is_primary")]
                if primary_images:
                    primary_image = primary_images[0].get("image_url")
                elif images:
                    # Get first image sorted by order
                    sorted_images = sorted(images, key=lambda x: x.get("order", 0))
                    primary_image = sorted_images[0].get("image_url")
            
            items.append({
                "id": item["id"],
                "user_id": item.get("user_id"),
                "guest_session_id": item.get("guest_session_id"),
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
                "product_name": product.get("name"),
                "product_price": Decimal(str(product.get("price", 0))),
                "product_image": primary_image
            })
        
        return items
    
    def add_item(self, product_id: str, quantity: int, user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> Dict:
        """
        Add or update item in cart.
        
        Args:
            product_id: Product ID
            quantity: Quantity to add
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
            
        Returns:
            Cart item data
            
        Raises:
            NotFoundError: If product not found
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        # Validate product exists and is active
        product = self.db.table("products").select("*").eq("id", product_id).execute()
        if not product.data:
            raise NotFoundError("Product", product_id)
        
        product_data = product.data[0]
        if not product_data.get("is_active") or product_data.get("deleted_at"):
            raise NotFoundError("Product", product_id)
        
        # Check stock availability
        available_stock = product_data["stock"] - product_data.get("reserved_stock", 0)
        if available_stock < quantity:
            raise ValueError(f"Insufficient stock. Available: {available_stock}")
        
        # Check if item already exists in cart
        existing_query = self.db.table("cart_items").select("*").eq("product_id", product_id)
        if user_id:
            existing_query = existing_query.eq("user_id", user_id)
        else:
            existing_query = existing_query.eq("guest_session_id", guest_session_id)
        
        existing = existing_query.execute()
        
        if existing.data:
            # Update quantity
            new_quantity = existing.data[0]["quantity"] + quantity
            if new_quantity > available_stock:
                raise ValueError(f"Insufficient stock. Available: {available_stock}")
            
            response = self.db.table("cart_items").update({
                "quantity": new_quantity,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", existing.data[0]["id"]).execute()
            
            item = response.data[0]
        else:
            # Insert new item
            insert_data = {
                "product_id": product_id,
                "quantity": quantity
            }
            if user_id:
                insert_data["user_id"] = user_id
            else:
                insert_data["guest_session_id"] = guest_session_id
            
            response = self.db.table("cart_items").insert(insert_data).execute()
            
            item = response.data[0]
        
        # Get product details for response
        return {
            "id": item["id"],
            "user_id": item.get("user_id"),
            "guest_session_id": item.get("guest_session_id"),
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
            "product_name": product_data.get("name"),
            "product_price": Decimal(str(product_data.get("price", 0))),
            "product_image": None  # Will be populated by get_user_cart
        }
    
    def update_item_quantity(self, item_id: str, quantity: int, user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> Dict:
        """
        Update cart item quantity.
        
        Args:
            item_id: Cart item ID
            quantity: New quantity
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
            
        Returns:
            Updated cart item data
            
        Raises:
            NotFoundError: If item not found
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        # Get cart item
        item_query = self.db.table("cart_items").select("*").eq("id", item_id)
        if user_id:
            item_query = item_query.eq("user_id", user_id)
        else:
            item_query = item_query.eq("guest_session_id", guest_session_id)
        
        item = item_query.execute()
        if not item.data:
            raise NotFoundError("Cart item", item_id)
        
        if quantity <= 0:
            # Remove item if quantity is 0 or less
            self.db.table("cart_items").delete().eq("id", item_id).execute()
            return None
        
        # Check stock availability
        product = self.db.table("products").select("stock, reserved_stock").eq(
            "id", item.data[0]["product_id"]
        ).execute()
        
        if product.data:
            available_stock = product.data[0]["stock"] - product.data[0].get("reserved_stock", 0)
            if quantity > available_stock:
                raise ValueError(f"Insufficient stock. Available: {available_stock}")
        
        # Update quantity
        response = self.db.table("cart_items").update({
            "quantity": quantity,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", item_id).execute()
        
        return response.data[0] if response.data else None
    
    def remove_item(self, item_id: str, user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> None:
        """
        Remove item from cart.
        
        Args:
            item_id: Cart item ID
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
            
        Raises:
            NotFoundError: If item not found
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        # Verify item belongs to user or guest
        item_query = self.db.table("cart_items").select("*").eq("id", item_id)
        if user_id:
            item_query = item_query.eq("user_id", user_id)
        else:
            item_query = item_query.eq("guest_session_id", guest_session_id)
        
        item = item_query.execute()
        if not item.data:
            raise NotFoundError("Cart item", item_id)
        
        # Delete item
        self.db.table("cart_items").delete().eq("id", item_id).execute()
    
    def sync_cart(self, items: List[Dict], user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> List[Dict]:
        """
        Sync cart from frontend (replace existing cart).
        
        Args:
            items: List of cart items with product_id and quantity
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
            
        Returns:
            Synced cart items
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        # Clear existing cart
        delete_query = self.db.table("cart_items").delete()
        if user_id:
            delete_query = delete_query.eq("user_id", user_id)
        else:
            delete_query = delete_query.eq("guest_session_id", guest_session_id)
        
        try:
            delete_query.execute()
        except Exception as e:
            # Check if error is about missing column
            error_str = str(e).lower()
            if "column" in error_str and "guest_session_id" in error_str and "does not exist" in error_str:
                raise ValueError(
                    "Database migration required: The 'guest_session_id' column is missing from 'cart_items' table. "
                    "Please apply migration 006_add_guest_cart_support.sql in your Supabase SQL Editor. "
                    "See backend/supabase/migrations/006_add_guest_cart_support.sql for the migration SQL."
                ) from e
            raise
        
        # Add new items
        synced_items = []
        for item in items:
            try:
                cart_item = self.add_item(
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    user_id=user_id,
                    guest_session_id=guest_session_id
                )
                if cart_item:
                    synced_items.append(cart_item)
            except (NotFoundError, ValueError) as e:
                # Skip invalid items
                continue
        
        return synced_items
    
    def clear_cart(self, user_id: Optional[str] = None, guest_session_id: Optional[str] = None) -> None:
        """
        Clear all items from cart.
        
        Args:
            user_id: User ID (optional, required if guest_session_id is None)
            guest_session_id: Guest session ID (optional, required if user_id is None)
        """
        if not user_id and not guest_session_id:
            raise ValueError("Either user_id or guest_session_id must be provided")
        
        delete_query = self.db.table("cart_items").delete()
        if user_id:
            delete_query = delete_query.eq("user_id", user_id)
        else:
            delete_query = delete_query.eq("guest_session_id", guest_session_id)
        delete_query.execute()
    
    def merge_guest_cart_to_user(self, guest_session_id: str, user_id: str) -> List[Dict]:
        """
        Merge guest cart into user cart.
        
        Args:
            guest_session_id: Guest session ID
            user_id: User ID
            
        Returns:
            Merged cart items
        """
        # Get guest cart
        guest_items = self.get_user_cart(guest_session_id=guest_session_id)
        
        # Get user cart
        user_items = self.get_user_cart(user_id=user_id)
        
        # Create a map of product_id -> quantity for user cart
        user_cart_map = {item["product_id"]: item["quantity"] for item in user_items}
        
        # Merge guest items into user cart map
        for guest_item in guest_items:
            product_id = guest_item["product_id"]
            if product_id in user_cart_map:
                # Combine quantities
                user_cart_map[product_id] += guest_item["quantity"]
            else:
                # Add new item
                user_cart_map[product_id] = guest_item["quantity"]
        
        # Convert map back to list
        merged_items = [{"product_id": pid, "quantity": qty} for pid, qty in user_cart_map.items()]
        
        # Sync merged cart to user account
        synced_items = self.sync_cart(
            items=merged_items,
            user_id=user_id
        )
        
        # Delete guest cart
        self.clear_cart(guest_session_id=guest_session_id)
        
        return synced_items
    
    def calculate_cart_total(self, cart_items: List[Dict]) -> Dict[str, Decimal]:
        """
        Calculate cart total.
        
        Args:
            cart_items: List of cart items with product_price and quantity
            
        Returns:
            Dictionary with total_items and total_price
        """
        total_items = sum(item["quantity"] for item in cart_items)
        total_price = sum(
            Decimal(str(item["product_price"])) * item["quantity"]
            for item in cart_items
        )
        
        return {
            "total_items": total_items,
            "total_price": total_price
        }

