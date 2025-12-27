"""Order routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Path
from fastapi.exceptions import RequestValidationError
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from io import BytesIO
import httpx
import logging
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from app.api.v1.deps import get_db, get_current_user, get_current_user_optional, validate_uuid_param, get_language
from app.core.i18n import t
from app.core.permissions import require_admin
from app.core.security import validate_uuid
from app.schemas.order import Order, OrderCreate, OrderUpdate, OrderStatusUpdate, OrderItem, RecentOrder
from app.core.rate_limit import rate_limit
from app.core.exceptions import NotFoundError
from app.services.order_service import OrderService
from app.services.cart_service import CartService
from app.config import settings
from supabase import Client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/recent", response_model=List[RecentOrder])
@rate_limit("60/minute")
async def get_recent_orders(
    request: Request,
    db: Client = Depends(get_db)
):
    """
    Get recent orders for public display (no authentication required).
    
    Returns:
        List of recent paid orders from the last 48 hours with product names
    """
    try:
        # Calculate time threshold (last 48 hours)
        threshold = datetime.now(timezone.utc) - timedelta(hours=48)
        threshold_iso = threshold.isoformat()
        
        # Get recent paid orders
        orders_query = db.table("orders").select(
            """
            id,
            created_at
            """
        ).eq("payment_status", "paid").gte(
            "created_at", threshold_iso
        ).order("created_at", desc=True).limit(20).execute()
        
        if not orders_query.data:
            return []
        
        # Get order items with product names for each order
        result = []
        for order in orders_query.data:
            # Get first order item with product name
            items_response = db.table("order_items").select(
                """
                quantity,
                products:product_id (
                    name
                )
                """
            ).eq("order_id", order["id"]).limit(1).execute()
            
            if items_response.data and len(items_response.data) > 0:
                item = items_response.data[0]
                product = item.get("products", {})
                # Handle case where products might be a list or dict
                if isinstance(product, list) and len(product) > 0:
                    product = product[0]
                elif not isinstance(product, dict):
                    product = {}
                
                product_name = product.get("name") if product and isinstance(product, dict) else "Product"
                quantity = item.get("quantity", 1)
                
                # Parse datetime safely
                try:
                    created_at_str = order["created_at"]
                    if created_at_str.endswith("Z"):
                        created_at_str = created_at_str.replace("Z", "+00:00")
                    created_at = datetime.fromisoformat(created_at_str)
                except (ValueError, KeyError):
                    # Skip this order if datetime parsing fails
                    continue
                
                result.append(RecentOrder(
                    id=order["id"],
                    created_at=created_at,
                    product_name=product_name,
                    quantity=quantity
                ))
        
        return result
    except Exception as e:
        # Return empty list on error to allow graceful fallback
        return []


@router.get("", response_model=List[Order])
@rate_limit("100/minute")
async def get_orders(
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user's orders.
    
    Returns:
        List of user's orders
    """
    order_service = OrderService(db)
    orders = order_service.get_user_orders(current_user.id)
    
    # Convert to Order schema
    result = []
    for order in orders:
        # Get order items
        items_response = db.table("order_items").select(
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
        ).eq("order_id", order["id"]).execute()
        
        items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        result.append(Order(
            id=order["id"],
            order_number=order["order_number"],
            user_id=order.get("user_id"),
            guest_email=order.get("guest_email"),
            guest_phone=order.get("guest_phone"),
            subtotal=order["subtotal"],
            shipping_cost=order["shipping_cost"],
            discount_amount=order["discount_amount"],
            total=order["total"],
            currency=order["currency"],
            status=order["status"],
            payment_method=order.get("payment_method"),
            payment_status=order["payment_status"],
            payment_intent_id=order.get("payment_intent_id"),
            shipping_method_id=order.get("shipping_method_id"),
            shipping_address=order["shipping_address"],
            billing_address=order.get("billing_address"),
            notes=order.get("notes"),
            admin_notes=order.get("admin_notes"),
            created_at=order["created_at"],
            updated_at=order["updated_at"],
            items=items
        ))
    
    return result


@router.get("/{order_id}", response_model=Order)
@rate_limit("100/minute")
async def get_order(
    request: Request,
    order_id: str = Path(..., description="Order ID"),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user),
    lang: str = Depends(get_language)
):
    """
    Get order details.
    
    Returns:
        Order details with items
    """
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=t("validation_failed", lang)
        )
    
    order_service = OrderService(db)
    
    try:
        order = order_service.get_order(order_id, current_user.id)
        
        # Get order items
        items_response = db.table("order_items").select(
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
            # Get product image - try primary first, then any image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            else:
                # If no primary image, get any image for this product
                any_images = db.table("product_images").select("image_url").eq(
                    "product_id", item["product_id"]
                ).order("order").limit(1).execute()
                if any_images.data:
                    product_image = any_images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=order["id"],
            order_number=order["order_number"],
            user_id=order.get("user_id"),
            guest_email=order.get("guest_email"),
            guest_phone=order.get("guest_phone"),
            subtotal=order["subtotal"],
            shipping_cost=order["shipping_cost"],
            discount_amount=order["discount_amount"],
            total=order["total"],
            currency=order["currency"],
            status=order["status"],
            payment_method=order.get("payment_method"),
            payment_status=order["payment_status"],
            payment_intent_id=order.get("payment_intent_id"),
            shipping_method_id=order.get("shipping_method_id"),
            shipping_address=order["shipping_address"],
            billing_address=order.get("billing_address"),
            notes=order.get("notes"),
            admin_notes=order.get("admin_notes"),
            created_at=order["created_at"],
            updated_at=order["updated_at"],
            items=items
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("resource_not_found", lang))


@router.get("/{order_id}/invoice/pdf")
@rate_limit("30/minute")
async def get_order_invoice_pdf(
    request: Request,
    order_id: str = Path(..., description="Order ID"),
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user),
    lang: str = Depends(get_language)
):
    """
    Generate and download order invoice as PDF.
    
    Returns:
        PDF file stream
    """
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=t("validation_failed", lang)
        )
    
    order_service = OrderService(db)
    
    try:
        # Get order details
        order = order_service.get_order(order_id, current_user.id)
        
        # Get order items
        items_response = db.table("order_items").select(
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
            items.append({
                "name": product.get("name") if product else "Unknown Product",
                "quantity": item["quantity"],
                "price": float(item["price"]),
                "total": float(item["price"]) * item["quantity"]
            })
        
        # Translations for PDF
        translations = {
            "fr": {
                "order_confirmation": "Bon de Commande",
                "order_number": "Numéro de commande",
                "date": "Date",
                "shipping_address": "Adresse de livraison",
                "delivery_method": "Méthode de livraison",
                "delivery": "Livraison",
                "pickup": "Retrait en magasin",
                "payment_method": "Méthode de paiement",
                "cod": "Paiement à la livraison",
                "items": "Articles",
                "product": "Produit",
                "quantity": "Quantité",
                "unit_price": "Prix unitaire",
                "total": "Total",
                "subtotal": "Sous-total",
                "shipping": "Livraison",
                "discount": "Remise",
                "total_amount": "Montant total",
                "thank_you": "Merci pour votre achat!",
                "primo_store": "Primo Store"
            },
            "en": {
                "order_confirmation": "Order Confirmation",
                "order_number": "Order Number",
                "date": "Date",
                "shipping_address": "Shipping Address",
                "delivery_method": "Delivery Method",
                "delivery": "Delivery",
                "pickup": "Store Pickup",
                "payment_method": "Payment Method",
                "cod": "Cash on Delivery (COD)",
                "items": "Items",
                "product": "Product",
                "quantity": "Quantity",
                "unit_price": "Unit Price",
                "total": "Total",
                "subtotal": "Subtotal",
                "shipping": "Shipping",
                "discount": "Discount",
                "total_amount": "Total Amount",
                "thank_you": "Thank you for your purchase!",
                "primo_store": "Primo Store"
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
        
        # Company title style - large and prominent
        company_title_style = ParagraphStyle(
            'CompanyTitle',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#fbbf24'),
            spaceAfter=8,
            alignment=TA_CENTER if not is_rtl else TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        
        # Invoice title style
        invoice_title_style = ParagraphStyle(
            'InvoiceTitle',
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
        
        # Bold text style for summary
        bold_style = ParagraphStyle(
            'BoldText',
            parent=styles['Normal'],
            fontSize=11,
            alignment=TA_LEFT if not is_rtl else TA_RIGHT,
            textColor=colors.HexColor('#1a1a1a'),
            fontName='Helvetica-Bold',
            leading=14
        )
        
        # Total amount bold style
        total_bold_style = ParagraphStyle(
            'TotalBold',
            parent=styles['Normal'],
            fontSize=13,
            alignment=TA_LEFT if not is_rtl else TA_RIGHT,
            textColor=colors.HexColor('#fbbf24'),
            fontName='Helvetica-Bold',
            leading=16
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
        
        # Header Section - Modern and Professional
        story.append(Paragraph(t["primo_store"], company_title_style))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(t["order_confirmation"], invoice_title_style))
        story.append(Spacer(1, 0.4*inch))
        
        # Order info in a styled box
        order_date = datetime.fromisoformat(order["created_at"].replace('Z', '+00:00'))
        order_info_data = [
            [t["order_number"], order["order_number"]],
            [t["date"], order_date.strftime("%Y-%m-%d %H:%M")],
        ]
        
        order_info_table = Table(order_info_data, colWidths=[2.2*inch, 4.3*inch])
        order_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f9fafb')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a1a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        story.append(order_info_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Shipping address section
        if order.get("shipping_address"):
            story.append(Paragraph(t["shipping_address"], heading_style))
            shipping_addr = order["shipping_address"]
            address_parts = []
            if shipping_addr.get("street"):
                address_parts.append(shipping_addr.get("street"))
            city_state = f"{shipping_addr.get('city', '')}, {shipping_addr.get('state', '')}".strip(', ')
            if city_state:
                address_parts.append(city_state)
            zip_country = f"{shipping_addr.get('zipCode', '')} {shipping_addr.get('country', 'Morocco')}".strip()
            if zip_country:
                address_parts.append(zip_country)
            
            for part in address_parts:
                if part.strip():
                    story.append(Paragraph(part.strip(), normal_style))
            story.append(Spacer(1, 0.25*inch))
        
        # Delivery and payment info
        delivery_type = order.get("delivery_type", "delivery")
        story.append(Paragraph(f"{t['delivery_method']}: {t[delivery_type]}", normal_style))
        payment_method = order.get("payment_method", "cod")
        payment_text = t["cod"] if payment_method == "cod" else payment_method
        story.append(Paragraph(f"{t['payment_method']}: {payment_text}", normal_style))
        story.append(Spacer(1, 0.4*inch))
        
        # Items table with modern styling
        story.append(Paragraph(t["items"], heading_style))
        story.append(Spacer(1, 0.15*inch))
        
        items_data = [[t["product"], t["quantity"], t["unit_price"], t["total"]]]
        for item in items:
            items_data.append([
                item["name"],
                str(item["quantity"]),
                f"{item['price']:.2f} {order['currency']}",
                f"{item['total']:.2f} {order['currency']}"
            ])
        
        items_table = Table(items_data, colWidths=[3.2*inch, 0.9*inch, 1.4*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#fbbf24')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 14),
            ('TOPPADDING', (0, 0), (-1, 0), 14),
            ('LEFTPADDING', (0, 0), (-1, 0), 12),
            ('RIGHTPADDING', (0, 0), (-1, 0), 12),
            # Data rows styling
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1a1a1a')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('LEFTPADDING', (0, 1), (-1, -1), 12),
            ('RIGHTPADDING', (0, 1), (-1, -1), 12),
            # Alignment
            ('ALIGN', (0, 0), (0, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT' if not is_rtl else 'LEFT'),
            ('ALIGN', (3, 0), (3, -1), 'RIGHT' if not is_rtl else 'LEFT'),
            # Borders and grid
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#fbbf24')),
            # Alternating row backgrounds
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        story.append(items_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Summary section with proper styling (no HTML tags)
        summary_data = []
        
        # Subtotal row
        subtotal_label = Paragraph(t["subtotal"], normal_style)
        subtotal_value = Paragraph(f"{float(order['subtotal']):.2f} {order['currency']}", normal_style)
        summary_data.append([subtotal_label, subtotal_value])
        
        # Shipping row
        shipping_label = Paragraph(t["shipping"], normal_style)
        shipping_value = Paragraph(f"{float(order['shipping_cost']):.2f} {order['currency']}", normal_style)
        summary_data.append([shipping_label, shipping_value])
        
        # Discount row (only if discount > 0)
        if order.get("discount_amount") and float(order["discount_amount"]) > 0:
            discount_label = Paragraph(t["discount"], normal_style)
            discount_value = Paragraph(f"-{float(order['discount_amount']):.2f} {order['currency']}", normal_style)
            summary_data.append([discount_label, discount_value])
        
        # Total row - using bold style instead of HTML
        total_label = Paragraph(t['total_amount'], total_bold_style)
        total_value = Paragraph(f"{float(order['total']):.2f} {order['currency']}", total_bold_style)
        summary_data.append([total_label, total_value])
        
        summary_table = Table(summary_data, colWidths=[4.5*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -2), 'LEFT' if not is_rtl else 'RIGHT'),
            ('ALIGN', (1, 0), (1, -2), 'RIGHT' if not is_rtl else 'LEFT'),
            ('ALIGN', (0, -1), (0, -1), 'LEFT' if not is_rtl else 'RIGHT'),
            ('ALIGN', (1, -1), (1, -1), 'RIGHT' if not is_rtl else 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -2), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -2), 8),
            ('TOPPADDING', (0, -1), (-1, -1), 14),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 14),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            # Top border for total row
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#fbbf24')),
            ('SPACEABOVE', (0, -1), (-1, -1), 6)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.6*inch))
        
        # Thank you message with footer styling
        story.append(Paragraph(t["thank_you"], footer_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Footer with company info
        footer_text = f"{t['primo_store']} - {t.get('footer_note', 'Thank you for your business!')}"
        story.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Return PDF as streaming response
        # Use "bon_commande" for French, "order_confirmation" for English
        if lang == "fr":
            filename_prefix = "bon_commande"
        else:
            filename_prefix = "order_confirmation"
        filename = f"{filename_prefix}_{order['order_number']}.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("resource_not_found", lang))
    except Exception as e:
        logger.error(f"Error generating PDF invoice: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=t("internal_server_error", lang)
        )


@router.post("", response_model=Order, status_code=201)
@rate_limit("20/hour")
async def create_order(
    order_data: OrderCreate,
    request: Request,
    db: Client = Depends(get_db),
    current_user = Depends(get_current_user),
    lang: str = Depends(get_language)
):
    """
    Create a new order.
    
    Authentication is required to create an order.
    
    Returns:
        Created order
    """
    order_service = OrderService(db)
    cart_service = CartService(db)
    
    # Use items from request if provided, otherwise get from cart in DB
    if order_data.items and len(order_data.items) > 0:
        # Convert request items to order items format
        items = []
        for item in order_data.items:
            items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": float(item.price)
            })
    else:
        # Get cart items from DB - user must be authenticated
        cart_items = cart_service.get_user_cart(user_id=current_user.id)
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=t("cart_empty", lang)
            )
        
        # Convert cart items to order items format
        items = []
        for item in cart_items:
            items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": float(item["product_price"])
            })
    
    try:
        # Get IP and user agent
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        order = order_service.create_order(
            user_id=current_user.id,
            cart_items=items,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            shipping_method_id=order_data.shipping_method_id,
            payment_method=order_data.payment_method,
            coupon_code=order_data.coupon_code,
            notes=order_data.notes,
            delivery_type=order_data.delivery_type
        )
        
        # Get order with items
        full_order = order_service.get_order(order["id"], current_user.id)
        
        # Get customer email for confirmation email
        customer_email = None
        customer_name = None
        
        # Get user email from auth.users via Admin API
        try:
            admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            async with httpx.AsyncClient() as client:
                admin_response = await client.get(
                    f"{admin_api_url}/{current_user.id}",
                    headers=headers,
                    timeout=10.0
                )
                if admin_response.status_code == 200:
                    auth_user = admin_response.json()
                    customer_email = auth_user.get("email")
        except Exception as e:
            logger.warning(f"Failed to fetch user email: {str(e)}")
        
        # Get user name from profile
        profile = db.table("user_profiles").select("name").eq("id", current_user.id).execute()
        if profile.data:
            customer_name = profile.data[0].get("name")
        
        # Send order confirmation email (non-blocking)
        if customer_email:
            try:
                # #region agent log
                import json
                try:
                    with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"orders.py:695","message":"Starting email sending process","data":{"has_customer_email":True,"customer_email":customer_email,"order_id":order["id"],"order_number":full_order["order_number"]},"timestamp":__import__("time").time()*1000})+"\n")
                except: pass
                # #endregion
                # Prepare order items for email
                email_items = []
                items_for_email = db.table("order_items").select(
                    """
                    quantity,
                    price,
                    products:product_id (
                        name
                    )
                    """
                ).eq("order_id", order["id"]).execute()
                
                for item in items_for_email.data:
                    product = item.get("products", {})
                    email_items.append({
                        "product_name": product.get("name", "Unknown Product") if product else "Unknown Product",
                        "quantity": item["quantity"],
                        "price": float(item["price"])
                    })
                
                # #region agent log
                try:
                    with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"D","location":"orders.py:716","message":"Email payload prepared","data":{"email_items_count":len(email_items),"customer_email":customer_email,"order_number":full_order["order_number"],"has_items":len(email_items)>0},"timestamp":__import__("time").time()*1000})+"\n")
                except: pass
                # #endregion
                
                # Call Edge Function to send email
                edge_function_url = f"{settings.SUPABASE_URL}/functions/v1/send-order-confirmation"
                email_payload = {
                    "order_id": order["id"],
                    "order_number": full_order["order_number"],
                    "customer_email": customer_email,
                    "customer_name": customer_name,
                    "items": email_items,
                    "subtotal": float(full_order["subtotal"]),
                    "shipping_cost": float(full_order["shipping_cost"]),
                    "discount_amount": float(full_order["discount_amount"]),
                    "total": float(full_order["total"]),
                    "currency": full_order["currency"],
                    "delivery_type": full_order.get("delivery_type", "delivery"),
                    "shipping_address": full_order["shipping_address"],
                    "language": lang  # Pass language to Edge Function
                }
                
                # #region agent log
                try:
                    with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"orders.py:738","message":"Calling Edge Function","data":{"edge_function_url":edge_function_url,"has_payload":True,"payload_keys":list(email_payload.keys())},"timestamp":__import__("time").time()*1000})+"\n")
                except: pass
                # #endregion
                
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
                    # #region agent log
                    try:
                        with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                            f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"B","location":"orders.py:746","message":"Edge Function response received","data":{"status_code":email_response.status_code,"response_text":email_response.text[:200] if email_response.text else None,"is_success":email_response.status_code==200},"timestamp":__import__("time").time()*1000})+"\n")
                    except: pass
                    # #endregion
                    if email_response.status_code != 200:
                        logger.warning(f"Failed to send order confirmation email: {email_response.text}")
            except Exception as e:
                # #region agent log
                try:
                    with open(r"c:\Users\YasserAITLAZIZ\ecomme-website\.cursor\debug.log", "a", encoding="utf-8") as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"B","location":"orders.py:750","message":"Exception in email sending","data":{"error_type":type(e).__name__,"error_message":str(e)},"timestamp":__import__("time").time()*1000})+"\n")
                except: pass
                # #endregion
                # Log error but don't fail order creation
                logger.error(f"Error sending order confirmation email: {str(e)}", exc_info=True)
        
        # Get order items for response
        items_response = db.table("order_items").select(
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
        ).eq("order_id", order["id"]).execute()
        
        order_items = []
        for item in items_response.data:
            product = item.get("products", {})
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            order_items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=full_order["id"],
            order_number=full_order["order_number"],
            user_id=full_order.get("user_id"),
            guest_email=full_order.get("guest_email"),
            guest_phone=full_order.get("guest_phone"),
            subtotal=full_order["subtotal"],
            shipping_cost=full_order["shipping_cost"],
            discount_amount=full_order["discount_amount"],
            total=full_order["total"],
            currency=full_order["currency"],
            status=full_order["status"],
            payment_method=full_order.get("payment_method"),
            payment_status=full_order["payment_status"],
            payment_intent_id=full_order.get("payment_intent_id"),
            shipping_method_id=full_order.get("shipping_method_id"),
            delivery_type=full_order.get("delivery_type"),
            shipping_address=full_order["shipping_address"],
            billing_address=full_order.get("billing_address"),
            notes=full_order.get("notes"),
            admin_notes=full_order.get("admin_notes"),
            created_at=full_order["created_at"],
            updated_at=full_order["updated_at"],
            items=order_items
        )
    except NotFoundError as e:
        logger.error(f"Order creation failed - Not Found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=t("resource_not_found", lang)
        )
    except ValueError as e:
        logger.error(f"Order creation failed - Validation Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=t("validation_failed", lang)
        )
    except Exception as e:
        logger.error(f"Order creation failed - Unexpected Error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=t("order_create_failed", lang)
        )


@router.put("/{order_id}/status", response_model=Order)
@rate_limit("60/minute")
async def update_order_status(
    request: Request,
    order_id: str = Path(..., description="Order ID"),
    status_update: OrderStatusUpdate = None,
    db: Client = Depends(get_db),
    current_user = Depends(require_admin),
    lang: str = Depends(get_language)
):
    """
    Update order status (Admin only).
    
    Returns:
        Updated order
    """
    # Validate UUID format
    if not validate_uuid(order_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=t("validation_failed", lang)
        )
    
    order_service = OrderService(db)
    
    try:
        updated_order = order_service.update_order_status(
            order_id=order_id,
            status=status_update.status,
            admin_id=current_user.id,
            notes=status_update.notes
        )
        
        # Get full order with items
        full_order = order_service.get_order(order_id)
        
        # Get order items
        items_response = db.table("order_items").select(
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
            # Get product image
            images = db.table("product_images").select("image_url").eq(
                "product_id", item["product_id"]
            ).eq("is_primary", True).limit(1).execute()
            
            product_image = None
            if images.data:
                product_image = images.data[0]["image_url"]
            
            items.append(OrderItem(
                id=item["id"],
                order_id=item["order_id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
                created_at=item["created_at"],
                product_name=product.get("name") if product else None,
                product_image=product_image
            ))
        
        return Order(
            id=full_order["id"],
            order_number=full_order["order_number"],
            user_id=full_order.get("user_id"),
            guest_email=full_order.get("guest_email"),
            guest_phone=full_order.get("guest_phone"),
            subtotal=full_order["subtotal"],
            shipping_cost=full_order["shipping_cost"],
            discount_amount=full_order["discount_amount"],
            total=full_order["total"],
            currency=full_order["currency"],
            status=full_order["status"],
            payment_method=full_order.get("payment_method"),
            payment_status=full_order["payment_status"],
            payment_intent_id=full_order.get("payment_intent_id"),
            shipping_method_id=full_order.get("shipping_method_id"),
            shipping_address=full_order["shipping_address"],
            billing_address=full_order.get("billing_address"),
            notes=full_order.get("notes"),
            admin_notes=full_order.get("admin_notes"),
            created_at=full_order["created_at"],
            updated_at=full_order["updated_at"],
            items=items
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("resource_not_found", lang))

