import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface PreOrderData {
  pre_order_id: string;
  name: string;
  email: string;
  phone?: string;
  device_type: string;
  device_model: string;
  storage_capacity: string;
  color?: string;
  notes?: string;
  language?: string; // Language code: 'en' or 'fr'
}

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    subject: "Pre-Order Confirmation - {model}",
    greeting: "Hello {name},",
    confirmation: "Your Pre-Order Has Been Received",
    confirmationMessage: "Thank you for your pre-order request. We have received your request and will notify you as soon as the device becomes available.",
    requestDetails: "Pre-Order Details",
    customerInfo: "Customer Information",
    deviceInfo: "Device Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    deviceType: "Device Type",
    model: "Device Model",
    storage: "Storage Capacity",
    color: "Color",
    notes: "Additional Notes",
    downloadPDF: "Download Confirmation PDF",
    requestId: "Pre-Order ID",
    regards: "Best regards,",
    team: "Primo Store Team",
    autoEmail: "This is an automated email, please do not reply.",
    nextSteps: "Next Steps",
    nextStepsDesc: "We will notify you via email or phone as soon as the device becomes available for pre-order. You will be among the first to know!",
  },
  fr: {
    subject: "Confirmation de Précommande - {model}",
    greeting: "Bonjour {name},",
    confirmation: "Votre Précommande a été Reçue",
    confirmationMessage: "Merci pour votre demande de précommande. Nous avons bien reçu votre demande et vous notifierons dès que l'appareil sera disponible.",
    requestDetails: "Détails de la Précommande",
    customerInfo: "Informations Client",
    deviceInfo: "Informations Appareil",
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    deviceType: "Type d'Appareil",
    model: "Modèle d'Appareil",
    storage: "Capacité de Stockage",
    color: "Couleur",
    notes: "Notes Supplémentaires",
    downloadPDF: "Télécharger le PDF de Confirmation",
    requestId: "ID de la Précommande",
    regards: "Cordialement,",
    team: "L'équipe Primo Store",
    autoEmail: "Cet email a été envoyé automatiquement, merci de ne pas y répondre.",
    nextSteps: "Prochaines Étapes",
    nextStepsDesc: "Nous vous notifierons par email ou téléphone dès que l'appareil sera disponible en précommande. Vous serez parmi les premiers informés !",
  },
};

function getTranslation(lang: string, key: string, params?: Record<string, string>): string {
  const langCode = lang && ['en', 'fr'].includes(lang) ? lang : 'fr';
  let text = translations[langCode]?.[key] || translations['fr'][key] || key;
  
  if (params) {
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param] || '');
    });
  }
  
  return text;
}

function generatePreOrderEmail(data: PreOrderData, language: string, pdfUrl?: string): string {
  const t = (key: string, params?: Record<string, string>) => getTranslation(language, key, params);
  
  const deviceTypeText = data.device_type === 'iphone' ? 'iPhone' : 'Android';

  const pdfButtonHtml = pdfUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #0a0a0a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ${t('downloadPDF')}
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('confirmation')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #d4af37; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 28px; font-weight: bold;">${t('confirmation')}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">${t('greeting', { name: data.name })}</p>
              
              <div style="background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #0a0a0a; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">${t('confirmation')}</h2>
                <p style="margin: 0; font-size: 16px; font-weight: 600;">${t('confirmationMessage')}</p>
              </div>
              
              ${pdfButtonHtml}
              
              <!-- Customer Information -->
              <div style="background-color: #252525; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #d4af37;">
                <h2 style="margin: 0 0 15px 0; color: #d4af37; font-size: 20px;">${t('customerInfo')}</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #999; width: 150px; padding: 8px 0;">${t('name')}:</td>
                    <td style="color: #fff; padding: 8px 0; font-weight: 500;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">${t('email')}:</td>
                    <td style="color: #fff; padding: 8px 0;"><a href="mailto:${data.email}" style="color: #d4af37; text-decoration: none;">${data.email}</a></td>
                  </tr>
                  ${data.phone ? `
                  <tr>
                    <td style="color: #999; padding: 8px 0;">${t('phone')}:</td>
                    <td style="color: #fff; padding: 8px 0;"><a href="tel:${data.phone}" style="color: #d4af37; text-decoration: none;">${data.phone}</a></td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- Device Information -->
              <div style="background-color: #252525; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #d4af37;">
                <h2 style="margin: 0 0 15px 0; color: #d4af37; font-size: 20px;">${t('deviceInfo')}</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #999; width: 150px; padding: 8px 0;">${t('deviceType')}:</td>
                    <td style="color: #fff; padding: 8px 0; font-weight: 500;">${deviceTypeText}</td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">${t('model')}:</td>
                    <td style="color: #fff; padding: 8px 0; font-weight: 500;">${data.device_model}</td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">${t('storage')}:</td>
                    <td style="color: #fff; padding: 8px 0;">${data.storage_capacity}</td>
                  </tr>
                  ${data.color ? `
                  <tr>
                    <td style="color: #999; padding: 8px 0;">${t('color')}:</td>
                    <td style="color: #fff; padding: 8px 0;">${data.color}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- Notes -->
              ${data.notes ? `
              <div style="background-color: #252525; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #d4af37;">
                <h3 style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px;">${t('notes')}</h3>
                <p style="margin: 0; color: #fff; line-height: 1.6; white-space: pre-wrap;">${data.notes}</p>
              </div>
              ` : ''}
              
              <!-- Next Steps -->
              <div style="background-color: #252525; border-radius: 8px; padding: 20px; margin-top: 20px; border-left: 4px solid #d4af37;">
                <h3 style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px;">${t('nextSteps')}</h3>
                <p style="margin: 0; color: #fff; line-height: 1.6;">${t('nextStepsDesc')}</p>
              </div>
              
              <!-- Request ID -->
              <div style="background-color: #1a1a1a; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center; border: 1px solid #333;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  ${t('requestId')}: <span style="color: #d4af37; font-family: monospace;">${data.pre_order_id}</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">${t('regards')}</p>
              <p style="margin: 0; color: #d4af37; font-size: 16px; font-weight: 500;">${t('team')}</p>
              <p style="margin: 20px 0 0 0; color: #666; font-size: 12px;">${t('autoEmail')}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

Deno.serve(async (req: Request) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Parse request body
    const preOrderData: PreOrderData = await req.json();

    // Validate required fields
    if (!preOrderData.email || !preOrderData.device_model || !preOrderData.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, device_model, and name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get language from data or default to French
    const language = preOrderData.language || 'fr';

    // Generate PDF download URL
    const apiBaseUrl = Deno.env.get("API_BASE_URL") || supabaseUrl.replace('/functions/v1', '/api/v1');
    const pdfUrl = `${apiBaseUrl}/pre-order/${preOrderData.pre_order_id}/pdf`;

    // Generate email HTML
    const emailHtml = generatePreOrderEmail(preOrderData, language, pdfUrl);
    const emailSubject = getTranslation(language, "subject", { model: preOrderData.device_model });

    // Get email configuration
    let fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    
    if (!fromEmail) {
      const useTestEmail = Deno.env.get("RESEND_USE_TEST_EMAIL") !== "false";
      fromEmail = useTestEmail 
        ? "onboarding@resend.dev"
        : "noreply@primo-store.com";
    }
    
    // Use Resend API as primary method
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Use Resend API (recommended)
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: preOrderData.email,
          subject: emailSubject,
          html: emailHtml,
          // Also send a copy to admin for notification
          bcc: ["primostore@primosolutions.ma"],
        }),
      });
      
      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
      }
      
      const resendData = await resendResponse.json();
      console.log("Pre-order notification email sent via Resend:", resendData.id);
      
      return new Response(
        JSON.stringify({ success: true, messageId: resendData.id }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Fallback: Use direct SMTP connection
      const smtpHost = Deno.env.get("SMTP_HOST") || Deno.env.get("GOTRUE_SMTP_HOST") || "smtp.gmail.com";
      const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || Deno.env.get("GOTRUE_SMTP_PORT") || "587");
      const smtpUser = Deno.env.get("SMTP_USER") || Deno.env.get("GOTRUE_SMTP_USER");
      const smtpPassword = Deno.env.get("SMTP_PASSWORD") || Deno.env.get("GOTRUE_SMTP_PASSWORD");
      
      if (!smtpUser || !smtpPassword) {
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
        to: preOrderData.email,
        subject: emailSubject,
        content: emailHtml,
        html: emailHtml,
        // Also send a copy to admin for notification
        bcc: ["primostore@primosolutions.ma"],
      });
      
      await client.close();
      
      console.log("Pre-order notification email sent via SMTP");
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error sending pre-order notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

