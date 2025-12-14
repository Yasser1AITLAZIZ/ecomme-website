import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin routes require admin role check (handled in page components)
  // This middleware is mainly for authentication checks
  // Admin role verification will be done in the admin layout/page components
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout',
    '/admin/:path*',
  ],
};

