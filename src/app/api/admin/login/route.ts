import { NextResponse } from 'next/server';
import {
  createAdminSession,
  getAdminCookieName,
  getAdminPassword,
  verifyAdminPassword,
} from '@/lib/auth-admin';
import { getClientIp, hitRateLimit, isSameOriginRequest, noStoreHeaders } from '@/lib/security';

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Origem da requisicao invalida' }, { status: 403, headers: noStoreHeaders() });
    }

    const ip = getClientIp(request);
    const rate = hitRateLimit(`admin-login:${ip}`, 7, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente em instantes.' },
        { status: 429, headers: noStoreHeaders({ 'Retry-After': String(rate.retryAfterSec) }) }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type invalido' }, { status: 415, headers: noStoreHeaders() });
    }

    const password = getAdminPassword();
    if (!password) {
      return NextResponse.json(
        { error: 'Admin não configurado (ADMIN_PASSWORD)' },
        { status: 503, headers: noStoreHeaders() }
      );
    }
    const body = await request.json().catch(() => ({}));
    const given = typeof body.password === 'string' ? body.password : '';
    if (!verifyAdminPassword(given, password)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401, headers: noStoreHeaders() });
    }
    const value = await createAdminSession();
    const res = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
    res.cookies.set(getAdminCookieName(), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Admin login error:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500, headers: noStoreHeaders() });
  }
}
