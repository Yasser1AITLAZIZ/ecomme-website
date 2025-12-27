"""Pre-order routes."""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Path
from fastapi.responses import StreamingResponse
from typing import Optional, List
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from app.api.v1.deps import get_db, get_language, get_current_user_optional, validate_uuid_param
from app.core.security import sanitize_dict
from app.core.rate_limit import rate_limit
from supabase import Client
import httpx
from app.config import settings
import json
from pydantic import BaseModel

router = APIRouter(prefix="/pre-order", tags=["Pre-Order"])


class PreOrderCreate(BaseModel):
    device_type: str
    device_model: str
    storage_capacity: str
    color: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    notes: Optional[str] = None


class PreOrder(BaseModel):
    id: str
    device_type: str
    device_model: str
    storage_capacity: str
    color: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    notes: Optional[str] = None
    status: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: str
    updated_at: str


@router.get("", response_model=List[PreOrder])
@rate_limit("30/minute")
async def get_pre_orders(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Get pre-orders for the authenticated user.
    
    Returns:
        List of pre-orders
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        # Get pre-orders by user_id or email
        response = db.table("pre_orders").select("*").or_(
            f"user_id.eq.{current_user.id},email.eq.{current_user.email}"
        ).order("created_at", desc=True).execute()
        
        return [PreOrder(**item) for item in response.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pre-orders: {str(e)}"
        )


@router.post("", response_model=PreOrder, status_code=status.HTTP_201_CREATED)
@rate_limit("10/hour")
async def submit_pre_order(
    request: Request,
    pre_order_data: PreOrderCreate,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Submit pre-order request and create a record.
    
    Returns:
        Created pre-order
    """
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Sanitize inputs
        sanitized_data = sanitize_dict({
            "name": pre_order_data.name,
            "device_model": pre_order_data.device_model,
            "storage_capacity": pre_order_data.storage_capacity,
            "color": pre_order_data.color or "",
            "notes": pre_order_data.notes or ""
        })
        
        # Prepare data for insertion
        request_data = {
            "device_type": pre_order_data.device_type,
            "device_model": sanitized_data["device_model"],
            "storage_capacity": sanitized_data["storage_capacity"],
            "color": sanitized_data["color"] if sanitized_data["color"] else None,
            "name": sanitized_data["name"],
            "email": pre_order_data.email.lower().strip(),
            "phone": pre_order_data.phone,
            "notes": sanitized_data["notes"] if sanitized_data["notes"] else None,
            "status": "pending",
            "ip_address": client_ip,
            "user_agent": user_agent
        }
        
        # Add user_id if user is authenticated
        if current_user:
            request_data["user_id"] = current_user.id
        
        # Insert into database
        response = db.table("pre_orders").insert(request_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create pre-order"
            )
        
        created_order = response.data[0]
        
        # Send email notification via Edge Function
        try:
            edge_function_url = f"{settings.SUPABASE_URL}/functions/v1/send-pre-order-notification"
            
            email_payload = {
                "pre_order_id": created_order["id"],
                "name": created_order["name"],
                "email": created_order["email"],
                "phone": created_order.get("phone"),
                "device_type": created_order["device_type"],
                "device_model": created_order["device_model"],
                "storage_capacity": created_order["storage_capacity"],
                "color": created_order.get("color"),
                "notes": created_order.get("notes"),
                "language": lang
            }
            
            async with httpx.AsyncClient() as client:
                email_response = await client.post(
                    edge_function_url,
                    json=email_payload,
                    headers={
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )
                if email_response.status_code != 200:
                    # Log but don't fail the request
                    print(f"Warning: Failed to send pre-order notification email: {email_response.text}")
        except Exception as e:
            # Log but don't fail the request
            print(f"Warning: Error sending pre-order notification email: {str(e)}")
        
        return PreOrder(**created_order)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit pre-order: {str(e)}"
        )


@router.get("/{pre_order_id}/pdf")
@rate_limit("30/minute")
async def get_pre_order_pdf(
    request: Request,
    pre_order_id: str = Path(..., description="Pre-order ID"),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Generate and download pre-order request confirmation as PDF.
    
    Returns:
        PDF file stream
    """
    # Validate UUID format
    if not validate_uuid_param(pre_order_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid pre-order ID format"
        )
    
    try:
        # Get pre-order
        response = db.table("pre_orders").select("*").eq("id", pre_order_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pre-order not found"
            )
        
        pre_order = response.data[0]
        
        # Check if user has access (if authenticated)
        if current_user:
            if pre_order.get("user_id") != current_user.id and pre_order.get("email") != current_user.email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Translations for PDF
        translations = {
            "fr": {
                "pre_order_confirmation": "Confirmation de Précommande",
                "request_number": "Numéro de précommande",
                "date": "Date",
                "customer_info": "Informations client",
                "device_info": "Informations appareil",
                "name": "Nom",
                "email": "Email",
                "phone": "Téléphone",
                "device_type": "Type d'appareil",
                "model": "Modèle",
                "storage": "Capacité de stockage",
                "color": "Couleur",
                "status": "Statut",
                "notes": "Notes supplémentaires",
                "thank_you": "Merci pour votre précommande!",
                "primo_store": "Primo Store",
                "pending": "En attente",
                "notified": "Notifié",
                "completed": "Terminé",
                "cancelled": "Annulé",
            },
            "en": {
                "pre_order_confirmation": "Pre-Order Confirmation",
                "request_number": "Pre-Order Number",
                "date": "Date",
                "customer_info": "Customer Information",
                "device_info": "Device Information",
                "name": "Name",
                "email": "Email",
                "phone": "Phone",
                "device_type": "Device Type",
                "model": "Model",
                "storage": "Storage Capacity",
                "color": "Color",
                "status": "Status",
                "notes": "Additional Notes",
                "thank_you": "Thank you for your pre-order!",
                "primo_store": "Primo Store",
                "pending": "Pending",
                "notified": "Notified",
                "completed": "Completed",
                "cancelled": "Cancelled",
            }
        }
        
        # Get translations based on language
        t = translations.get(lang, translations["fr"])
        is_rtl = False
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
        story = []
        
        # Styles
        styles = getSampleStyleSheet()
        
        # Company title style
        company_title_style = ParagraphStyle(
            'CompanyTitle',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#fbbf24'),
            spaceAfter=8,
            alignment=TA_CENTER if not is_rtl else TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        
        # Title style
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=20,
            alignment=TA_CENTER if not is_rtl else TA_RIGHT,
            fontName='Helvetica'
        )
        
        # Section heading style
        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=8,
            spaceBefore=12,
            alignment=TA_LEFT if not is_rtl else TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        
        # Normal text style
        normal_style = ParagraphStyle(
            'NormalText',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_LEFT if not is_rtl else TA_RIGHT,
            textColor=colors.HexColor('#333333'),
            leading=14
        )
        
        # Footer style
        footer_style = ParagraphStyle(
            'FooterText',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER if not is_rtl else TA_RIGHT,
            textColor=colors.HexColor('#666666'),
            leading=12
        )
        
        # Header Section
        story.append(Paragraph(t["primo_store"], company_title_style))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(t["pre_order_confirmation"], title_style))
        story.append(Spacer(1, 0.4*inch))
        
        # Request info
        request_date = datetime.fromisoformat(pre_order["created_at"].replace('Z', '+00:00'))
        request_info_data = [
            [t["request_number"], pre_order["id"][:8].upper()],
            [t["date"], request_date.strftime("%Y-%m-%d %H:%M")],
            [t["status"], t.get(pre_order["status"], pre_order["status"])],
        ]
        
        request_info_table = Table(request_info_data, colWidths=[2.2*inch, 4.3*inch])
        request_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f9fafb')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        story.append(request_info_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Customer Information
        story.append(Paragraph(t["customer_info"], heading_style))
        customer_data = [
            [t["name"], pre_order["name"]],
            [t["email"], pre_order["email"]],
        ]
        if pre_order.get("phone"):
            customer_data.append([t["phone"], pre_order["phone"]])
        
        customer_table = Table(customer_data, colWidths=[2.2*inch, 4.3*inch])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f9fafb')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        story.append(customer_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Device Information
        story.append(Paragraph(t["device_info"], heading_style))
        device_type_text = "iPhone" if pre_order["device_type"] == "iphone" else "Android"
        device_data = [
            [t["device_type"], device_type_text],
            [t["model"], pre_order["device_model"]],
            [t["storage"], pre_order["storage_capacity"]],
        ]
        if pre_order.get("color"):
            device_data.append([t["color"], pre_order["color"]])
        
        device_table = Table(device_data, colWidths=[2.2*inch, 4.3*inch])
        device_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f9fafb')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        story.append(device_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Notes
        if pre_order.get("notes"):
            story.append(Paragraph(t["notes"], heading_style))
            story.append(Paragraph(pre_order["notes"], normal_style))
            story.append(Spacer(1, 0.3*inch))
        
        # Thank you message
        story.append(Spacer(1, 0.4*inch))
        story.append(Paragraph(t["thank_you"], footer_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Footer
        footer_text = f"{t['primo_store']} - {t.get('footer_note', 'Thank you for your business!')}"
        story.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF as streaming response
        if lang == "fr":
            filename_prefix = "precommande"
        else:
            filename_prefix = "pre_order"
        filename = f"{filename_prefix}_{pre_order['id'][:8]}.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )

