"""Audit log schemas."""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AuditLog(BaseModel):
    """Audit log schema."""
    id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

