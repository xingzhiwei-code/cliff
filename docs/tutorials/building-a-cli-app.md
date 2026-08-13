# Building a CLI App

This tutorial walks through building an API debugging tool from scratch using cliff. You'll learn how to set up a project, create commands with subcommands, use tables and spinners, and manage local data.

## What You'll Build

```bash
api request --method GET --url https://api.github.com
api request --method POST --url https://api.example.com --body '{"key":"value"}' --save my-request
api collection list
api collection run --name my-request
api collection delete --name my-request
```

## Step 1: Create the Project

Create a new directory with the cliff scaffold:

```bash
npx create-cli api-cli
cd api-cli
pnpm install
```

Your project structure:

```
api-cli/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Step 2: The Entry Point

Edit `src/index.ts`:

```ts
import { createCli } from '@cliffx/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cli = createCli({
  name: 'api',
  version: '0.0.1',
  description: 'API debugging tool — curl for the TypeScript era',
});

await cli.discover(__dirname);
await cli.run();
```

## Step 3: Create the Request Command

Create `src/commands/request.ts`:

```ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'request',
  description: 'Send an HTTP request',
  options: {
    method: {
      type: 'enum',
      choices: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
      alias: 'X',
    },
    url: { type: 'string', description: 'Request URL' },
    headers: { type: 'string', description: 'Headers (key:value,key:value)', alias: 'H' },
    body: { type: 'string', description: 'JSON body', alias: 'd' },
    save: { type: 'string', description: 'Save to collection' },
  },
  async run({ options, ui }) {
    const headers = parseHeaders(String(options.headers));
    const body = options.body ? String(options.body) : undefined;

    // Send the request with a spinner
    const result = await ui.spinner(`${options.method} ${options.url}`, async () => {
      const start = Date.now();
      const res = await fetch(options.url as string, {
        method: options.method as string,
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
      });
      const duration = Date.now() - start;
      const text = await res.text();
      return { status: res.status, statusText: res.statusText, body: text, duration };
    });

    // Format and display the response
    ui.log(`${result.status} ${result.statusText} — ${result.duration}ms`);

    // Response headers as a table
    ui.newline();
    ui.section('Response Body');
    ui.stdout(JSON.stringify(JSON.parse(result.body), null, 2));
  },
});
```

## Step 4: Create Collection Subcommands

Nested directories create subcommands automatically:

```
src/commands/
├── request.ts
└── collection/
    ├── list.ts
    ├── run.ts
    └── delete.ts
```

Create `src/commands/collection/list.ts`:

```ts
import { defineCommand } from '@cliffx/core';
import { readFileSync, existsSync } from 'node:fs';

export default defineCommand({
  name: 'list',
  description: 'List saved requests',
  async run({ ui }) {
    const collections = loadCollections();
    const rows = Object.values(collections).map((e) => ({
      name: e.name, method: e.method, url: e.url,
    }));
    ui.table(rows, ['name', 'method', 'url']);
  },
});
```

## Step 5: Run It

```bash
pnpm dev
node dist/index.js request --url https://api.github.com
```

Or with a full example:

```bash
api request --method POST \
  --url https://jsonplaceholder.typicode.com/posts \
  --body '{"title":"hello","body":"world","userId":1}'
```

## Key Concepts

**Filesystem routing** — `commands/collection/list.ts` becomes `api collection list`. No manual registration needed.

**UI components** — `ui.spinner` for async operations, `ui.table` for tabular data, `ui.section` for structure, `ui.stdout` for pipeable output.

**Data persistence** — use `node:fs` to read/write JSON files. Store in `~/.api-cli/` for user-level data.

**Type safety** — `defineCommand` infers option types. `options.url` is typed as `string` because it has no default, `options.method` as the enum choices union.

## Next Steps

Now that you've built a CLI app, try [building a plugin](/tutorials/building-a-plugin) to extend it with additional capabilities.
