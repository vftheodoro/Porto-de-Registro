import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'data.json');
const dest = path.join(root, 'public', 'data.json');

if (!fs.existsSync(source)) {
  console.error(`[prepare-static] Arquivo nao encontrado: ${source}`);
  process.exit(1);
}

fs.copyFileSync(source, dest);
console.log(`[prepare-static] Copiado para ${dest}`);
