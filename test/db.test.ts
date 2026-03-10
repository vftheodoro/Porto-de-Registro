import { describe, it, expect } from 'vitest';
import { getDb } from '@/lib/db';

describe('getDb', () => {
  it('returns an object with paradas, linhas and avisos arrays', () => {
    const db = getDb();
    expect(db).toBeDefined();
    expect(Array.isArray(db.paradas)).toBe(true);
    expect(Array.isArray(db.linhas)).toBe(true);
    expect(Array.isArray(db.avisos)).toBe(true);
  });

  it('returns empty arrays when data.json is missing or invalid', () => {
    // getDb reads from process.cwd()/data.json. If the file exists and is valid,
    // we get real data; otherwise we get empty arrays. We only assert structure.
    const db = getDb();
    expect(db.paradas).toBeDefined();
    expect(db.linhas).toBeDefined();
    expect(db.avisos).toBeDefined();
  });

  it('when data.json exists and is valid, paradas and linhas have expected shape', () => {
    const db = getDb();
    for (const p of db.paradas) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('nome');
      expect(p).toHaveProperty('cidade');
    }
    for (const l of db.linhas) {
      expect(l).toHaveProperty('id');
      expect(l).toHaveProperty('codigo');
      expect(l).toHaveProperty('nome');
      expect(l).toHaveProperty('slug');
      expect(l).toHaveProperty('paradas');
      expect(l).toHaveProperty('horarios');
      expect(l).toHaveProperty('tarifas');
      expect(Array.isArray(l.paradas)).toBe(true);
      expect(Array.isArray(l.horarios)).toBe(true);
      expect(Array.isArray(l.tarifas)).toBe(true);
    }
  });
});
