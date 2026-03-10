import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/public/busca/route';

describe('API GET /api/public/busca', () => {
  it('returns 400 when origem or destino is missing', async () => {
    const req = new Request('http://localhost/api/public/busca?origem=Registro');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('obrigatório');
  });

  it('returns 400 when destino is missing', async () => {
    const req = new Request('http://localhost/api/public/busca?destino=Cajati');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 and resultados array when origem and destino are provided', async () => {
    const req = new Request(
      'http://localhost/api/public/busca?origem=Registro&destino=Cajati&tipo=UTIL'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('resultados');
    expect(Array.isArray(json.resultados)).toBe(true);
  });

  it('each resultado has linha, horarios, paradas, tarifa and tempo_estimado', async () => {
    const req = new Request(
      'http://localhost/api/public/busca?origem=Registro&destino=Cajati&tipo=UTIL'
    );
    const res = await GET(req);
    const json = await res.json();
    for (const r of json.resultados) {
      expect(r).toHaveProperty('linha');
      expect(r).toHaveProperty('horarios');
      expect(r).toHaveProperty('paradas');
      expect(r).toHaveProperty('tarifa');
      expect(r).toHaveProperty('tempo_estimado');
      expect(r.linha).toHaveProperty('id');
      expect(r.linha).toHaveProperty('codigo');
      expect(r.linha).toHaveProperty('nome');
      expect(r.linha).toHaveProperty('slug');
      expect(Array.isArray(r.horarios)).toBe(true);
    }
  });
});
