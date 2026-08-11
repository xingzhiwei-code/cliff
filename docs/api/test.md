# @cliff/test

The test package provides utilities for integration testing your CLI commands.

## Installation

```bash
pnpm add -D @cliff/test
```

## `createTestApp`

Create a test-friendly CLI instance that captures all output.

```ts
import { createTestApp } from '@cliff/test';
import { defineCommand } from '@cliff/core';

const app = createTestApp({
  commands: [
    defineCommand({
      name: 'greet',
      options: {
        name: { type: 'string', default: 'World' },
      },
      async run({ options, ui }) {
        ui.success(`Hello, ${options.name}!`);
      },
    }),
  ],
  cliOptions: {
    name: 'test-cli',
    version: '1.0.0',
  },
});
```

**Parameters:**

```ts
interface TestAppOptions {
  commands?: CommandDef[];
  cliOptions?: Partial<CliOptions>;
}
```

**Returns:**

```ts
{
  cli: Cli;
  run: (args: string[]) => Promise<RunResult>;
}
```

## `RunResult`

```ts
interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
```

## Usage with Vitest

```ts
import { describe, it, expect } from 'vitest';
import { createTestApp } from '@cliff/test';
import { defineCommand } from '@cliff/core';

describe('greet', () => {
  const app = createTestApp({
    commands: [
      defineCommand({
        name: 'greet',
        options: { name: { type: 'string', default: 'World' } },
        async run({ options, ui }) {
          ui.success(`Hello, ${options.name}!`);
        },
      }),
    ],
  });

  it('greets with default name', async () => {
    const { stderr, exitCode } = await app.run(['greet']);
    expect(stderr).toContain('Hello, World!');
    expect(exitCode).toBe(0);
  });

  it('greets with custom name', async () => {
    const { stderr } = await app.run(['greet', '--name', 'Alice']);
    expect(stderr).toContain('Hello, Alice!');
  });

  it('handles unknown commands', async () => {
    const { exitCode } = await app.run(['unknown']);
    expect(exitCode).toBe(1);
  });
});
```

## How It Works

The test harness intercepts three Node.js globals:

| Intercepted | Captured As |
|-------------|-------------|
| `process.stdout.write` | `result.stdout` |
| `process.stderr.write` | `result.stderr` |
| `process.exit` | `result.exitCode` |

After `run()` completes, all globals are restored to their original values. The test harness is safe to use in parallel tests.
