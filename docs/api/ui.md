# @cliffx/ui

The UI package provides terminal output components, interactive prompts, spinners, progress bars, and ANSI color utilities — all with zero external dependencies.

## Installation

```bash
pnpm add @cliffx/ui
```

## Output Functions

### `log` / `success` / `warn` / `error` / `info`

Write styled messages to stderr.

```ts
import { log, success, warn, error, info } from '@cliffx/ui';

log('Processing...');       // │ Processing...
success('Done!');           // ✔ Done!
warn('No config found');    // ⚠ No config found
error('Failed!');           // ✖ Failed!
info('Using defaults');     // ℹ Using defaults
```

### `section`

Write a section header.

```ts
import { section } from '@cliffx/ui';

section('Build');
// Build
// ─────
```

### `stdout`

Write data to stdout (for pipeable output).

```ts
import { stdout } from '@cliffx/ui';

stdout(JSON.stringify({ status: 'ok' }));
```

### `newline`

Write a blank line to stderr.

```ts
import { newline } from '@cliffx/ui';

newline();
```

## Table

### `table`

Render tabular data with box-drawing borders.

```ts
import { table } from '@cliffx/ui';

table(data, ['name', 'size', 'time'], {
  headers: ['File', 'Size', 'Duration'],
});
```

**Type:**

```ts
function table<T extends Record<string, unknown>>(
  data: T[],
  columns: (keyof T)[],
  options?: TableOptions,
): void;

interface TableOptions {
  headers?: string[];
}
```

## Prompts

### `confirm`

Yes/no confirmation.

```ts
import { confirm } from '@cliffx/ui';

const ok = await confirm('Continue?'); // defaults to true
// ? Continue? (Y/n)
```

### `select`

Single-choice list with arrow keys.

```ts
import { select } from '@cliffx/ui';

const choice = await select('Pick one', [
  { label: 'Option A', value: 'a', hint: 'recommended' },
  { label: 'Option B', value: 'b' },
]);
```

**Type:**

```ts
interface Choice<T = string> {
  label: string;
  value: T;
  hint?: string;
}

function select<T = string>(message: string, choices: Choice<T>[]): Promise<T>;
```

### `multiselect`

Multi-choice list with space to toggle.

```ts
import { multiselect } from '@cliffx/ui';

const selected = await multiselect('Pick many', [
  { label: 'TypeScript', value: 'ts' },
  { label: 'ESLint', value: 'eslint' },
]);
```

### `input`

Free-form text input with validation.

```ts
import { input } from '@cliffx/ui';

const name = await input('Project name', {
  default: 'my-app',
  validate: (v) => v.length >= 2 || 'Too short',
});
```

### `password`

Hidden input for sensitive data.

```ts
import { password } from '@cliffx/ui';

const token = await password('API token');
// ? API token: ****
```

## Spinner

### `spinner`

Wrap an async operation with a spinner.

```ts
import { spinner } from '@cliffx/ui';

const result = await spinner('Loading...', async () => {
  return await fetchData();
});
```

### `Spinner`

Class for manual spinner control.

```ts
import { Spinner } from '@cliffx/ui';

const spin = new Spinner('Working...');
spin.start();
spin.succeed('Done!');
spin.fail('Failed!');
```

## Progress

### `progress`

Batch progress bar.

```ts
import { progress } from '@cliffx/ui';

await progress(100, async (tick) => {
  for (const item of items) {
    await process(item);
    tick();
  }
});
```

### `Progress`

Class for manual progress control.

```ts
import { Progress } from '@cliffx/ui';

const bar = new Progress({ total: 100, width: 40 });
bar.update(50);
bar.done();
```

**Type:**

```ts
interface ProgressOptions {
  total: number;
  width?: number;
  format?: string;
}
```

## Steps

### `steps`

Multi-step wizard.

```ts
import { steps } from '@cliffx/ui';

const results = await steps([
  { title: 'Install', run: () => installDeps() },
  { title: 'Build', run: () => build() },
  { title: 'Test', run: () => test() },
]);
```

**Type:**

```ts
interface Step {
  title: string;
  run: () => Promise<void> | void;
}
```

## Color Utilities

### Direct color functions

```ts
import { red, green, yellow, blue, cyan, gray, dim, bold, underline } from '@cliffx/ui';

console.log(red('Error'));
console.log(green('OK'));
console.log(bold('Important'));
```

### Chainable builder

```ts
import { c } from '@cliffx/ui';

console.log(c('Warning').yellow().bold().toString());
console.log(c('Title').brightBlue().bold().toString());
```

### Utility functions

```ts
import { supportsColor, stripColor, visibleLength } from '@cliffx/ui';

supportsColor(); // true if terminal supports color
stripColor('\x1b[31mred\x1b[0m'); // 'red'
visibleLength('hello'); // 5 (ignores ANSI codes)
```

## Types

```ts
import type { Ui, Choice, TableOptions, ProgressOptions, Step } from '@cliffx/ui';
```

The `Ui` interface is the type of the `ui` object injected into `run()` functions.
