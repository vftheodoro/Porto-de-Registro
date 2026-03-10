import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { getAdminCookieName } from '@/lib/auth-admin';
import { isSameOriginRequest, noStoreHeaders } from '@/lib/security';

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Origem da requisicao invalida' }, { status: 403, headers: noStoreHeaders() });
  }

  const res = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  res.cookies.set(getAdminCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return res;
}
