"""Contact form routes."""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from app.api.v1.deps import get_db, get_language
from app.schemas.admin import ContactLeadCreate, ContactLead
from app.core.security import sanitize_dict
from supabase import Client
from datetime import datetime

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactLead, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    request: Request,
    contact_data: ContactLeadCreate,
    db: Client = Depends(get_db),
    lang: str = Depends(get_language)
):
    """
    Submit contact form and create a lead.
    
    Returns:
        Created lead
    """
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        lead_data = {
            "name": sanitize_dict({"name": contact_data.name})["name"],
            "email": contact_data.email.lower().strip(),
            "phone": contact_data.phone,
            "subject": sanitize_dict({"subject": contact_data.subject})["subject"],
            "message": sanitize_dict({"message": contact_data.message})["message"],
            "status": "new",
            "ip_address": client_ip,
            "user_agent": user_agent
        }
        
        response = db.table("contact_leads").insert(lead_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create lead"
            )
        
        return ContactLead(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit contact form: {str(e)}"
        )
