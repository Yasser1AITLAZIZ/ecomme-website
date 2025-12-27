"""iPhone trade-in routes."""
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
from app.schemas.admin import TradeInRequestCreate, TradeInRequest
from app.core.security import sanitize_dict
from app.core.rate_limit import rate_limit
from supabase import Client
import httpx
from app.config import settings
import json

router = APIRouter(prefix="/trade-in", tags=["Trade-In"])


@router.get("", response_model=List[TradeInRequest])
@rate_limit("30/minute")
async def get_trade_in_requests(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Get trade-in requests for the authenticated user.
    
    Returns:
        List of trade-in requests
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        # Get requests by user_id or email
        response = db.table("iphone_trade_in_requests").select("*").or_(
            f"user_id.eq.{current_user.id},email.eq.{current_user.email}"
        ).order("created_at", desc=True).execute()
        
        return [TradeInRequest(**item) for item in response.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trade-in requests: {str(e)}"
        )


@router.post("", response_model=TradeInRequest, status_code=status.HTTP_201_CREATED)
@rate_limit("10/hour")
async def submit_trade_in_request(
    request: Request,
    trade_in_data: TradeInRequestCreate,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Submit iPhone trade-in request and create a record.
    
    Returns:
        Created trade-in request
    """
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Sanitize inputs
        sanitized_data = sanitize_dict({
            "name": trade_in_data.name,
            "iphone_model": trade_in_data.iphone_model,
            "storage_capacity": trade_in_data.storage_capacity,
            "color": trade_in_data.color or "",
            "condition": trade_in_data.condition,
            "imei": trade_in_data.imei or "",
            "notes": trade_in_data.notes or ""
        })
        
        # Prepare data for insertion
        request_data = {
            "name": sanitized_data["name"],
            "email": trade_in_data.email.lower().strip(),
            "phone": trade_in_data.phone,
            "iphone_model": sanitized_data["iphone_model"],
            "storage_capacity": sanitized_data["storage_capacity"],
            "color": sanitized_data["color"] if sanitized_data["color"] else None,
            "condition": sanitized_data["condition"],
            "imei": sanitized_data["imei"] if sanitized_data["imei"] else None,
            "photos_urls": trade_in_data.photos_urls or [],
            "notes": sanitized_data["notes"] if sanitized_data["notes"] else None,
            "status": "pending",
            "ip_address": client_ip,
            "user_agent": user_agent
        }
        
        # Add user_id if user is authenticated
        if current_user:
            request_data["user_id"] = current_user.id
        
        # Insert into database
        response = db.table("iphone_trade_in_requests").insert(request_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create trade-in request"
            )
        
        created_request = response.data[0]
        
        # Send email notification via Edge Function
        try:
            edge_function_url = f"{settings.SUPABASE_URL}/functions/v1/send-trade-in-notification"
            
            email_payload = {
                "trade_in_id": created_request["id"],
                "name": created_request["name"],
                "email": created_request["email"],
                "phone": created_request.get("phone"),
                "iphone_model": created_request["iphone_model"],
                "storage_capacity": created_request["storage_capacity"],
                "color": created_request.get("color"),
                "condition": created_request["condition"],
                "imei": created_request.get("imei"),
                "photos_urls": trade_in_data.photos_urls or [],
                "notes": created_request.get("notes"),
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
                    print(f"Warning: Failed to send trade-in notification email: {email_response.text}")
        except Exception as e:
            # Log but don't fail the request
            print(f"Warning: Error sending trade-in notification email: {str(e)}")
        
        # Ensure photos_urls is a list (Supabase returns JSONB as list directly)
        if created_request.get("photos_urls") is None:
            created_request["photos_urls"] = []
        elif isinstance(created_request.get("photos_urls"), str):
            # Fallback: if somehow it's still a string, parse it
            try:
                created_request["photos_urls"] = json.loads(created_request["photos_urls"])
            except:
                created_request["photos_urls"] = []
        
        return TradeInRequest(**created_request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit trade-in request: {str(e)}"
        )


@router.get("/{trade_in_id}/pdf")
@rate_limit("30/minute")
async def get_trade_in_pdf(
    request: Request,
    trade_in_id: str = Path(..., description="Trade-in request ID"),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    lang: str = Depends(get_language)
):
    """
    Generate and download trade-in request confirmation as PDF.
    
    Returns:
        PDF file stream
    """
    # Validate UUID format
    if not validate_uuid_param(trade_in_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid trade-in request ID format"
        )
    
    try:
        # Get trade-in request
        response = db.table("iphone_trade_in_requests").select("*").eq("id", trade_in_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trade-in request not found"
            )
        
        trade_in = response.data[0]
        
        # Check if user has access (if authenticated)
        if current_user:
            if trade_in.get("user_id") != current_user.id and trade_in.get("email") != current_user.email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Translations for PDF
        translations = {
            "fr": {
                "trade_in_confirmation": "Confirmation de Demande de Reprise",
                "request_number": "Numéro de demande",
                "date": "Date",
                "customer_info": "Informations client",
                "device_info": "Informations appareil",
                "name": "Nom",
                "email": "Email",
                "phone": "Téléphone",
                "model": "Modèle iPhone",
                "storage": "Capacité de stockage",
                "color": "Couleur",
                "condition": "État",
                "imei": "IMEI",
                "status": "Statut",
                "notes": "Notes supplémentaires",
                "photos": "Photos",
                "estimated_value": "Valeur estimée",
                "thank_you": "Merci pour votre demande de reprise!",
                "primo_store": "Primo Store",
                "pending": "En attente",
                "reviewing": "En cours d'examen",
                "approved": "Approuvé",
                "rejected": "Rejeté",
                "completed": "Terminé",
                "excellent": "Excellent",
                "very_good": "Très bon",
                "good": "Bon",
                "acceptable": "Acceptable",
                "damaged": "Endommagé"
            },
            "en": {
                "trade_in_confirmation": "Trade-In Request Confirmation",
                "request_number": "Request Number",
                "date": "Date",
                "customer_info": "Customer Information",
                "device_info": "Device Information",
                "name": "Name",
                "email": "Email",
                "phone": "Phone",
                "model": "iPhone Model",
                "storage": "Storage Capacity",
                "color": "Color",
                "condition": "Condition",
                "imei": "IMEI",
                "status": "Status",
                "notes": "Additional Notes",
                "photos": "Photos",
                "estimated_value": "Estimated Value",
                "thank_you": "Thank you for your trade-in request!",
                "primo_store": "Primo Store",
                "pending": "Pending",
                "reviewing": "Reviewing",
                "approved": "Approved",
                "rejected": "Rejected",
                "completed": "Completed",
                "excellent": "Excellent",
                "very_good": "Very Good",
                "good": "Good",
                "acceptable": "Acceptable",
                "damaged": "Damaged"
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
        
        # Bold text style
        bold_style = ParagraphStyle(
            'BoldText',
            parent=styles['Normal'],
            fontSize=11,
            alignment=TA_LEFT if not is_rtl else TA_RIGHT,
            textColor=colors.HexColor('#1a1a1a'),
            fontName='Helvetica-Bold',
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
        story.append(Paragraph(t["trade_in_confirmation"], title_style))
        story.append(Spacer(1, 0.4*inch))
        
        # Request info
        request_date = datetime.fromisoformat(trade_in["created_at"].replace('Z', '+00:00'))
        request_info_data = [
            [t["request_number"], trade_in["id"][:8].upper()],
            [t["date"], request_date.strftime("%Y-%m-%d %H:%M")],
            [t["status"], t.get(trade_in["status"], trade_in["status"])],
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
            [t["name"], trade_in["name"]],
            [t["email"], trade_in["email"]],
        ]
        if trade_in.get("phone"):
            customer_data.append([t["phone"], trade_in["phone"]])
        
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
        device_data = [
            [t["model"], trade_in["iphone_model"]],
            [t["storage"], trade_in["storage_capacity"]],
        ]
        if trade_in.get("color"):
            device_data.append([t["color"], trade_in["color"]])
        
        condition_text = t.get(trade_in["condition"], trade_in["condition"].replace("_", " ").title())
        device_data.append([t["condition"], condition_text])
        
        if trade_in.get("imei"):
            device_data.append([t["imei"], trade_in["imei"]])
        
        if trade_in.get("estimated_value"):
            device_data.append([t["estimated_value"], f"{float(trade_in['estimated_value']):.2f} MAD"])
        
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
        if trade_in.get("notes"):
            story.append(Paragraph(t["notes"], heading_style))
            story.append(Paragraph(trade_in["notes"], normal_style))
            story.append(Spacer(1, 0.3*inch))
        
        # Photos info
        photos_urls = trade_in.get("photos_urls", [])
        if photos_urls and len(photos_urls) > 0:
            story.append(Paragraph(f"{t['photos']}: {len(photos_urls)}", heading_style))
            story.append(Paragraph(f"{t['photos']} are available in your email confirmation.", normal_style))
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
            filename_prefix = "demande_reprise"
        else:
            filename_prefix = "trade_in_request"
        filename = f"{filename_prefix}_{trade_in['id'][:8]}.pdf"
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

