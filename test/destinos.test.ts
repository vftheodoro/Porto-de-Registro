import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/public/destinos/route';

describe('API GET /api/public/destinos', () => {
  it('returns 400 when origem is missing', async () => {
    const req = new Request('http://localhost/api/public/destinos?tipo=UTIL');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('returns reachable destinations for given origem and tipo', async () => {
    const req = new Request(
      'http://localhost/api/public/destinos?origem=Jacupiranga&tipo=UTIL'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.destinos)).toBe(true);
    expect(json.destinos.length).toBeGreaterThan(0);
  });
});
