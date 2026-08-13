# Interactive Prompts

Build interactive command-line experiences with keyboard-navigable prompts.

## Confirm

Simple yes/no confirmation:

```ts
const confirmed = await ui.confirm('Deploy to production?');
// ? Deploy to production? (Y/n)

if (!confirmed) {
  ui.log('Deployment cancelled.');
  return;
}
```

## Select

Single-choice list with arrow key navigation:

```ts
const region = await ui.select('Choose region', [
  { label: 'US East', value: 'us-east', hint: 'Virginia' },
  { label: 'US West', value: 'us-west', hint: 'Oregon' },
  { label: 'EU West', value: 'eu-west', hint: 'Ireland' },
]);
// ? Choose region
//   ❯ US East  Virginia
//     US West  Oregon
//     EU West  Ireland
```

## Multiselect

Multi-choice list with space to toggle:

```ts
const features = await ui.multiselect('Select features', [
  { label: 'TypeScript', value: 'ts' },
  { label: 'ESLint', value: 'eslint' },
  { label: 'Prettier', value: 'prettier' },
  { label: 'Vitest', value: 'vitest' },
]);
// ? Select features (2 selected)
//   ❯ ◉ TypeScript
//     ○ ESLint
//     ◉ Vitest
//     ○ Prettier
```

## Input

Free-form text input with validation:

```ts
const projectName = await ui.input('Project name', {
  default: 'my-app',
  validate: (value) => {
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-z0-9-]+$/.test(value)) return 'Only lowercase, numbers, and hyphens';
    return true;
  },
});
```

## Password

Hidden input for sensitive data:

```ts
const token = await ui.password('Enter API token');
// ? Enter API token: ****
```

## Steps

Multi-step wizard:

```ts
import { steps } from '@cliffx/ui';

const results = await ui.steps([
  {
    title: 'Installing dependencies',
    async run() { await installDeps(); },
  },
  {
    title: 'Building project',
    async run() { await build(); },
  },
  {
    title: 'Running tests',
    async run() { await test(); },
  },
]);

// Each step shows a spinner while running,
// then a checkmark when complete
```

## Navigation Keys

| Key | Action |
|-----|--------|
| `↑` / `k` | Move up |
| `↓` / `j` | Move down |
| `Enter` | Confirm selection |
| `Space` | Toggle (multiselect) |
| `Ctrl+C` | Cancel (exit code 3) |
