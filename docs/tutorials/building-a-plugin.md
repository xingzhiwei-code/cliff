# Building a Plugin

This tutorial walks through building `@cliffx/plugin-docker` — a Docker integration plugin that adds 5 commands to your CLI. You'll learn how to use `definePlugin`, lifecycle hooks, and command registration.

## What You'll Build

```bash
my-tool docker:build --tag my-app:latest
my-tool docker:push --tag my-app:latest
my-tool docker:run --image my-app:latest --port 3000:3000
my-tool docker:cleanup --all
my-tool docker:deploy --tag my-app:latest --port 3000:3000
```

## Step 1: Create the Plugin Package

Create a new directory under `packages/`:

```
packages/plugin-docker/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

`package.json`:

```json
{
  "name": "@cliffx/plugin-docker",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean"
  },
  "dependencies": {
    "@cliffx/core": "workspace:*",
    "@cliffx/ui": "workspace:*"
  }
}
```

## Step 2: Write the Plugin

Create `src/index.ts`:

```ts
import type { Plugin } from '@cliffx/core';
import { execSync } from 'node:child_process';

// Helper: run a docker command
function docker(args: string): string {
  return execSync(`docker ${args}`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

// Check if Docker daemon is running
function checkDockerDaemon(): boolean {
  try { docker('info'); return true; } catch { return false; }
}

export const pluginDocker: Plugin = {
  name: '@cliffx/plugin-docker',

  // Lifecycle hooks
  hooks: {
    'before:run': async () => {
      if (!checkDockerDaemon()) {
        throw new Error('Docker daemon is not running.');
      }
    },
  },

  // Commands
  commands: {
    'docker:build': {
      name: 'docker:build',
      description: 'Build a Docker image',
      options: {
        tag: { type: 'string', description: 'Image tag' },
        file: { type: 'string', default: 'Dockerfile', description: 'Dockerfile path' },
      },
      async run({ options, ui }) {
        const result = await ui.spinner(
          `Building ${options.tag}...`,
          () => docker(`build -t ${options.tag} -f ${options.file} .`),
        );
        ui.success(`Built: ${options.tag}`);
        ui.stdout(result);
      },
    },
  },
};

export default pluginDocker;
```

## Step 3: Load the Plugin

In your CLI entry point:

```ts
import { createCli } from '@cliffx/core';
import pluginDocker from '@cliffx/plugin-docker';

const cli = createCli({
  name: 'my-tool',
  plugins: [pluginDocker],
});

await cli.discover(__dirname);
await cli.run();
```

## Key Concepts

**`definePlugin`** provides type-safe plugin definitions. You can also use the raw `Plugin` interface — `definePlugin` is just a convenience wrapper.

**Command naming** — plugin commands use the plugin name as a namespace prefix. `@cliffx/plugin-docker` → `docker:build`, `docker:push`, etc.

**Lifecycle hooks** fire at specific points in the CLI lifecycle:
- `before:run` — before any command executes (ideal for validation)
- `after:run` — after successful completion (ideal for cleanup)
- `on:error` — when a command throws (ideal for error reporting)

**Auto-discovery** — place plugins in a `plugins/` directory and call `cli.discoverAllPlugins()` to load them automatically.

## Next Steps

Now that you've built a plugin, try [building a complete CLI app](/tutorials/building-a-cli-app) that uses it.
