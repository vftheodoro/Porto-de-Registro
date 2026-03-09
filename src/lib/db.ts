import fs from 'fs';
import path from 'path';
import type { Database } from '@/types';

// Helper for reading the db on the server side
export function getDb(): Database {
  const dataPath = path.join(process.cwd(), 'data.json');
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData) as Database;
  } catch (error) {
    console.error('Erro ao ler data.json:', error);
    // Return empty state if file read fails
    return { paradas: [], linhas: [], avisos: [] };
  }
}
