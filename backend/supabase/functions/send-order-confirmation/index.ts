import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface OrderData {
  order_id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  currency: string;
  delivery_type?: string;
  shipping_address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  language?: string; // Language code: 'en', 'fr', or 'ar'
}

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    subject: "Order Confirmation - {order_number}",
    greeting: "Hello{name},",
    thankYou: "Thank you for your order!",
    preparing: "We're preparing your order",
    preparingDesc: "Your order has been received and is being processed. We'll send you another email once your order ships.",
    orderNumber: "Order Number",
    orderDetails: "Order Details",
    product: "Product",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    total: "Total",
    summary: "Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    totalAmount: "Total",
    deliveryInfo: "Delivery Information",
    delivery: "Delivery",
    pickup: "Store Pickup",
    shippingAddress: "Shipping Address",
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery (COD)",
    emailSent: "You will receive a confirmation email once your order ships.",
    questions: "If you have any questions about your order, please don't hesitate to contact us.",
    regards: "Best regards,",
    team: "Primo Store Team",
    autoEmail: "This is an automated email, please do not reply.",
  },
  fr: {
    subject: "Confirmation de Commande - {order_number}",
    greeting: "Bonjour{name},",
    thankYou: "Nous vous remercions pour votre commande !",
    preparing: "Nous préparons votre commande",
    preparingDesc: "Votre commande a été reçue et est en cours de traitement. Nous vous enverrons un autre email une fois votre commande expédiée.",
    orderNumber: "Numéro de Commande",
    orderDetails: "Détails de la Commande",
    product: "Produit",
    quantity: "Quantité",
    unitPrice: "Prix Unitaire",
    total: "Total",
    summary: "Résumé",
    subtotal: "Sous-total",
    shipping: "Livraison",
    discount: "Remise",
    totalAmount: "Total",
    deliveryInfo: "Informations de Livraison",
    delivery: "Livraison",
    pickup: "Retrait en Magasin",
    shippingAddress: "Adresse de Livraison",
    paymentMethod: "Méthode de Paiement",
    cod: "Paiement à la Livraison",
    emailSent: "Vous recevrez un email de confirmation une fois votre commande expédiée.",
    questions: "Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.",
    regards: "Cordialement,",
    team: "L'équipe Primo Store",
    autoEmail: "Cet email a été envoyé automatiquement, merci de ne pas y répondre.",
  },
  ar: {
    subject: "تأكيد الطلب - {order_number}",
    greeting: "مرحباً{name}،",
    thankYou: "شكراً لك على طلبك!",
    preparing: "نحن نعد طلبك",
    preparingDesc: "تم استلام طلبك وهو قيد المعالجة. سنرسل لك بريد إلكتروني آخر بمجرد شحن طلبك.",
    orderNumber: "رقم الطلب",
    orderDetails: "تفاصيل الطلب",
    product: "المنتج",
    quantity: "الكمية",
    unitPrice: "السعر الوحدة",
    total: "المجموع",
    summary: "الملخص",
    subtotal: "المجموع",
    shipping: "الشحن",
    discount: "الخصم",
    totalAmount: "الإجمالي",
    deliveryInfo: "معلومات التوصيل",
    delivery: "توصيل",
    pickup: "استلام من المتجر",
    shippingAddress: "عنوان التوصيل",
    paymentMethod: "طريقة الدفع",
    cod: "الدفع عند الاستلام",
    emailSent: "ستتلقى بريد إلكتروني للتأكيد بمجرد شحن طلبك.",
    questions: "إذا كان لديك أي أسئلة حول طلبك، يرجى عدم التردد في الاتصال بنا.",
    regards: "مع أطيب التحيات،",
    team: "فريق Primo Store",
    autoEmail: "هذا بريد إلكتروني تلقائي، يرجى عدم الرد.",
  },
};

function getTranslation(lang: string, key: string, params?: Record<string, string>): string {
  const langCode = lang && ['en', 'fr', 'ar'].includes(lang) ? lang : 'fr';
  let text = translations[langCode]?.[key] || translations['fr'][key] || key;
  
  if (params) {
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param] || '');
    });
  }
  
  return text;
}

Deno.serve(async (req: Request) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:135',message:'Edge Function entry','data':{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Get environment variables
    // Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically provided by Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:141',message:'Missing environment variables','data':{hasSupabaseUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw new Error("Missing Supabase environment variables");
    }

    // Parse request body
    const orderData: OrderData = await req.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:148',message:'Request body parsed','data':{hasCustomerEmail:!!orderData.customer_email,hasOrderNumber:!!orderData.order_number,orderNumber:orderData.order_number,customerEmail:orderData.customer_email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Validate required fields
    if (!orderData.customer_email || !orderData.order_number) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:152',message:'Missing required fields','data':{hasCustomerEmail:!!orderData.customer_email,hasOrderNumber:!!orderData.order_number},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return new Response(
        JSON.stringify({ error: "Missing required fields: customer_email and order_number" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get language from order data or default to French
    const language = orderData.language || 'fr';

    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmail(orderData, language);
    const emailSubject = getTranslation(language, "subject", { order_number: orderData.order_number });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:163',message:'Email HTML generated','data':{language,emailSubject,htmlLength:emailHtml.length,hasHtml:!!emailHtml},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Send email using Supabase's email service (same infrastructure as confirmation emails)
    // Supabase uses SMTP for sending emails, configured in dashboard (Settings > Auth > SMTP Settings)
    // We'll use the Admin API to send email via Supabase's email service, similar to how
    // confirmation emails are sent during user registration
    
    try {
      // Get email configuration
      // For testing: Resend provides a test email address that works without domain verification
      // For production: Use your verified domain (e.g., noreply@your-verified-domain.com)
      let fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
      
      // If no SMTP_FROM_EMAIL is set, use Resend's test email (works without domain verification)
      // Or use your verified domain email for production
      if (!fromEmail) {
        // Check if we're in production mode (you can set RESEND_USE_TEST_EMAIL=false to force production)
        const useTestEmail = Deno.env.get("RESEND_USE_TEST_EMAIL") !== "false";
        fromEmail = useTestEmail 
          ? "onboarding@resend.dev"  // Resend test email (works without verification)
          : "noreply@primo-store.com"; // Your domain (requires verification)
      }
      
      // Use Resend API as primary method (recommended - more reliable)
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:192',message:'Checking email service','data':{hasResendKey:!!resendApiKey,fromEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (resendApiKey) {
        // Use Resend API (recommended)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:198',message:'Sending via Resend API','data':{to:orderData.customer_email,subject:emailSubject},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: orderData.customer_email,
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        
        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:217',message:'Resend API error','data':{status:resendResponse.status,error:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
        }
        
        const resendData = await resendResponse.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:224',message:'Resend API success','data':{resendId:resendData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.log("Email sent via Resend:", resendData.id);
      } else {
        // Fallback: Use direct SMTP connection
        const smtpHost = Deno.env.get("SMTP_HOST") || Deno.env.get("GOTRUE_SMTP_HOST") || "smtp.gmail.com";
        const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || Deno.env.get("GOTRUE_SMTP_PORT") || "587");
        const smtpUser = Deno.env.get("SMTP_USER") || Deno.env.get("GOTRUE_SMTP_USER");
        const smtpPassword = Deno.env.get("SMTP_PASSWORD") || Deno.env.get("GOTRUE_SMTP_PASSWORD");
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:232',message:'Using SMTP fallback','data':{hasUser:!!smtpUser,hasPassword:!!smtpPassword,smtpHost,smtpPort},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        if (!smtpUser || !smtpPassword) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:237',message:'SMTP credentials missing','data':{hasUser:!!smtpUser,hasPassword:!!smtpPassword},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          throw new Error("No email service configured. Please set either RESEND_API_KEY or SMTP_USER/SMTP_PASSWORD in Edge Function secrets.");
        }
        
        // Import SMTP client library
        const { SmtpClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
        
        const client = new SmtpClient();
        
        await client.connect({
          hostname: smtpHost,
          port: smtpPort,
          username: smtpUser,
          password: smtpPassword,
          tls: smtpPort === 465,
          startTls: smtpPort === 587,
        });
        
        await client.send({
          from: fromEmail,
          to: orderData.customer_email,
          subject: emailSubject,
          content: emailHtml,
          html: emailHtml,
        });
        
        await client.close();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:260',message:'SMTP send success','data':{to:orderData.customer_email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.log("Email sent via SMTP");
      }
      
      console.log("Order confirmation email sent to:", orderData.customer_email);
      console.log("Language:", language);
      console.log("Email subject:", emailSubject);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:260',message:'Returning success response','data':{customer_email:orderData.customer_email,language,emailSubject},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order confirmation email sent successfully",
          language: language,
          email_sent: true
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (emailError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:292',message:'Email sending error caught','data':{errorMessage:emailError?.message,errorType:emailError?.constructor?.name,errorStack:emailError?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error("Error sending order confirmation email:", emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      // Don't fail the request - email sending is non-critical, but return error details for debugging
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Order confirmation email generation failed",
          language: language,
          error: errorMessage,
          warning: "Email sending encountered an error, but order was processed successfully"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-order-confirmation/index.ts:231',message:'Top-level error caught','data':{errorMessage:error?.message,errorType:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function generateOrderConfirmationEmail(order: OrderData, lang: string): string {
  const t = (key: string, params?: Record<string, string>) => getTranslation(lang, key, params);
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const fontFamily = isRTL ? 'Arial, "Segoe UI", Tahoma, sans-serif' : 'Arial, sans-serif';

  const deliveryInfo = order.delivery_type === "pickup" 
    ? `<p style="margin: 10px 0; color: #333;"><strong>${t("deliveryMethod")}:</strong> ${t("pickup")}</p>`
    : `<p style="margin: 10px 0; color: #333;"><strong>${t("shippingAddress")}:</strong><br>
       ${order.shipping_address?.street || ""}<br>
       ${order.shipping_address?.city || ""}, ${order.shipping_address?.state || ""}<br>
       ${order.shipping_address?.zipCode || ""}<br>
       ${order.shipping_address?.country || "Morocco"}</p>`;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333; text-align: ${textAlign};">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: ${isRTL ? 'left' : 'right'}; color: #333;">${item.price.toFixed(2)} ${order.currency}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: ${isRTL ? 'left' : 'right'}; color: #333; font-weight: bold;">${(item.price * item.quantity).toFixed(2)} ${order.currency}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t("subject", { order_number: order.order_number })}</title>
</head>
<body style="font-family: ${fontFamily}; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; direction: ${dir};">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; font-weight: bold;">Primo Store</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
      <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">${t("thankYou")}</h2>
      <p style="margin: 0; font-size: 16px; font-weight: 600;">${t("preparing")}</p>
    </div>
    
    <p style="color: #333; margin-bottom: 20px;">${t("greeting", { name: order.customer_name ? ` ${order.customer_name}` : "" })}</p>
    
    <p style="color: #666; margin-bottom: 30px;">${t("preparingDesc")}</p>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
      <p style="margin: 0; color: #333;"><strong>${t("orderNumber")}:</strong> <span style="color: #fbbf24; font-weight: bold; font-size: 18px;">${order.order_number}</span></p>
    </div>
    
    <h3 style="color: #1a1a1a; margin-top: 30px; margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">${t("orderDetails")}</h3>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fff;">
      <thead>
        <tr style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #fbbf24;">
          <th style="padding: 12px; text-align: ${textAlign}; font-weight: bold;">${t("product")}</th>
          <th style="padding: 12px; text-align: center; font-weight: bold;">${t("quantity")}</th>
          <th style="padding: 12px; text-align: ${isRTL ? 'left' : 'right'}; font-weight: bold;">${t("unitPrice")}</th>
          <th style="padding: 12px; text-align: ${isRTL ? 'left' : 'right'}; font-weight: bold;">${t("total")}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; text-align: ${textAlign}; color: #666;"><strong>${t("subtotal")}:</strong></td>
          <td style="padding: 8px 0; text-align: ${isRTL ? 'left' : 'right'}; color: #333; width: 150px; font-weight: bold;">${order.subtotal.toFixed(2)} ${order.currency}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; text-align: ${textAlign}; color: #666;"><strong>${t("shipping")}:</strong></td>
          <td style="padding: 8px 0; text-align: ${isRTL ? 'left' : 'right'}; color: #333; font-weight: bold;">${order.shipping_cost.toFixed(2)} ${order.currency}</td>
        </tr>
        ${order.discount_amount > 0 ? `
        <tr>
          <td style="padding: 8px 0; text-align: ${textAlign}; color: #666;"><strong>${t("discount")}:</strong></td>
          <td style="padding: 8px 0; text-align: ${isRTL ? 'left' : 'right'}; color: #10b981; font-weight: bold;">-${order.discount_amount.toFixed(2)} ${order.currency}</td>
        </tr>
        ` : ""}
        <tr style="font-size: 1.2em; font-weight: bold; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
          <td style="padding: 15px 0; text-align: ${textAlign}; color: #fbbf24;"><strong>${t("totalAmount")}:</strong></td>
          <td style="padding: 15px 0; text-align: ${isRTL ? 'left' : 'right'}; color: #fbbf24; font-size: 24px;">${order.total.toFixed(2)} ${order.currency}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #1a1a1a; margin-top: 0; margin-bottom: 15px; font-size: 18px;">${t("deliveryInfo")}</h3>
      ${deliveryInfo}
      <p style="margin: 10px 0; color: #333;"><strong>${t("paymentMethod")}:</strong> ${t("cod")}</p>
    </div>
    
    <p style="margin-top: 30px; color: #666; font-style: italic;">${t("emailSent")}</p>
    
    <p style="margin-top: 20px; color: #666;">${t("questions")}</p>
    
    <p style="margin-top: 30px; color: #333;">
      ${t("regards")}<br>
      <strong style="color: #fbbf24;">${t("team")}</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>${t("autoEmail")}</p>
  </div>
</body>
</html>
  `;
}
