"""Audit logging service."""
from typing import Optional, Dict, Any
from decimal import Decimal
from app.database import get_supabase_client


class AuditService:
    """Service for audit logging."""
    
    @staticmethod
    def _convert_decimals_to_strings(obj):
        """Recursively convert Decimal objects to strings for JSON serialization."""
        if isinstance(obj, Decimal):
            return str(obj)
        elif isinstance(obj, dict):
            return {k: AuditService._convert_decimals_to_strings(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [AuditService._convert_decimals_to_strings(item) for item in obj]
        else:
            return obj
    
    @staticmethod
    def log_action(
        user_id: Optional[str],
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> None:
        """
        Log an audit action.
        
        Args:
            user_id: User ID who performed the action
            action: Action performed (e.g., "product.created")
            resource_type: Type of resource (e.g., "product")
            resource_id: ID of the resource
            old_values: Previous state
            new_values: New state
            ip_address: IP address
            user_agent: User agent string
        """
        db = get_supabase_client()
        
        # Convert Decimal objects to strings for JSON serialization
        old_values_serialized = AuditService._convert_decimals_to_strings(old_values) if old_values else {}
        new_values_serialized = AuditService._convert_decimals_to_strings(new_values) if new_values else {}
        
        db.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "old_values": old_values_serialized,
            "new_values": new_values_serialized,
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
    
    @staticmethod
    def get_audit_logs(
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 100
    ) -> list:
        """
        Get audit logs.
        
        Args:
            resource_type: Filter by resource type
            resource_id: Filter by resource ID
            user_id: Filter by user ID
            limit: Maximum number of logs to return
            
        Returns:
            List of audit logs
        """
        db = get_supabase_client()
        query = db.table("audit_logs").select("*").order("created_at", desc=True).limit(limit)
        
        if resource_type:
            query = query.eq("resource_type", resource_type)
        if resource_id:
            query = query.eq("resource_id", resource_id)
        if user_id:
            query = query.eq("user_id", user_id)
        
        response = query.execute()
        return response.data

