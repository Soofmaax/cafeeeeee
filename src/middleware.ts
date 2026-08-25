import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-constants';

export function middleware(req: NextRequest) {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(req.nextUrl.hostname);
  if (
    process.env.NODE_ENV === 'production'
    && !isLocalhost
    && req.headers.get('x-forwarded-proto') === 'http'
  ) {
    const secureUrl = req.nextUrl.clone();
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl, 308);
  }

  if (
    req.nextUrl.pathname === '/admin'
    && !req.cookies.has(ADMIN_SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/((?!_next/static|_next/image|icon.svg).*)'],
};
