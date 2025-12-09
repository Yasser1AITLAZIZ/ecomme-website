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
    
    def get_user_cart(self, user_id: str) -> List[Dict]:
        """
        Get user's cart with product details.
        
        Args:
            user_id: User ID
            
        Returns:
            List of cart items with product details
        """
        # Get cart items with product details
        response = self.db.table("cart_items").select(
            """
            id,
            user_id,
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
                deleted_at
            ),
            product_images:product_id (
                image_url,
                is_primary,
                order
            )
            """
        ).eq("user_id", user_id).execute()
        
        items = []
        for item in response.data:
            product = item.get("products", {})
            if not product or not product.get("is_active") or product.get("deleted_at"):
                # Skip inactive or deleted products
                continue
            
            # Get primary image
            images = item.get("product_images", [])
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
                "user_id": item["user_id"],
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "created_at": item["created_at"],
                "updated_at": item["updated_at"],
                "product_name": product.get("name"),
                "product_price": Decimal(str(product.get("price", 0))),
                "product_image": primary_image
            })
        
        return items
    
    def add_item(self, user_id: str, product_id: str, quantity: int) -> Dict:
        """
        Add or update item in cart.
        
        Args:
            user_id: User ID
            product_id: Product ID
            quantity: Quantity to add
            
        Returns:
            Cart item data
            
        Raises:
            NotFoundError: If product not found
        """
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
        existing = self.db.table("cart_items").select("*").eq(
            "user_id", user_id
        ).eq("product_id", product_id).execute()
        
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
            response = self.db.table("cart_items").insert({
                "user_id": user_id,
                "product_id": product_id,
                "quantity": quantity
            }).execute()
            
            item = response.data[0]
        
        # Get product details for response
        return {
            "id": item["id"],
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
            "product_name": product_data.get("name"),
            "product_price": Decimal(str(product_data.get("price", 0))),
            "product_image": None  # Will be populated by get_user_cart
        }
    
    def update_item_quantity(self, user_id: str, item_id: str, quantity: int) -> Dict:
        """
        Update cart item quantity.
        
        Args:
            user_id: User ID
            item_id: Cart item ID
            quantity: New quantity
            
        Returns:
            Updated cart item data
            
        Raises:
            NotFoundError: If item not found
        """
        # Get cart item
        item = self.db.table("cart_items").select("*").eq("id", item_id).eq("user_id", user_id).execute()
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
    
    def remove_item(self, user_id: str, item_id: str) -> None:
        """
        Remove item from cart.
        
        Args:
            user_id: User ID
            item_id: Cart item ID
            
        Raises:
            NotFoundError: If item not found
        """
        # Verify item belongs to user
        item = self.db.table("cart_items").select("*").eq("id", item_id).eq("user_id", user_id).execute()
        if not item.data:
            raise NotFoundError("Cart item", item_id)
        
        # Delete item
        self.db.table("cart_items").delete().eq("id", item_id).execute()
    
    def sync_cart(self, user_id: str, items: List[Dict]) -> List[Dict]:
        """
        Sync cart from frontend (replace existing cart).
        
        Args:
            user_id: User ID
            items: List of cart items with product_id and quantity
            
        Returns:
            Synced cart items
        """
        # Clear existing cart
        self.db.table("cart_items").delete().eq("user_id", user_id).execute()
        
        # Add new items
        synced_items = []
        for item in items:
            try:
                cart_item = self.add_item(
                    user_id=user_id,
                    product_id=item["product_id"],
                    quantity=item["quantity"]
                )
                if cart_item:
                    synced_items.append(cart_item)
            except (NotFoundError, ValueError) as e:
                # Skip invalid items
                continue
        
        return synced_items
    
    def clear_cart(self, user_id: str) -> None:
        """
        Clear all items from cart.
        
        Args:
            user_id: User ID
        """
        self.db.table("cart_items").delete().eq("user_id", user_id).execute()
    
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

