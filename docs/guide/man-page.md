# Man Page

cliff can generate Unix man pages in troff format for your CLI tool.

## Generating a Man Page

```ts
import { generateManPage, printManPage } from '@cliffx/core';

// Generate as a string
const manPage = generateManPage('my-tool', '1.0.0', 'My CLI tool', cli.getCommands());

// Print directly to stdout
printManPage('my-tool', '1.0.0', 'My CLI tool', cli.getCommands());
```

## Adding a `man` Command

Add a built-in command to your CLI for man page generation:

```ts
export default defineCommand({
  name: 'man',
  description: 'Generate man page',
  async run({ cli }) {
    printManPage(
      cli.options.name,
      cli.options.version,
      cli.options.description,
      cli.getCommands(),
    );
  },
});
```

Then pipe it to the man directory:

```bash
my-tool man > /usr/local/share/man/man1/my-tool.1
man my-tool
```

## Man Page Structure

The generated man page includes:

- **NAME** — CLI name and description
- **SYNOPSIS** — usage pattern
- **DESCRIPTION** — from `createCli` description
- **COMMANDS** — all registered commands with their options
- **GLOBAL OPTIONS** — `--help`, `--version`, `--debug`
- **SEE ALSO** — references to related tools

## Format

The output is standard troff format, compatible with the `man` command on macOS, Linux, and other Unix systems.
