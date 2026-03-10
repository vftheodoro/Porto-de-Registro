import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/auth-admin';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/admin')) {
    return NextResponse.next();
  }
  if (path === '/admin/login' || path.startsWith('/admin/login/')) {
    return NextResponse.next();
  }
  const cookie = request.cookies.get(getAdminCookieName())?.value ?? null;
  const valid = await verifyAdminSession(cookie);
  if (!valid) {
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('from', path);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
