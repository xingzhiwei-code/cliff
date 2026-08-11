 import { describe, it, expect, beforeEach, afterEach } from 'vitest';
 import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
 import { join } from 'node:path';
 import { tmpdir } from 'node:os';
 import { loadConfig, loadEnv, envPrefix, resolveOptions } from './config';
 import type { OptionsDef } from './types';
 
 function tmpDir(): string {
   return join(tmpdir(), `config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
 }
 
 describe('envPrefix', () => {
   it('converts kebab-case to UPPER_SNAKE', () => {
     expect(envPrefix('my-tool')).toBe('MY_TOOL');
     expect(envPrefix('my-deploy')).toBe('MY_DEPLOY');
     expect(envPrefix('simple')).toBe('SIMPLE');
   });
 });
 
 describe('loadEnv', () => {
   it('loads env vars with the given prefix', () => {
     process.env.TEST_CLI_ENV = 'production';
     process.env.TEST_CLI_FORCE = 'true';
     process.env.TEST_CLI_COUNT = '42';
     process.env.OTHER_VAR = 'ignored';
 
     const result = loadEnv('TEST_CLI');
     expect(result).toEqual({ env: 'production', force: 'true', count: '42' });
 
     delete process.env.TEST_CLI_ENV;
     delete process.env.TEST_CLI_FORCE;
     delete process.env.TEST_CLI_COUNT;
     delete process.env.OTHER_VAR;
   });
 
   it('returns empty object when no matching vars', () => {
     const result = loadEnv('NONEXISTENT_PREFIX');
     expect(result).toEqual({});
   });
 
   it('handles underscore to camelCase conversion', () => {
     process.env.MY_TOOL_DRY_RUN = 'true';
     const result = loadEnv('MY_TOOL');
     expect(result).toEqual({ dryRun: 'true' });
     delete process.env.MY_TOOL_DRY_RUN;
   });
 });
 
 describe('loadConfig', () => {
   let dir: string;
 
   beforeEach(() => {
     dir = tmpDir();
     mkdirSync(dir, { recursive: true });
   });
 
   afterEach(() => {
     try { rmSync(dir, { recursive: true, force: true }); } catch {}
   });
 
   it('loads .json config', () => {
     writeFileSync(join(dir, '.my-tool.json'), JSON.stringify({ env: 'staging', port: 3000 }));
     const cwd = process.cwd();
     process.chdir(dir);
     try {
       const result = loadConfig('my-tool');
       expect(result.values).toEqual({ env: 'staging', port: 3000 });
       expect(result.source).toContain('.my-tool.json');
     } finally {
       process.chdir(cwd);
     }
   });
 
   it('loads .yml config', () => {
     writeFileSync(join(dir, '.my-tool.yml'), 'env: production\nforce: true\ncount: 3');
     const cwd = process.cwd();
     process.chdir(dir);
     try {
       const result = loadConfig('my-tool');
       expect(result.values).toEqual({ env: 'production', force: true, count: 3 });
       expect(result.source).toContain('.my-tool.yml');
     } finally {
       process.chdir(cwd);
     }
   });
 
   it('loads .rc config', () => {
     writeFileSync(join(dir, '.my-toolrc'), JSON.stringify({ env: 'dev' }));
     const cwd = process.cwd();
     process.chdir(dir);
     try {
       const result = loadConfig('my-tool');
       expect(result.values).toEqual({ env: 'dev' });
     } finally {
       process.chdir(cwd);
     }
   });
 
   it('YAML parser handles quoted strings', () => {
     writeFileSync(join(dir, '.my-tool.yml'), 'name: "hello world"\nversion: "1.0"');
     const cwd = process.cwd();
     process.chdir(dir);
     try {
       const result = loadConfig('my-tool');
       expect(result.values).toEqual({ name: 'hello world', version: '1.0' });
     } finally {
       process.chdir(cwd);
     }
   });
 
   it('returns empty when no config found', () => {
     const cwd = process.cwd();
     process.chdir(dir);
     try {
       const result = loadConfig('nonexistent-tool');
       expect(result.values).toEqual({});
       expect(result.source).toBeNull();
     } finally {
       process.chdir(cwd);
     }
   });
 });
 
 describe('resolveOptions', () => {
   const opts: OptionsDef = {
     env: { type: 'string', default: 'staging' },
     force: { type: 'boolean', default: false },
     count: { type: 'number', default: 1 },
   };
 
   it('CLI args override env and config', () => {
     const cliArgs = { env: 'cli-prod', force: false, count: 1 };
     const result = resolveOptions(
       cliArgs,
       { env: 'env-prod', force: 'true' },
       { env: 'config-prod', force: true },
       opts,
     );
     // env was overridden by CLI, so it stays 'cli-prod'
     expect(result.env).toBe('cli-prod');
   });
 
   it('env overrides config when CLI uses default', () => {
     const cliArgs = { env: 'staging', force: false, count: 1 };
     const result = resolveOptions(
       cliArgs,
       { env: 'env-prod' },
       { env: 'config-prod' },
       opts,
     );
     expect(result.env).toBe('env-prod');
   });
 
   it('config fills in when CLI uses default', () => {
     const cliArgs = { env: 'staging', force: false, count: 1 };
     const result = resolveOptions(
       cliArgs,
       {},
       { env: 'config-prod', force: true },
       opts,
     );
     expect(result.env).toBe('config-prod');
     expect(result.force).toBe(true);
   });
 
   it('coerces string env vars to correct types', () => {
     const cliArgs = { env: 'staging', force: false, count: 1 };
     const result = resolveOptions(
       cliArgs,
       { force: 'true', count: '42' },
       {},
       opts,
     );
     expect(result.force).toBe(true);
     expect(result.count).toBe(42);
   });
 });
