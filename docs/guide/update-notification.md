# Update Notification

cliff automatically checks for newer versions of your CLI package and shows a non-blocking notification when an update is available.

## How It Works

When `cli.run()` is called, the framework fires a background HTTP request to the npm registry to check the latest version. It does not block the command execution.

If a newer version is detected, a notice is printed to stderr:

```
  Update available!
   0.0.1 → 0.1.0
   Run pnpm add my-tool@latest to upgrade.
```

## Rate Limiting

Checks are rate-limited to once every 24 hours to avoid unnecessary network requests.

## Requirements

Your CLI `package.json` must be published to the npm registry. The update check uses the CLI name and version from `createCli`:

```ts
const cli = createCli({
  name: 'my-tool',     // must match npm package name
  version: '1.0.0',    // current version
});
```

## Programmatic API

You can also use the check function directly:

```ts
import { checkForUpdates } from '@cliffx/core';

const result = await checkForUpdates('my-tool', '1.0.0');
if (result?.outdated) {
  console.log(`New version available: ${result.latest}`);
}
```

## Silent Mode

Suppress the automatic notice:

```ts
await checkForUpdates('my-tool', '1.0.0', { silent: true });
```

## Disabling

To disable update checks entirely, omit the `version` field from `createCli` options.
