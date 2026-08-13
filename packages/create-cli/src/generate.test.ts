 import { describe, it, expect, beforeEach, afterEach } from 'vitest';
 import { existsSync, readFileSync, rmSync } from 'node:fs';
 import { join } from 'node:path';
 import { tmpdir } from 'node:os';
 import { generateProject } from './generate';
 import type { GenerateOptions } from './generate';
 
 function tmpDir(): string {
   return join(tmpdir(), `create-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
 }
 
 describe('generateProject', () => {
   let dir: string;
 
   beforeEach(() => {
     dir = tmpDir();
   });
 
   afterEach(() => {
     try { rmSync(dir, { recursive: true, force: true }); } catch {}
   });
 
   it('creates basic template with all required files', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'basic',
     };
     const files = generateProject(opts);
 
     expect(files).toContain('package.json');
     expect(files).toContain('tsconfig.json');
     expect(files).toContain('.gitignore');
     expect(files).toContain('src/index.ts');
     expect(files).toContain('README.md');
   });
 
   it('package.json has correct name and bin', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'npm',
       typescript: true,
       template: 'basic',
     };
     generateProject(opts);
 
     const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
     expect(pkg.name).toBe('my-tool');
     expect(pkg.bin).toEqual({ 'my-tool': './dist/index.js' });
     expect(pkg.type).toBe('module');
   });
 
   it('package.json depends on @cliffx/core and ui', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'basic',
     };
     generateProject(opts);
 
     const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
     expect(pkg.dependencies['@cliffx/core']).toBeDefined();
     expect(pkg.dependencies['@cliffx/ui']).toBeDefined();
   });
 
   it('entry point imports createCli and defineCommand', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'basic',
     };
     generateProject(opts);
 
     const content = readFileSync(join(dir, 'src/index.ts'), 'utf-8');
     expect(content).toContain('createCli');
     expect(content).toContain('defineCommand');
     expect(content).toContain('my-tool');
   });
 
   it('subcommands template creates command files', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'subcommands',
     };
     const files = generateProject(opts);
 
     expect(files).toContain('src/commands/hello.ts');
     expect(files).toContain('src/commands/bye.ts');
     expect(existsSync(join(dir, 'src/commands/hello.ts'))).toBe(true);
     expect(existsSync(join(dir, 'src/commands/bye.ts'))).toBe(true);
   });
 
   it('subcommands entry uses discover()', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'subcommands',
     };
     generateProject(opts);
 
     const content = readFileSync(join(dir, 'src/index.ts'), 'utf-8');
     expect(content).toContain('discover');
     expect(content).toContain('commandsDir');
   });
 
   it('full template creates config file', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: true,
       template: 'full',
     };
     const files = generateProject(opts);
 
     expect(files).toContain('.my-tool.yml');
     expect(existsSync(join(dir, '.my-tool.yml'))).toBe(true);
 
     const content = readFileSync(join(dir, '.my-tool.yml'), 'utf-8');
     expect(content).toContain('env: staging');
   });
 
   it('JavaScript template skips tsconfig', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'pnpm',
       typescript: false,
       template: 'basic',
     };
     const files = generateProject(opts);
 
     expect(files).not.toContain('tsconfig.json');
     expect(files).toContain('src/index.js');
   });
 
   it('README includes project name and package manager', () => {
     const opts: GenerateOptions = {
       name: 'my-tool',
       dir,
       pkgManager: 'npm',
       typescript: true,
       template: 'basic',
     };
     generateProject(opts);
 
     const readme = readFileSync(join(dir, 'README.md'), 'utf-8');
     expect(readme).toContain('# my-tool');
     expect(readme).toContain('npm install');
     expect(readme).toContain('npm run dev');
   });
 });
