# @cliff/core

The core package provides the command system, argument parser, help generator, error handling, configuration management, and shell completion.

## Installation

```bash
pnpm add @cliff/core
```

## Exports

### `defineCommand`

Define a command with full type inference for options.

```ts
import { defineCommand } from '@cliff/core';

export default defineCommand({
  name: 'deploy',
  description: 'Deploy the application',
  options: {
    env: { type: 'string', default: 'staging', alias: 'e' },
    force: { type: 'boolean', default: false, alias: 'f' },
  },
  examples: ['my-tool deploy --env production'],
  async run({ options, ui, config, args, cli }) {
    // ...
  },
});
```

**Parameters:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Command name (kebab-case) |
| `description` | `string` | No | Short description shown in help |
| `help` | `string` | No | Long-form help text |
| `options` | `OptionsDef` | No | Option definitions |
| `examples` | `string[]` | No | Usage examples |
| `hidden` | `boolean` | No | Hide from help and completion |
| `run` | `(ctx) => void \| Promise<void>` | Yes | Command handler |

### `createCli`

Create a CLI instance.

```ts
import { createCli } from '@cliff/core';

const cli = createCli({
  name: 'my-tool',
  version: '1.0.0',
  description: 'My awesome CLI',
  commandsDir: 'commands',
  plugins: [],
  debug: false,
});
```

**Parameters:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | — | CLI name (required) |
| `version` | `string` | — | Version string |
| `description` | `string` | — | Top-level description |
| `commandsDir` | `string` | `'commands'` | Directory to scan for commands |
| `plugins` | `Plugin[]` | `[]` | Plugins to load |
| `debug` | `boolean` | `false` | Enable debug mode |

### `Cli`

The CLI class instance returned by `createCli`.

**Methods:**

| Method | Description |
|--------|-------------|
| `register(def)` | Register a command programmatically |
| `use(plugin)` | Load a plugin |
| `discover(baseDir)` | Auto-discover commands from directory |
| `getCommands()` | Get all registered commands |
| `run(args?)` | Run the CLI with given arguments |

### `parseArgs`

Parse raw argv strings against option definitions.

```ts
import { parseArgs } from '@cliff/core';

const options = parseArgs(['--env', 'prod', '--force'], {
  env: { type: 'string', default: 'staging' },
  force: { type: 'boolean', default: false },
});
// options.env → 'prod'
// options.force → true
```

### `generateHelp` / `generateRootHelp`

Generate formatted help text.

```ts
import { generateHelp, generateRootHelp } from '@cliff/core';

const helpText = generateHelp(command, 'my-tool');
const rootHelp = generateRootHelp('my-tool', '1.0.0', 'Description', cmds);
```

### `generateCompletion` / `printCompletion`

Generate shell completion scripts.

```ts
import { generateCompletion, printCompletion } from '@cliff/core';

const script = generateCompletion(cli);
printCompletion(cli); // writes to stdout
```

### `loadConfig` / `loadEnv` / `resolveOptions`

Configuration management utilities.

```ts
import { loadConfig, loadEnv, envPrefix, resolveOptions } from '@cliff/core';

const config = loadConfig('my-tool');
// { values: { env: 'production' }, source: '/path/.my-tool.yml' }

const prefix = envPrefix('my-tool'); // → 'MY_TOOL'
const env = loadEnv(prefix); // → { env: 'production' }

const final = resolveOptions(cliArgs, env, config.values, optionsDef);
```

### `prettyError` / `getErrorHint`

Error formatting utilities.

```ts
import { prettyError, getErrorHint } from '@cliff/core';

const formatted = prettyError(new Error('Something broke'));
const hint = getErrorHint(new Error('Connection refused'));
// → 'Check your network connection and try again.'
```

## Types

```ts
import type {
  Command, CommandDef, OptionsDef, OptionDef, OptionType,
  RunContext, ResolvedOptions, Plugin, CliOptions,
} from '@cliff/core';
```

| Type | Description |
|------|-------------|
| `CommandDef<T>` | Command definition with typed options |
| `OptionsDef` | Map of option name to definition |
| `OptionDef` | Single option definition |
| `OptionType` | `'string' \| 'boolean' \| 'number' \| 'enum'` |
| `RunContext<T>` | Context passed to `run()` |
| `ResolvedOptions<T>` | Resolved options with correct types |
| `Plugin` | Plugin definition |
| `CliOptions` | CLI constructor options |
