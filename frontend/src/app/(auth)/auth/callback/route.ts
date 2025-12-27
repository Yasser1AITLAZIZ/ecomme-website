import { NextRequest, NextResponse } from 'next/server';

/**
 * This route handles Supabase auth callbacks and redirects to verify-email with proper parameters.
 * 
 * IMPORTANT: When Supabase verifies an email token via the /auth/v1/verify endpoint,
 * it does NOT pass the token in the redirect URL for security reasons.
 * 
 * However, Supabase DOES pass the token in the original URL that the user clicks.
 * The solution is to extract the token from the referrer or use a different approach.
 * 
 * Since we can't reliably get the token from the redirect, we'll redirect to verify-email
 * and let the page handle token extraction from the original Supabase URL if needed.
 * 
 * Alternative: The user should click the link which goes to Supabase's /auth/v1/verify,
 * and Supabase will verify and redirect here. We then redirect to verify-email.
 * 
 * If Supabase passes the token in query params (which it might in some configurations),
 * we'll capture it and pass it along.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Extract token and type from query parameters
  // Supabase MIGHT pass these if configured to do so: ?token=...&type=signup
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'signup';
  
  // Check referrer for token (fallback - not reliable)
  const referer = request.headers.get('referer') || '';
  let refererToken: string | null = null;
  let refererType: string | null = null;
  
  if (referer.includes('supabase.co') && referer.includes('token=')) {
    const refererUrl = new URL(referer);
    refererToken = refererUrl.searchParams.get('token');
    refererType = refererUrl.searchParams.get('type');
  }
  
  // Use token from query params or referrer
  const verificationToken = token || refererToken;
  const verificationType = type || refererType || 'signup';
  
  if (verificationToken) {
    // If we have a token, redirect to verify-email with it
    const verifyUrl = new URL('/verify-email', request.nextUrl.origin);
    verifyUrl.searchParams.set('token', verificationToken);
    verifyUrl.searchParams.set('type', verificationType);
    return NextResponse.redirect(verifyUrl);
  }
  
  // If no token found, redirect to verify-email anyway
  // The page will try to extract token from URL hash or use Supabase client to check session
  const verifyUrl = new URL('/verify-email', request.nextUrl.origin);
  // Pass a flag to indicate we came from callback (so page knows to check for session)
  verifyUrl.searchParams.set('from_callback', 'true');
  
  return NextResponse.redirect(verifyUrl);
}

