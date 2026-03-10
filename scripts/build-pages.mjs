import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Porto-de-Registro';

const env = {
  ...process.env,
  GITHUB_PAGES: 'true',
  NEXT_PUBLIC_STATIC_EXPORT: 'true',
  NEXT_PUBLIC_BASE_PATH: `/${repoName}`,
};

const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

if (typeof result.status === 'number') {
  if (result.status === 0) {
    const noJekyllPath = path.join(process.cwd(), 'out', '.nojekyll');
    fs.writeFileSync(noJekyllPath, '');
  }
  process.exit(result.status);
}

process.exit(1);
