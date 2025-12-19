"""Admin-specific schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from decimal import Decimal


# Analytics Schemas

class DashboardStats(BaseModel):
    """Dashboard statistics schema."""
    revenue: Dict[str, float]
    orders: Dict[str, Any]
    users: Dict[str, int]
    products: Dict[str, int]
    payment_methods: Dict[str, int]


class RevenueStats(BaseModel):
    """Revenue statistics schema."""
    period: str
    total_revenue: float
    growth_percentage: float
    trend: List[Dict[str, Any]]


class OrderAnalytics(BaseModel):
    """Order analytics schema."""
    period: Dict[str, str]
    total_orders: int
    total_revenue: float
    average_order_value: float
    status_breakdown: Dict[str, int]
    payment_status_breakdown: Dict[str, int]


class ProductAnalytics(BaseModel):
    """Product analytics schema."""
    top_products: List[Dict[str, Any]]
    by_category: Dict[str, int]
    stock_alerts: Dict[str, List[Dict[str, Any]]]


class UserAnalytics(BaseModel):
    """User analytics schema."""
    total_users: int
    new_users: Dict[str, int]
    top_customers: List[Dict[str, Any]]
    role_distribution: Dict[str, int]


class TrendPoint(BaseModel):
    """Trend point schema."""
    date: str
    revenue: Optional[float] = None
    count: Optional[int] = None


# User Management Schemas

class AdminUserList(BaseModel):
    """Admin user list item schema."""
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    created_at: datetime
    order_count: Optional[int] = 0
    total_spent: Optional[float] = 0.0
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class AdminUserListResponse(BaseModel):
    """Admin user list response with pagination."""
    users: List[AdminUserList]
    total: int
    page: int
    per_page: int
    total_pages: int
    
    class Config:
        from_attributes = True


class AdminUserDetail(BaseModel):
    """Admin user detail schema."""
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime
    orders: Optional[List[Dict[str, Any]]] = None


class AdminUserUpdate(BaseModel):
    """Admin user update schema."""
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class AdminUserRoleUpdate(BaseModel):
    """Admin user role update schema."""
    role: str


class AdminUserCreate(BaseModel):
    """Admin user creation schema."""
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "customer"


# Order Management Schemas

class AdminOrderList(BaseModel):
    """Admin order list item schema."""
    id: str
    order_number: str
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    customer_name: Optional[str] = None
    total: Decimal
    status: str
    payment_status: str
    payment_method: Optional[str] = None
    created_at: datetime
    item_count: Optional[int] = 0


class AdminOrderDetail(BaseModel):
    """Admin order detail schema."""
    id: str
    order_number: str
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    subtotal: Decimal
    shipping_cost: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    status: str
    payment_method: Optional[str] = None
    payment_status: str
    payment_intent_id: Optional[str] = None
    shipping_method_id: Optional[str] = None
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[Dict[str, Any]]
    status_history: Optional[List[Dict[str, Any]]] = None


class AdminOrderStatusUpdate(BaseModel):
    """Admin order status update schema."""
    status: str
    notes: Optional[str] = None


class AdminOrderPaymentStatusUpdate(BaseModel):
    """Admin order payment status update schema."""
    payment_status: str


class AdminOrderNotesUpdate(BaseModel):
    """Admin order notes update schema."""
    admin_notes: str


class AdminOrderDiscountUpdate(BaseModel):
    """Admin order discount update schema."""
    discount_amount: float


class BulkOrderStatusUpdate(BaseModel):
    """Bulk order status update schema."""
    order_ids: List[str]
    status: str
    notes: Optional[str] = None


# Category Management Schemas

class CategoryCreate(BaseModel):
    """Category creation schema."""
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """Category update schema."""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class Category(BaseModel):
    """Category response schema."""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Settings Schemas

class SystemSetting(BaseModel):
    """System setting schema."""
    id: str
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    updated_by: Optional[str] = None
    updated_at: datetime


class SystemSettingUpdate(BaseModel):
    """System setting update schema."""
    value: Dict[str, Any]
    description: Optional[str] = None


# Audit Log Schemas

class AuditLog(BaseModel):
    """Audit log schema."""
    id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    old_values: Dict[str, Any]
    new_values: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime


# Security Event Schemas

class SecurityEvent(BaseModel):
    """Security event schema."""
    id: str
    event_type: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    severity: str
    request_data: Optional[Dict[str, Any]] = None
    created_at: datetime


class SecurityStats(BaseModel):
    """Security statistics schema."""
    total_events: int
    by_severity: Dict[str, int]
    by_type: Dict[str, int]
    recent_events: List[SecurityEvent]


# Contact Leads Schemas

class ContactLeadCreate(BaseModel):
    """Contact lead creation schema."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class ContactLeadUpdate(BaseModel):
    """Contact lead update schema."""
    status: Optional[str] = None
    admin_notes: Optional[str] = None


class ContactLead(BaseModel):
    """Contact lead schema."""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    status: str
    converted_to_user_id: Optional[str] = None
    admin_notes: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ContactLeadListResponse(BaseModel):
    """Contact lead list response with pagination."""
    leads: List[ContactLead]
    total: int
    page: int
    per_page: int
    total_pages: int


class ContactLeadConvert(BaseModel):
    """Contact lead convert to user schema."""
    password: str
    role: str = "customer"


# Notification Schemas

class Notification(BaseModel):
    """Notification schema."""
    id: str
    type: Literal['order', 'user', 'product']
    title: str
    message: str
    created_at: datetime
    link: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
