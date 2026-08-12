# Plugins

Extend your CLI with a first-class plugin system. Plugins can add commands, lifecycle hooks, and middleware.

## Defining a Plugin

Use `definePlugin` for type-safe plugin definitions:

```ts
import { definePlugin } from '@cliff/core';

export default definePlugin({
  name: '@my-tool/plugin-docker',
  commands: {
    'docker:build': {
      name: 'docker:build',
      description: 'Build Docker image',
      async run({ options, ui }) {
        await ui.spinner('Building image...', () => buildImage());
        ui.success('Image built');
      },
    },
  },
  hooks: {
    'before:run': async (ctx) => {
      console.log(`Running: ${ctx.name}`);
    },
    'after:run': async (ctx) => {
      console.log(`Completed: ${ctx.name}`);
    },
    'on:error': async (err) => {
      console.error('Command failed:', err.message);
    },
  },
});
```

## Auto-Discovery

Place plugins in a `plugins/` directory and they will be automatically loaded:

```
src/
├── plugins/
│   ├── docker.ts
│   └── slack.ts
├── commands/
│   └── deploy.ts
└── index.ts
```

```ts
// src/index.ts
const cli = createCli({ name: 'my-tool' });
await cli.discoverAllPlugins(__dirname);
await cli.discover(__dirname);
await cli.run();
```

## Loading Plugins

```ts
import { createCli } from '@cliff/core';
import dockerPlugin from '@my-tool/plugin-docker';

const cli = createCli({
  name: 'my-tool',
  plugins: [dockerPlugin],
});

// Or load dynamically
cli.use(dockerPlugin);
```

## Plugin Commands

Plugin commands are automatically namespaced with the plugin name prefix:

```bash
my-tool docker:build --tag latest
```

## Lifecycle Hooks

| Hook | When | Context |
|------|------|---------|
| `before:run` | Before any command executes | `{ name, args }` |
| `after:run` | After successful command completion | `{ name, args }` |
| `on:error` | When a command throws an error | `Error` |

## TypeScript

Plugins are fully typed:

```ts
import type { Plugin } from '@cliff/core';

const plugin: Plugin = {
  name: 'my-plugin',
  commands: {
    // ...
  },
  hooks: {
    'before:run': async (ctx) => {
      // ctx.name is typed as string
      // ctx.args is typed as string[]
    },
  },
};
```
