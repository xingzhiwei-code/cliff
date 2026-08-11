# Project Structure

CLI Framework uses convention-over-configuration to organize your project. The filesystem is the API.

## Directory Layout

```
my-tool/
├── src/
│   ├── commands/           # Command files (auto-discovered)
│   │   ├── deploy.ts       # my-tool deploy
│   │   ├── deploy/
│   │   │   ├── status.ts   # my-tool deploy status
│   │   │   └── rollback.ts # my-tool deploy rollback
│   │   ├── config.ts       # my-tool config
│   │   └── index.ts        # my-tool (default command)
│   └── index.ts            # Entry point — creates the CLI
├── package.json
├── tsconfig.json
└── .my-tool.yml            # Project-level configuration
```

## Conventions

| Location | Convention | Result |
|----------|-----------|--------|
| `commands/hello.ts` | Flat file | `my-tool hello` |
| `commands/deploy/status.ts` | Nested directory | `my-tool deploy status` |
| `commands/index.ts` | Index file | Default command (runs at root) |
| `commands/hello.ts` → `export default` | Default export | Command definition |

## Entry Point

Create your CLI entry point at `src/index.ts`:

```ts
import { createCli } from '@cliff/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cli = createCli({
  name: 'my-tool',
  version: '1.0.0',
  description: 'My awesome CLI tool',
});

await cli.discover(__dirname);
await cli.run();
```

The `discover()` call scans the `commands/` directory and registers all found commands automatically. The `run()` call parses arguments and executes the matched command.
