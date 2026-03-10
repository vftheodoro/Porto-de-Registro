import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

describe('scripts/validate.js', () => {
  it('exits with 0 when data.json is valid', () => {
    const projectRoot = path.resolve(__dirname, '..');
    expect(() => {
      execSync('node scripts/validate.js', {
        cwd: projectRoot,
        encoding: 'utf-8',
      });
    }).not.toThrow();
  });

  it('validates the structure of data.json when run', () => {
    const projectRoot = path.resolve(__dirname, '..');
    const stdout = execSync('node scripts/validate.js', {
      cwd: projectRoot,
      encoding: 'utf-8',
    });
    // Success message or at least no [ERRO] in output
    expect(stdout).toBeDefined();
    expect(stdout.includes('[ERRO]')).toBe(false);
  });
});
