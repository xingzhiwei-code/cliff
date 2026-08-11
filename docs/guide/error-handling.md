# Error Handling

CLI Framework provides structured error handling with user-friendly output.

## Automatic Error Handling

Errors thrown in your `run` function are caught by the framework:

```ts
async run({ ui }) {
  throw new Error('Connection refused');
}
```

Output:

```
✖ Error: Connection refused
  at deploy (commands/deploy.ts:12:5)

  Tip: Check your network connection and try again.
```

## Stack Folding

The framework folds stack traces to show only your code. Node.js internals and `node_modules` paths are filtered out, making errors readable.

## Exit Codes

| Code | Meaning | When |
|------|---------|------|
| 0 | Success | Normal completion |
| 1 | General error | Unhandled exception |
| 2 | Argument error | Invalid option value |
| 3 | User cancelled | Ctrl+C during prompt |
| 4 | Configuration error | Invalid config file |

## Error Hints

The framework provides automatic hints for common error types:

- **Network errors** — suggests checking connectivity
- **Permission errors** — suggests checking file permissions
- **File not found** — suggests checking the path

## Programmatic API

You can use the error utilities directly:

```ts
import { prettyError, getErrorHint } from '@cliff/core';

try {
  await riskyOperation();
} catch (err) {
  process.stderr.write(prettyError(err as Error));
  const hint = getErrorHint(err as Error);
  if (hint) process.stderr.write(`\n  Tip: ${hint}\n`);
}
```

## Debug Mode

Enable debug mode to see full stack traces:

```bash
my-tool deploy --debug
```

Or set it programmatically:

```ts
const cli = createCli({
  name: 'my-tool',
  debug: true,
});
```
