import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  GITHUB_PAGES: 'true',
  NEXT_PUBLIC_STATIC_EXPORT: 'true',
};

const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
