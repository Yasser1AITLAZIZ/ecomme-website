"""Payment service for processing payments."""
from typing import Optional, Dict
from decimal import Decimal
from supabase import Client
from app.database import get_supabase_client
from app.config import settings
from app.core.exceptions import NotFoundError

# Try to import stripe, but make it optional
try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False


class PaymentService:
    """Service for payment operations."""
    
    def __init__(self, db: Optional[Client] = None):
        """Initialize payment service."""
        self.db = db or get_supabase_client()
        if STRIPE_AVAILABLE and settings.STRIPE_SECRET_KEY:
            stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def create_stripe_payment_intent(
        self,
        amount: Decimal,
        currency: str,
        order_id: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create Stripe payment intent.
        
        Args:
            amount: Payment amount
            currency: Currency code (e.g., 'usd', 'mad')
            order_id: Order ID
            metadata: Additional metadata
            
        Returns:
            Payment intent data
            
        Raises:
            ValueError: If Stripe is not configured
        """
        if not STRIPE_AVAILABLE or not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe is not configured")
        
        # Convert amount to cents
        amount_cents = int(float(amount) * 100)
        
        intent_data = {
            "amount": amount_cents,
            "currency": currency.lower(),
            "metadata": {
                "order_id": order_id,
                **(metadata or {})
            }
        }
        
        intent = stripe.PaymentIntent.create(**intent_data)
        
        # Update order with payment intent ID
        self.db.table("orders").update({
            "payment_intent_id": intent.id
        }).eq("id", order_id).execute()
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    
    def verify_stripe_webhook(self, payload: bytes, signature: str) -> Dict:
        """
        Verify Stripe webhook signature.
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            
        Returns:
            Event data
            
        Raises:
            ValueError: If signature is invalid
        """
        if not STRIPE_AVAILABLE or not settings.STRIPE_WEBHOOK_SECRET:
            raise ValueError("Stripe webhook secret is not configured")
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            raise ValueError(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid signature: {str(e)}")
    
    def process_cod_order(self, order_id: str) -> Dict:
        """
        Process Cash on Delivery order.
        
        Args:
            order_id: Order ID
            
        Returns:
            Updated order data
            
        Raises:
            NotFoundError: If order not found
        """
        # Get order
        order = self.db.table("orders").select("*").eq("id", order_id).execute()
        if not order.data:
            raise NotFoundError("Order", order_id)
        
        # For COD, payment status remains pending until delivery
        # Just update payment method if not set
        if not order.data[0].get("payment_method"):
            self.db.table("orders").update({
                "payment_method": "cod",
                "payment_status": "pending"
            }).eq("id", order_id).execute()
        
        updated = self.db.table("orders").select("*").eq("id", order_id).execute()
        return updated.data[0] if updated.data else order.data[0]
    
    def confirm_payment(self, order_id: str, payment_intent_id: Optional[str] = None) -> Dict:
        """
        Confirm payment for an order.
        
        Args:
            order_id: Order ID
            payment_intent_id: Payment intent ID (for Stripe)
            
        Returns:
            Updated order data
        """
        update_data = {
            "payment_status": "paid"
        }
        
        if payment_intent_id:
            update_data["payment_intent_id"] = payment_intent_id
        
        self.db.table("orders").update(update_data).eq("id", order_id).execute()
        
        # Update order status to confirmed
        self.db.table("orders").update({
            "status": "confirmed"
        }).eq("id", order_id).execute()
        
        updated = self.db.table("orders").select("*").eq("id", order_id).execute()
        return updated.data[0] if updated.data else {}

