# Commands

Commands are the heart of your CLI. Each command is a file in the `commands/` directory that exports a `defineCommand` definition.

## Defining a Command

```ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'deploy',
  description: 'Deploy the application',
  help: 'This command deploys the application to the specified environment.',
  options: {
    env: {
      type: 'string',
      default: 'staging',
      description: 'Target environment',
    },
  },
  examples: [
    'my-tool deploy --env production',
    'my-tool deploy --env staging --force',
  ],
  async run({ options, ui, config, args, cli }) {
    // Your command logic here
  },
});
```

## The `run` Context

The `run` function receives a context object with everything your command needs:

| Property | Type | Description |
|----------|------|-------------|
| `options` | `ResolvedOptions<T>` | Typed, resolved options with defaults applied |
| `ui` | `Ui` | Full UI toolkit (output, prompts, spinners, tables) |
| `config` | `Record<string, unknown>` | Loaded configuration values |
| `args` | `string[]` | Raw CLI arguments |
| `cli` | `Cli` | The CLI instance (for advanced use) |

## Subcommands

Subcommands are created by nesting directories:

```
commands/
├── deploy.ts            # my-tool deploy
└── deploy/
    ├── status.ts        # my-tool deploy status
    └── rollback.ts      # my-tool deploy rollback
```

Each subcommand file is a standard `defineCommand` definition. The framework handles nesting and routing automatically.

## Hidden Commands

Set `hidden: true` to hide a command from `--help` output and shell completion:

```ts
export default defineCommand({
  name: 'internal-task',
  hidden: true,
  async run({ ui }) {
    ui.log('Running internal task...');
  },
});
```
