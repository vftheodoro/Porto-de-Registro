/**
 * Admin auth: signed cookie, no database.
 * Uses Web Crypto so it works in Edge (middleware) and Node (API).
 */

const COOKIE_NAME = 'admin_session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_SECRET must be set and at least 16 characters');
  }
  return s;
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

/** Returns cookie value to set: payload.signature. Use in API route. */
export async function createAdminSession(): Promise<string> {
  const secret = getSecret();
  const payload = `${Date.now()}`;
  const signature = await hmacSha256(secret, payload);
  return `${payload}.${signature}`;
}

/** Returns true if the cookie value is valid and not expired. Use in middleware and layout. */
export async function verifyAdminSession(cookieValue: string | null): Promise<boolean> {
  if (!cookieValue) return false;
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = await hmacSha256(secret, payload);
  if (expected !== signature) return false;
  const t = parseInt(payload, 10);
  if (Number.isNaN(t)) return false;
  if (Date.now() - t > TTL_MS) return false;
  return true;
}

export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

export function isAdminConfigured(): boolean {
  return !!(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}
