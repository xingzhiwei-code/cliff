# Spinners & Progress

Keep users informed during long-running operations.

## Spinner

The `ui.spinner` function wraps an async operation and shows an animated spinner:

```ts
const result = await ui.spinner('Installing dependencies...', async () => {
  await installDeps();
  return 'done';
});
// ⠋ Installing dependencies...
// ✔ Installing dependencies... done
```

The spinner automatically:
- Starts when the operation begins
- Shows a checkmark on success
- Shows a cross on failure (and re-throws the error)

## Custom Spinner

For more control, use the `Spinner` class directly:

```ts
import { Spinner } from '@cliffx/ui';

const spin = new Spinner('Loading...');
spin.start();

try {
  await slowOperation();
  spin.succeed('Loaded!');
} catch (err) {
  spin.fail('Failed to load');
  throw err;
}
```

## Progress Bar

The `ui.progress` function wraps a batch operation:

```ts
const items = ['file1.ts', 'file2.ts', 'file3.ts'];

await ui.progress(items.length, async (tick) => {
  for (const item of items) {
    await processFile(item);
    tick(); // Advance the bar
  }
});
```

Output:

```
[████████████████████████████] 100% 3/3
```

## Custom Progress

For more control, use the `Progress` class directly:

```ts
import { Progress } from '@cliffx/ui';

const bar = new Progress({ total: 100, width: 40 });

for (let i = 0; i <= 100; i++) {
  bar.update(i);
  await sleep(50);
}
bar.done();
```

## Progress Options

```ts
const bar = new Progress({
  total: 100,        // total units
  width: 40,         // bar width in characters
  format: '{bar} {percent}% {current}/{total}', // custom format
});
```
