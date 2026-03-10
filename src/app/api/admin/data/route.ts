import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAdminSession, getAdminCookieName } from '@/lib/auth-admin';
import type { Database } from '@/types';
import fs from 'fs';
import path from 'path';

async function isAuthenticated(request: Request): Promise<boolean> {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${getAdminCookieName()}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return verifyAdminSession(value);
}

export async function GET(request: Request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const db = getDb();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  let body: Database;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  if (!body || !Array.isArray(body.paradas) || !Array.isArray(body.linhas) || !Array.isArray(body.avisos)) {
    return NextResponse.json(
      { error: 'Dados inválidos: paradas, linhas e avisos devem ser arrays' },
      { status: 400 }
    );
  }
  const dataPath = path.join(process.cwd(), 'data.json');
  const isVercel = process.env.VERCEL === '1';
  if (!isVercel && typeof fs.writeFileSync === 'function') {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(body, null, 2), 'utf-8');
      return NextResponse.json({ ok: true, saved: true });
    } catch (e) {
      console.error('Write data.json:', e);
      return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 });
    }
  }
  return NextResponse.json({
    ok: true,
    saved: false,
    message: 'Em produção (Vercel) não é possível gravar arquivo. Use o botão "Baixar data.json" e faça commit no GitHub.',
    data: body,
  });
}
