"""Admin leads management routes."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
import httpx
from app.api.v1.deps import get_db, validate_uuid_param
from app.core.permissions import require_admin
from app.schemas.admin import (
    ContactLead,
    ContactLeadListResponse,
    ContactLeadUpdate,
    ContactLeadConvert
)
from app.schemas.user import UserProfile
from app.core.exceptions import NotFoundError
from app.services.audit_service import AuditService
from app.config import settings
from supabase import Client

router = APIRouter(prefix="/admin/leads", tags=["Admin - Leads"])


@router.get("", response_model=ContactLeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    List all contact leads (admin only).
    
    Args:
        page: Page number
        per_page: Items per page
        search: Search term (name or email)
        status_filter: Filter by status
        
    Returns:
        List of leads with total count
    """
    try:
        offset = (page - 1) * per_page
        
        query = db.table("contact_leads").select("*")
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        response = query.order("created_at", desc=True).execute()
        
        all_leads = response.data or []
        
        if search:
            search_lower = search.lower()
            all_leads = [
                lead for lead in all_leads
                if search_lower in (lead.get("name", "") or "").lower()
                or search_lower in (lead.get("email", "") or "").lower()
            ]
        
        total = len(all_leads)
        leads_data = all_leads[offset:offset + per_page]
        
        total_pages = (total + per_page - 1) // per_page
        
        leads = [ContactLead(**lead) for lead in leads_data]
        
        return ContactLeadListResponse(
            leads=leads,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    except Exception as e:
        # Check if it's a table not found error
        error_str = str(e)
        if "Could not find the table" in error_str and "contact_leads" in error_str:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The contact_leads table does not exist. Please run the migration file '005_create_leads_table.sql' in your Supabase SQL Editor."
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leads: {str(e)}"
        )


@router.get("/{lead_id}", response_model=ContactLead)
async def get_lead(
    lead_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Get lead details (admin only).
    
    Returns:
        Lead details
    """
    try:
        response = db.table("contact_leads").select("*").eq("id", lead_id).execute()
        
        if not response.data:
            raise NotFoundError("Lead", lead_id)
        
        return ContactLead(**response.data[0])
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lead: {str(e)}"
        )


@router.put("/{lead_id}", response_model=ContactLead)
async def update_lead(
    lead_id: str = Depends(validate_uuid_param),
    lead_update: ContactLeadUpdate = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Update lead (admin only).
    
    Returns:
        Updated lead details
    """
    try:
        existing = db.table("contact_leads").select("*").eq("id", lead_id).execute()
        if not existing.data:
            raise NotFoundError("Lead", lead_id)
        
        old_values = existing.data[0]
        
        update_data = lead_update.model_dump(exclude_unset=True)
        if update_data:
            from datetime import datetime
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = db.table("contact_leads").update(update_data).eq("id", lead_id).execute()
            
            AuditService.log_action(
                user_id=current_user.id,
                action="lead.updated",
                resource_type="lead",
                resource_id=lead_id,
                old_values=old_values,
                new_values=response.data[0] if response.data else update_data
            )
            
            return ContactLead(**response.data[0])
        
        return ContactLead(**old_values)
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lead: {str(e)}"
        )


@router.post("/{lead_id}/convert", response_model=ContactLead)
async def convert_lead_to_user(
    lead_id: str = Depends(validate_uuid_param),
    convert_data: ContactLeadConvert = None,
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Convert lead to user (admin only).
    Creates a user account from lead data.
    
    Returns:
        Updated lead with converted_to_user_id
    """
    try:
        lead_response = db.table("contact_leads").select("*").eq("id", lead_id).execute()
        if not lead_response.data:
            raise NotFoundError("Lead", lead_id)
        
        lead = lead_response.data[0]
        
        if lead.get("converted_to_user_id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lead already converted to user"
            )
        
        admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        user_data = {
            "email": lead["email"],
            "password": convert_data.password,
            "email_confirm": True,
            "user_metadata": {
                "name": lead["name"],
                "phone": lead.get("phone")
            }
        }
        
        async with httpx.AsyncClient() as client:
            create_response = await client.post(
                admin_api_url,
                headers=headers,
                json=user_data,
                timeout=10.0
            )
            
            if create_response.status_code not in [200, 201]:
                error_msg = create_response.json().get("msg", "Failed to create user")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: {error_msg}"
                )
            
            user = create_response.json()
            user_id = user.get("id")
            
            profile_data = {
                "id": user_id,
                "name": lead["name"],
                "phone": lead.get("phone"),
                "role": convert_data.role
            }
            
            try:
                db.table("user_profiles").insert(profile_data).execute()
            except Exception:
                db.table("user_profiles").update({
                    "name": lead["name"],
                    "phone": lead.get("phone"),
                    "role": convert_data.role
                }).eq("id", user_id).execute()
            
            from datetime import datetime
            update_data = {
                "status": "converted",
                "converted_to_user_id": user_id,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            updated_lead = db.table("contact_leads").update(update_data).eq("id", lead_id).execute()
            
            AuditService.log_action(
                user_id=current_user.id,
                action="lead.converted",
                resource_type="lead",
                resource_id=lead_id,
                old_values=lead,
                new_values=updated_lead.data[0] if updated_lead.data else update_data
            )
            
            return ContactLead(**updated_lead.data[0])
    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to convert lead: {str(e)}"
        )


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str = Depends(validate_uuid_param),
    db: Client = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """
    Delete lead (admin only).
    """
    try:
        existing = db.table("contact_leads").select("*").eq("id", lead_id).execute()
        if not existing.data:
            raise NotFoundError("Lead", lead_id)
        
        AuditService.log_action(
            user_id=current_user.id,
            action="lead.deleted",
            resource_type="lead",
            resource_id=lead_id,
            old_values=existing.data[0]
        )
        
        db.table("contact_leads").delete().eq("id", lead_id).execute()
        
        return None
    except NotFoundError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete lead: {str(e)}"
        )
