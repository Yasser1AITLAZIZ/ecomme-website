"""Payment schemas."""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal


class PaymentIntentCreate(BaseModel):
    """Payment intent creation schema."""
    order_id: str
    amount: Decimal
    currency: str = "MAD"
    metadata: Optional[Dict[str, Any]] = None


class PaymentIntentResponse(BaseModel):
    """Payment intent response schema."""
    client_secret: str
    payment_intent_id: str


class Payment(BaseModel):
    """Payment response schema."""
    id: str
    order_id: str
    payment_intent_id: str
    amount: Decimal
    currency: str
    status: str
    stripe_customer_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaymentStatusResponse(BaseModel):
    """Payment status response schema."""
    payment_intent_id: str
    status: str
    amount: Decimal
    currency: str

