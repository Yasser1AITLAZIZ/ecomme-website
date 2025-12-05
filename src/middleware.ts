import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware can be extended to check authentication
  // For now, it's a placeholder for future authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout',
  ],
};

