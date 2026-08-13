# Output Components

CLI Framework provides a full set of terminal output components — no chalk, no extra libraries.

## Basic Output

```ts
import { log, success, warn, error, info } from '@cliffx/ui';

ui.log('Processing files...');     // │ Processing files...
ui.success('Build complete!');     // ✔ Build complete!
ui.warn('No config file found');   // ⚠ No config file found
ui.error('Connection failed');     // ✖ Connection failed
ui.info('Using default settings'); // ℹ Using default settings
```

## Section Headers

```ts
import { section } from '@cliffx/ui';

ui.section('Deployment');
// Deploying
// ─────────
```

## Tables

Display tabular data with automatic alignment:

```ts
import { table } from '@cliffx/ui';

const results = [
  { name: 'main.js', size: '42K', time: '1.2s' },
  { name: 'vendor.js', size: '128K', time: '3.5s' },
  { name: 'styles.css', size: '18K', time: '0.3s' },
];

ui.table(results, ['name', 'size', 'time']);
```

Output:

```
┌──────────┬──────┬──────┐
│ name     │ size │ time │
├──────────┼──────┼──────┤
│ main.js  │ 42K  │ 1.2s │
│ vendor.js│ 128K │ 3.5s │
│ styles.css│ 18K │ 0.3s │
└──────────┴──────┴──────┘
```

## Custom Headers

```ts
ui.table(results, ['name', 'size', 'time'], {
  headers: ['File', 'Size', 'Duration'],
});
```

## stdout vs stderr

- **`ui.log`, `ui.success`, `ui.warn`, `ui.error`** — write to stderr (for status messages)
- **`ui.stdout`** — write to stdout (for pipeable data output)
- **`ui.table`** — writes to stdout (for pipeability)

```ts
// Status messages go to stderr
ui.log('Processing...');

// Data output goes to stdout — can be piped
ui.stdout(JSON.stringify(result));
```

## Color Utilities

Low-level color functions are also available:

```ts
import { c, red, green, blue, yellow, cyan, gray, dim, bold, underline } from '@cliffx/ui';

// Chainable builder
console.log(c('Success!').green().bold().toString());

// Direct functions
console.log(red('Error message'));
console.log(green('OK'));
console.log(blue('Info'));
console.log(gray('Metadata'));
console.log(dim('Subtle text'));
console.log(bold('Important'));
console.log(underline('Link'));
```
