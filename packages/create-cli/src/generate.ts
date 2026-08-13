 import { mkdirSync, writeFileSync } from 'node:fs';
 import { join } from 'node:path';
 
 type PkgManager = 'npm' | 'pnpm' | 'yarn';
 type Template = 'basic' | 'subcommands' | 'full';
 
 export interface GenerateOptions {
   name: string;
   dir: string;
   pkgManager: PkgManager;
   typescript: boolean;
   template: Template;
 }
 
 /** Generate all project files. Returns the list of created file paths relative to dir. */
 export function generateProject(opts: GenerateOptions): string[] {
   const { dir, name, typescript, template } = opts;
   const created: string[] = [];
 
   mkdirSync(dir, { recursive: true });
   mkdirSync(join(dir, 'src', 'commands'), { recursive: true });
 
   const ext = typescript ? 'ts' : 'js';
 
   // package.json
   const pkgJson = createPackageJson(name, typescript);
   writeFileSync(join(dir, 'package.json'), pkgJson);
   created.push('package.json');
 
   // tsconfig
   if (typescript) {
     writeFileSync(join(dir, 'tsconfig.json'), createTsconfig());
     created.push('tsconfig.json');
   }
 
   // .gitignore
   writeFileSync(join(dir, '.gitignore'), 'node_modules\ndist\n.env\n');
   created.push('.gitignore');
 
   // Entry point
   writeFileSync(join(dir, 'src', `index.${ext}`), createEntry(name, ext, template));
   created.push(`src/index.${ext}`);
 
   // Subcommands template
   if (template === 'subcommands' || template === 'full') {
     writeFileSync(join(dir, 'src', 'commands', `hello.${ext}`), createHelloCmd(ext));
     created.push(`src/commands/hello.${ext}`);
     writeFileSync(join(dir, 'src', 'commands', `bye.${ext}`), createByeCmd(ext));
     created.push(`src/commands/bye.${ext}`);
   }
 
   // Full template adds config
   if (template === 'full') {
     writeFileSync(join(dir, `.${name}.yml`), createConfigYml(name));
     created.push(`.${name}.yml`);
   }
 
   // README
   writeFileSync(join(dir, 'README.md'), createReadme(name, opts.pkgManager));
   created.push('README.md');
 
   return created;
 }
 
 function createPackageJson(name: string, typescript: boolean): string {
   const pkg = {
     name,
     version: '0.0.1',
     type: 'module',
     main: `./dist/index.js`,
     bin: { [name]: `./dist/index.js` },
     scripts: {
       dev: typescript ? 'tsx src/index.ts' : 'node src/index.js',
       build: typescript ? 'tsup src/index.ts --format esm --clean' : 'echo ok',
       start: 'node dist/index.js',
     },
     dependencies: {
       '@cliffx/core': 'latest',
       '@cliffx/ui': 'latest',
     },
     devDependencies: typescript
       ? { typescript: '^5.6.0', tsup: '^8.3.0', '@types/node': '^22.0.0', tsx: '^4.0.0' }
       : {},
   };
   return JSON.stringify(pkg, null, 2) + '\n';
 }
 
 function createTsconfig(): string {
   return JSON.stringify(
     {
       compilerOptions: {
         target: 'ES2022',
         module: 'ESNext',
         moduleResolution: 'bundler',
         types: ['node'],
         strict: true,
         esModuleInterop: true,
         skipLibCheck: true,
         outDir: 'dist',
         rootDir: 'src',
         declaration: true,
       },
       include: ['src'],
     },
     null,
     2,
   ) + '\n';
 }
 
 function createEntry(name: string, ext: string, template: string): string {
   if (template === 'basic') {
     return `import { createCli, defineCommand } from '@cliffx/core';
 
 const hello = defineCommand({
   name: 'hello',
   description: 'Say hello',
   async run({ ui }) {
     ui.success('Hello from ${name}!');
   },
 });
 
 const cli = createCli({
   name: '${name}',
   version: '0.0.1',
   description: 'A CLI tool built with cliff',
 });
 
 cli.register(hello.def);
 cli.run();
 `;
   }
   return `import { createCli } from '@cliffx/core';
 
 const cli = createCli({
   name: '${name}',
   version: '0.0.1',
   description: 'A CLI tool built with cliff',
   commandsDir: 'commands',
 });
 
 await cli.discover(import.meta.dirname);
 cli.run();
 `;
 }
 
 function createHelloCmd(ext: string): string {
   return `import { defineCommand } from '@cliffx/core';
 
 export default defineCommand({
   name: 'hello',
   description: 'Say hello',
   options: {
     name: {
       type: 'string',
       default: 'world',
       description: 'Who to greet',
     },
   },
   async run({ options, ui }) {
     ui.success(\`Hello, \${options.name}!\`);
   },
 });
 `;
 }
 
 function createByeCmd(ext: string): string {
   return `import { defineCommand } from '@cliffx/core';
 
 export default defineCommand({
   name: 'bye',
   description: 'Say goodbye',
   async run({ ui }) {
     ui.info('Goodbye!');
   },
 });
 `;
 }
 
 function createConfigYml(name: string): string {
   return `# ${name} configuration
 env: staging
 region: us-east-1
 `;
 }
 
 function createReadme(name: string, pkgManager: string): string {
   return `# ${name}
 
 > Built with [cliff](https://github.com/xingzhiwei-code/cliff)
 
 ## Usage
 
 \`\`\`bash
 ${name} --help
 ${name} hello
 \`\`\`
 
 ## Development
 
 \`\`\`bash
 ${pkgManager} install
 ${pkgManager} run dev
 \`\`\`
 `;
 }
