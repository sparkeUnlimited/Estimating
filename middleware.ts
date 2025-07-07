import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const isLoggedIn = !!token?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/estimate')) {
    if (!isLoggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if ((pathname === '/' || pathname === '/login') && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/estimate';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/estimate/:path*'],
};
