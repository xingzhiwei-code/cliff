# Shell Completion

CLI Framework generates shell completion scripts for bash, zsh, and fish automatically.

## Installation

Add the completion script to your shell config:

```bash
# bash
my-tool completion >> ~/.bashrc

# zsh
my-tool completion >> ~/.zshrc

# fish
my-tool completion > ~/.config/fish/completions/my-tool.fish
```

## What Gets Completed

Completion is generated automatically from your command definitions:

- **Command names** — all registered commands and subcommands
- **Option names** — `--env`, `--force`, `--region`
- **Option values** — for enum types, the allowed choices are suggested

## Programmatic API

You can generate completion scripts programmatically:

```ts
import { generateCompletion, printCompletion } from '@cliff/core';

// Generate as a string
const script = generateCompletion(cli);

// Print directly to stdout for piping
printCompletion(cli);
```

To add a `completion` command to your CLI:

```ts
export default defineCommand({
  name: 'completion',
  description: 'Generate shell completion script',
  async run({ cli }) {
    printCompletion(cli);
  },
});
```

The completion generator auto-detects the shell from the `SHELL` environment variable.
