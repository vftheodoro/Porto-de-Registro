import fs from 'fs';
import path from 'path';
import type { Database } from '@/types';

const EMPTY_DB: Database = { paradas: [], linhas: [], avisos: [] };

/**
 * Reads and parses data.json from the project root.
 * On failure (missing file, invalid JSON), logs the error and returns an empty database
 * so the app does not crash. In development, the console message suggests running validate.js.
 */
export function getDb(): Database {
  const dataPath = path.join(process.cwd(), 'data.json');
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData) as Database;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[getDb] Erro ao ler data.json (${dataPath}):`,
      message
    );
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[getDb] Rode "node scripts/validate.js" para validar o arquivo. O site será exibido sem dados.'
      );
    }
    return EMPTY_DB;
  }
}
