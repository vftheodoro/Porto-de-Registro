import { NextResponse } from 'next/server';
import { createAdminSession, getAdminCookieName, getAdminPassword } from '@/lib/auth-admin';

export async function POST(request: Request) {
  try {
    const password = getAdminPassword();
    if (!password) {
      return NextResponse.json(
        { error: 'Admin não configurado (ADMIN_PASSWORD)' },
        { status: 503 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const given = body.password ?? '';
    if (given !== password) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    const value = await createAdminSession();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(getAdminCookieName(), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Admin login error:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
