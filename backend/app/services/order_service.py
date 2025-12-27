"""Order service for managing orders."""
from typing import List, Dict, Optional
from decimal import Decimal
from datetime import datetime
import random
import string
from supabase import Client
from app.database import get_supabase_client
from app.core.exceptions import NotFoundError
from app.services.cart_service import CartService
from app.services.stock_service import StockService
from app.services.delivery_fee_service import DeliveryFeeService


class OrderService:
    """Service for order operations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize order service."""
        self.db = db or get_supabase_client()
        self.cart_service = CartService(db)
        self.stock_service = StockService(db)
        self.delivery_fee_service = DeliveryFeeService(db)
    
    def generate_order_number(self) -> str:
        """
        Generate unique order number.
        
        Returns:
            Order number string
        """
        # Format: ORD-YYYYMMDD-XXXXXX
        date_str = datetime.utcnow().strftime("%Y%m%d")
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        order_number = f"ORD-{date_str}-{random_str}"
        
        # Check if exists (very unlikely but check anyway)
        existing = self.db.table("orders").select("id").eq("order_number", order_number).execute()
        if existing.data:
            # Regenerate if exists
            return self.generate_order_number()
        
        return order_number
    
    def create_order(
        self,
        user_id: Optional[str],
        cart_items: List[Dict],
        shipping_address: Dict,
        billing_address: Optional[Dict],
        shipping_method_id: Optional[str],
        payment_method: str,
        coupon_code: Optional[str] = None,
        notes: Optional[str] = None,
        guest_email: Optional[str] = None,
        guest_phone: Optional[str] = None,
        delivery_type: str = "delivery"
    ) -> Dict:
        """
        Create a new order.
        
        Args:
            user_id: User ID (None for guest orders)
            cart_items: List of cart items with product_id, quantity, and price
            shipping_address: Shipping address dict
            billing_address: Billing address dict (optional)
            shipping_method_id: Shipping method ID
            payment_method: Payment method (stripe, cod, etc.)
            coupon_code: Coupon code (optional)
            notes: Order notes (optional)
            guest_email: Guest email (for guest orders)
            guest_phone: Guest phone (for guest orders)
            delivery_type: Delivery type ('pickup' or 'delivery')
            
        Returns:
            Created order data
            
        Raises:
            NotFoundError: If product or shipping method not found
            ValueError: If insufficient stock or invalid data
        """
        # Validate delivery_type
        if delivery_type not in ['pickup', 'delivery']:
            raise ValueError("delivery_type must be 'pickup' or 'delivery'")
        
        # Calculate subtotal
        subtotal = sum(
            Decimal(str(item["price"])) * item["quantity"]
            for item in cart_items
        )
        
        # Calculate shipping cost based on delivery_type
        if delivery_type == 'pickup':
            shipping_cost = Decimal("0.00")
        else:  # delivery
            # Use city-based shipping fee calculation
            city = shipping_address.get('city', '')
            if city:
                fee_result = self.delivery_fee_service.calculate_delivery_fee_by_city(
                    city=city,
                    order_total=float(subtotal)
                )
                shipping_cost = Decimal(str(fee_result.get("fee", 150.0)))
            else:
                # Fallback to default if no city provided
                shipping_cost = Decimal("150.00")
        
        # Legacy shipping method support (if provided, use it instead)
        if shipping_method_id:
            shipping_method = self.db.table("shipping_methods").select("*").eq(
                "id", shipping_method_id
            ).eq("is_active", True).execute()
            
            if not shipping_method.data:
                raise NotFoundError("Shipping method", shipping_method_id)
            
            # Override shipping cost with method price
            shipping_cost = Decimal(str(shipping_method.data[0]["price"]))
        
        # Calculate discount (if coupon provided)
        discount_amount = Decimal("0")
        if coupon_code:
            # Apply coupon discount (simplified - should use coupon service)
            coupon = self.db.table("coupons").select("*").eq(
                "code", coupon_code.upper()
            ).eq("is_active", True).execute()
            
            if coupon.data:
                coupon_data = coupon.data[0]
                # Check if coupon is valid
                now = datetime.utcnow()
                if coupon_data.get("starts_at"):
                    starts_at = datetime.fromisoformat(coupon_data["starts_at"].replace("Z", "+00:00"))
                    if now < starts_at:
                        raise ValueError("Coupon not yet active")
                
                if coupon_data.get("expires_at"):
                    expires_at = datetime.fromisoformat(coupon_data["expires_at"].replace("Z", "+00:00"))
                    if now > expires_at:
                        raise ValueError("Coupon expired")
                
                # Check minimum order amount
                if coupon_data.get("min_order_amount"):
                    min_amount = Decimal(str(coupon_data["min_order_amount"]))
                    if subtotal < min_amount:
                        raise ValueError(f"Minimum order amount not met: {min_amount}")
                
                # Calculate discount
                if coupon_data["discount_type"] == "percentage":
                    discount = subtotal * (Decimal(str(coupon_data["discount_value"])) / 100)
                    if coupon_data.get("max_discount_amount"):
                        max_discount = Decimal(str(coupon_data["max_discount_amount"]))
                        discount = min(discount, max_discount)
                else:  # fixed
                    discount = Decimal(str(coupon_data["discount_value"]))
                
                discount_amount = min(discount, subtotal)
        
        # Calculate total
        total = subtotal + shipping_cost - discount_amount
        
        # Generate order number
        order_number = self.generate_order_number()
        
        # Create order
        order_data = {
            "order_number": order_number,
            "user_id": user_id,
            "guest_email": guest_email,
            "guest_phone": guest_phone,
            "subtotal": float(subtotal),
            "shipping_cost": float(shipping_cost),
            "discount_amount": float(discount_amount),
            "total": float(total),
            "currency": "MAD",
            "status": "pending",
            "payment_method": payment_method,
            "payment_status": "pending",
            "shipping_method_id": shipping_method_id,
            "delivery_type": delivery_type,
            "shipping_address": shipping_address,
            "billing_address": billing_address,
            "notes": notes
        }
        
        order_response = self.db.table("orders").insert(order_data).execute()
        order = order_response.data[0]
        order_id = order["id"]
        
        # Create order items and reserve stock
        for item in cart_items:
            # Get product price if not provided
            if "price" not in item:
                product = self.db.table("products").select("price").eq("id", item["product_id"]).execute()
                if not product.data:
                    raise NotFoundError("Product", item["product_id"])
                item["price"] = float(product.data[0]["price"])
            
            # Create order item
            self.db.table("order_items").insert({
                "order_id": order_id,
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": item["price"]
            }).execute()
            
            # Reserve stock
            try:
                self.stock_service.reserve_stock(
                    product_id=item["product_id"],
                    user_id=user_id or "guest",
                    quantity=item["quantity"]
                )
            except Exception as e:
                # If stock reservation fails, we should rollback, but for now just log
                pass
        
        # Create initial status history
        self.db.table("order_status_history").insert({
            "order_id": order_id,
            "status": "pending",
            "changed_by": user_id
        }).execute()
        
        # Clear cart if user is logged in
        if user_id:
            self.cart_service.clear_cart(user_id)
        
        return order
    
    def get_user_orders(self, user_id: str) -> List[Dict]:
        """
        Get all orders for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of orders
        """
        response = self.db.table("orders").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).execute()
        
        return response.data or []
    
    def get_order(self, order_id: str, user_id: Optional[str] = None) -> Dict:
        """
        Get order details.
        
        Args:
            order_id: Order ID
            user_id: User ID (for authorization)
            
        Returns:
            Order data with items
            
        Raises:
            NotFoundError: If order not found
        """
        query = self.db.table("orders").select("*").eq("id", order_id)
        
        # If user_id provided, ensure user owns the order
        if user_id:
            query = query.eq("user_id", user_id)
        
        response = query.execute()
        
        if not response.data:
            raise NotFoundError("Order", order_id)
        
        order = response.data[0]
        
        # Get order items with product details
        items_response = self.db.table("order_items").select(
            """
            id,
            order_id,
            product_id,
            quantity,
            price,
            created_at,
            products:product_id (
                name
            )
            """
        ).eq("order_id", order_id).execute()
        
        items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get primary image
            images = self.db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append({
                "id": item["id"],
                "order_id": item["order_id"],
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": Decimal(str(item["price"])),
                "created_at": item["created_at"],
                "product_name": product.get("name") if product else None,
                "product_image": product_image
            })
        
        order["items"] = items
        
        return order
    
    def update_order_status(
        self,
        order_id: str,
        status: str,
        admin_id: str,
        notes: Optional[str] = None
    ) -> Dict:
        """
        Update order status (admin only).
        
        Args:
            order_id: Order ID
            status: New status
            admin_id: Admin user ID
            notes: Optional notes
            
        Returns:
            Updated order data
            
        Raises:
            NotFoundError: If order not found
        """
        # Get existing order
        order = self.db.table("orders").select("*").eq("id", order_id).execute()
        if not order.data:
            raise NotFoundError("Order", order_id)
        
        old_status = order.data[0]["status"]
        
        # Update order
        response = self.db.table("orders").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", order_id).execute()
        
        # Create status history entry
        self.db.table("order_status_history").insert({
            "order_id": order_id,
            "status": status,
            "changed_by": admin_id,
            "notes": notes
        }).execute()
        
        # If order is cancelled or refunded, release stock
        if status in ["cancelled", "refunded"] and old_status not in ["cancelled", "refunded"]:
            # Get order items and release stock
            items = self.db.table("order_items").select("*").eq("order_id", order_id).execute()
            for item in items.data:
                # Find and release reservations
                reservations = self.db.table("stock_reservations").select("*").eq(
                    "product_id", item["product_id"]
                ).eq("order_id", order_id).execute()
                
                for reservation in reservations.data:
                    self.stock_service.release_reservation(reservation["id"])
        
        return response.data[0] if response.data else order.data[0]

