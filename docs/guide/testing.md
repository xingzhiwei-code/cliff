# Testing

CLI Framework ships with a built-in test harness. Write integration tests for your CLI as easily as unit tests.

## Setup

```ts
import { createTestApp } from '@cliff/test';
import { defineCommand } from '@cliff/core';

const app = createTestApp({
  commands: [
    defineCommand({
      name: 'deploy',
      options: {
        env: { type: 'string', default: 'staging' },
      },
      async run({ options, ui }) {
        ui.success(`Deployed to ${options.env}`);
      },
    }),
  ],
});
```

## Running Commands

The `run()` method captures all output and returns the result:

```ts
const result = await app.run(['deploy', '--env', 'production']);

console.log(result.stdout);   // data output (tables, etc.)
console.log(result.stderr);   // status messages, errors
console.log(result.exitCode); // 0 for success, 1 for error
```

## Assertions

Use with vitest (or any test framework):

```ts
import { describe, it, expect } from 'vitest';

describe('deploy command', () => {
  it('deploys to staging by default', async () => {
    const { stderr, exitCode } = await app.run(['deploy']);
    expect(stderr).toContain('Deployed to staging');
    expect(exitCode).toBe(0);
  });

  it('respects the --env flag', async () => {
    const { stderr } = await app.run(['deploy', '--env', 'production']);
    expect(stderr).toContain('Deployed to production');
  });

  it('handles errors gracefully', async () => {
    const { stderr, exitCode } = await app.run(['deploy', '--retries', 'abc']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error');
  });
});
```

## How It Works

`createTestApp` intercepts:
- `process.stdout.write` — captured as `result.stdout`
- `process.stderr.write` — captured as `result.stderr`
- `process.exit` — captured as `result.exitCode` (throws `TestExitError` internally)

After the test, all streams are restored to their original state.
