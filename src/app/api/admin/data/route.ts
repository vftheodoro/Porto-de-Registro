import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAdminSession, getAdminCookieName } from '@/lib/auth-admin';
import fs from 'fs';
import path from 'path';
import {
  getClientIp,
  hitRateLimit,
  isSameOriginRequest,
  noStoreHeaders,
} from '@/lib/security';
import { validateDatabasePayload } from '@/lib/validate-db';

async function isAuthenticated(request: Request): Promise<boolean> {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${getAdminCookieName()}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return verifyAdminSession(value);
}

export async function GET(request: Request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401, headers: noStoreHeaders() });
  }
  const db = getDb();
  return NextResponse.json(db, { headers: noStoreHeaders() });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401, headers: noStoreHeaders() });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Origem da requisicao invalida' }, { status: 403, headers: noStoreHeaders() });
  }

  const ip = getClientIp(request);
  const rate = hitRateLimit(`admin-data-write:${ip}`, 40, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Limite de alteracoes excedido temporariamente.' },
      { status: 429, headers: noStoreHeaders({ 'Retry-After': String(rate.retryAfterSec) }) }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type invalido' }, { status: 415, headers: noStoreHeaders() });
  }

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Payload muito grande' }, { status: 413, headers: noStoreHeaders() });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400, headers: noStoreHeaders() });
  }

  const parsed = validateDatabasePayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.errors.slice(0, 15) },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const body = parsed.db;
  const dataPath = path.join(process.cwd(), 'data.json');
  const isVercel = process.env.VERCEL === '1';

  if (!isVercel && typeof fs.writeFileSync === 'function') {
    try {
      const tmpPath = `${dataPath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(body, null, 2), 'utf-8');
      fs.renameSync(tmpPath, dataPath);
      return NextResponse.json({ ok: true, saved: true }, { headers: noStoreHeaders() });
    } catch (e) {
      console.error('Write data.json:', e);
      return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500, headers: noStoreHeaders() });
    }
  }
  return NextResponse.json(
    {
      ok: true,
      saved: false,
      message: 'Em produção (Vercel) não é possível gravar arquivo. Use o botão "Baixar data.json" e faça commit no GitHub.',
      data: body,
    },
    { headers: noStoreHeaders() }
  );
}
