import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { confirm, input, select, success, error, info, section, spinner, c } from '@cliffx/ui';
import { generateProject } from './generate';
import type { GenerateOptions } from './generate';

async function main() {
  const args = process.argv.slice(2);
  let projectName = args[0] || '';

  console.log('');
  console.log(c('create-cli').bold().brightBlue().toString());
  console.log('  Create a new CLI project in seconds.\n');

  // Step 1: Project name
  if (!projectName) {
    projectName = await input('Project name', {
      validate: (v) => {
        if (!v.trim()) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/.test(v)) return 'Name must be lowercase alphanumeric with dashes';
        return true;
      },
    });
  }

  const dir = join(process.cwd(), projectName);
  if (existsSync(dir)) {
    const overwrite = await confirm(
      `Directory ${projectName} already exists. Overwrite?`,
      false,
    );
    if (!overwrite) {
      error('Aborted.');
      process.exit(1);
    }
  }

  // Step 2: Package manager
  const pkgManager = await select<'npm' | 'pnpm' | 'yarn'>('Package manager', [
    { label: 'npm', value: 'npm' },
    { label: 'pnpm (Recommended)', value: 'pnpm', hint: 'faster, disk-efficient' },
    { label: 'yarn', value: 'yarn' },
  ]);

  // Step 3: Language
  const typescript = await confirm('Use TypeScript?', true);

  // Step 4: Template
  const template = await select<'basic' | 'subcommands' | 'full'>('Template', [
    { label: 'Basic', value: 'basic', hint: 'one command, minimal setup' },
    { label: 'Subcommands', value: 'subcommands', hint: 'multiple commands' },
    { label: 'Full', value: 'full', hint: 'commands + config + plugin support' },
  ]);

  const opts: GenerateOptions = { name: projectName, dir, pkgManager, typescript, template };

  section('Creating project');

  await spinner('Generating files...', async () => {
    generateProject(opts);
  });

  success(`Project created at ${dir}`);
  info(`  cd ${projectName}`);
  info(`  ${pkgManager} ${pkgManager === 'npm' ? 'run' : ''} dev\n`);
}

main().catch((err) => {
  error(String(err));
  process.exit(1);
});
