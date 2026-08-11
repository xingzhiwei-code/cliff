import { describe, it, expect } from 'vitest';
import { Cli, createCli } from './cli';
import { defineCommand } from './command';
import { stripColor } from '@cliff/ui';

class TestExit extends Error {
  constructor(public code: number) {
    super(`TestExit: ${code}`);
  }
}

async function runWithCapture(
  cli: Cli,
  args: string[],
): Promise<{ output: string; exitCode: number }> {
  let output = '';
  let exitCode = 0;
  const origStderr = process.stderr.write.bind(process.stderr);
  const origExit = process.exit.bind(process);

  process.stderr.write = ((chunk: unknown) => {
    output += String(chunk);
    return true;
  }) as typeof process.stderr.write;

  process.exit = ((code?: number) => {
    exitCode = code ?? 0;
    throw new TestExit(code ?? 0);
  }) as typeof process.exit;

  try {
    await cli.run(args);
  } catch (e) {
    if (!(e instanceof TestExit)) throw e;
  } finally {
    process.stderr.write = origStderr;
    process.exit = origExit;
  }

  return { output, exitCode };
}

describe('Cli', () => {
  it('shows root help when no args', async () => {
    const cli = createCli({ name: 'test-cli', version: '1.0.0', description: 'A test CLI' });
    const { output } = await runWithCapture(cli, []);
    const plain = stripColor(output);
    expect(plain).toContain('test-cli');
    expect(plain).toContain('v1.0.0');
    expect(plain).toContain('A test CLI');
  });

  it('shows version with --version', async () => {
    const cli = createCli({ name: 'test-cli', version: '2.0.0' });
    const { output } = await runWithCapture(cli, ['--version']);
    expect(output).toContain('2.0.0');
  });

  it('runs a registered command', async () => {
    const cli = createCli({ name: 'test-cli' });
    let called = false;

    cli.register({
      name: 'hello',
      async run({ ui }) {
        called = true;
        ui.success('Hello!');
      },
    });

    const { output } = await runWithCapture(cli, ['hello']);
    expect(called).toBe(true);
    const plain = stripColor(output);
    expect(plain).toContain('Hello!');
  });

  it('shows subcommand help with --help flag', async () => {
    const cli = createCli({ name: 'test-cli' });
    cli.register({
      name: 'deploy',
      description: 'Deploy to production',
      options: {
        env: { type: 'string', default: 'staging', description: 'Target env' },
      },
      async run() {},
    });

    const { output } = await runWithCapture(cli, ['deploy', '--help']);
    const plain = stripColor(output);
    expect(plain).toContain('test-cli deploy');
    expect(plain).toContain('Deploy to production');
    expect(plain).toContain('--env');
  });

  it('shows error for unknown command', async () => {
    const cli = createCli({ name: 'test-cli' });
    const { output } = await runWithCapture(cli, ['nope']);
    const plain = stripColor(output);
    expect(plain).toContain('Unknown command');
  });

  it('parses options and passes to run', async () => {
    const cli = createCli({ name: 'test-cli' });
    let receivedOptions: Record<string, unknown> = {};

    cli.register({
      name: 'build',
      options: {
        env: { type: 'string', default: 'dev' },
        force: { type: 'boolean', default: false },
      },
      async run({ options }) {
        receivedOptions = options as Record<string, unknown>;
      },
    });

    await runWithCapture(cli, ['build', '--env', 'production', '--force']);
    expect(receivedOptions.env).toBe('production');
    expect(receivedOptions.force).toBe(true);
  });

  it('defineCommand returns a Command with def', () => {
    const cmd = defineCommand({
      name: 'test',
      async run() {},
    });
    expect(cmd.def.name).toBe('test');
  });

  it('list commands in root help', async () => {
    const cli = createCli({ name: 'test-cli', version: '1.0.0' });
    cli.register({ name: 'deploy', description: 'Deploy', async run() {} });
    cli.register({ name: 'config', description: 'Config', async run() {} });

    const { output } = await runWithCapture(cli, []);
    const plain = stripColor(output);
    expect(plain).toContain('deploy');
    expect(plain).toContain('Deploy');
    expect(plain).toContain('config');
    expect(plain).toContain('Config');
  });
});
