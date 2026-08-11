# Quick Start

Scaffold a new CLI project in seconds.

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (recommended) or npm

## Create a New Project

```bash
npx create-cli my-tool
```

The interactive wizard will guide you through:

1. **Project name** — your CLI binary name
2. **Package manager** — npm, pnpm, or yarn
3. **Language** — TypeScript or JavaScript
4. **Template** — basic, subcommands, or full-featured

## Start Developing

```bash
cd my-tool
pnpm dev
```

Your CLI is ready. Try it:

```bash
node dist/index.js hello
```

## Project Structure

```
my-tool/
├── src/
│   ├── commands/       # Your commands live here
│   │   └── hello.ts    # Auto-discovered command
│   └── index.ts        # Entry point
├── package.json
├── tsconfig.json
└── .my-tool.yml        # Config file
```

## Your First Command

```ts
// src/commands/hello.ts
import { defineCommand } from '@cliff/core';

export default defineCommand({
  name: 'hello',
  description: 'Say hello',
  options: {
    name: {
      type: 'string',
      default: 'World',
      description: 'Who to greet',
    },
  },
  async run({ options, ui }) {
    ui.success(`Hello, ${options.name}!`);
  },
});
```

## Next Steps

- Learn about [Commands](/guide/commands) and how they work
- Explore the [Options & Arguments](/guide/options) system
- Check out the [UI Components](/guide/output) for rich terminal output
