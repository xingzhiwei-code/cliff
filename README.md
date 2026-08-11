# cliff

The Next.js for CLI tools — build production-grade command-line tools with zero boilerplate.

```ts
// commands/deploy.ts
import { defineCommand } from '@cliff/core';

export default defineCommand({
  name: 'deploy',
  options: {
    env: { type: 'string', default: 'staging' },
    force: { type: 'boolean', default: false },
  },
  async run({ options, ui }) {
    const confirmed = await ui.confirm(`Deploy to ${options.env}?`);
    if (!confirmed) return;

    await ui.spinner('Building...', () => build());
    ui.table(result.files, ['name', 'size', 'time']);
    ui.success('Deployed!');
  },
});
```

## Features

- **Zero config** — auto-discover commands from your filesystem
- **Built-in UI** — colored output, tables, spinners, progress bars, interactive prompts
- **TypeScript-first** — full type inference for options and commands
- **Plugin system** — extend your CLI with first-class plugins
- **Shell completion** — automatic bash, zsh, and fish completion
- **Test utilities** — built-in test harness captures stdout/stderr and exit codes
- **Zero runtime dependencies** — ships with only Node.js standard library

## Quick Start

```bash
npx create-cli my-tool
cd my-tool
pnpm dev
```

## Packages

| Package | Description |
|---------|-------------|
| `@cliff/core` | Command system, parser, help, config, shell completion |
| `@cliff/ui` | Terminal UI — output, prompts, spinners, tables, colors |
| `@cliff/test` | Test harness for CLI integration testing |
| `create-cli` | Project scaffolding wizard |

## License

MIT
