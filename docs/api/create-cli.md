# create-cli

The scaffolding tool for bootstrapping new CLI Framework projects.

## Quick Start

```bash
npx create-cli my-tool
```

## Interactive Flow

The wizard walks you through these steps:

1. **Project name** — your CLI binary name (kebab-case)
2. **Package manager** — npm, pnpm, or yarn
3. **Language** — TypeScript (recommended) or JavaScript
4. **Template** — choose from three options

## Templates

### Basic

A minimal CLI with a single command. Best for simple scripts.

```
my-tool/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── .my-tool.yml
```

### Subcommands

A CLI with nested subcommands. Best for tools with multiple features.

```
my-tool/
├── src/
│   ├── commands/
│   │   ├── deploy.ts
│   │   ├── config.ts
│   │   └── deploy/
│   │       ├── status.ts
│   │       └── rollback.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── .my-tool.yml
```

### Full

Everything included: commands, plugins, tests, CI config. Best for production tools.

```
my-tool/
├── src/
│   ├── commands/
│   │   ├── deploy.ts
│   │   ├── config.ts
│   │   └── deploy/
│   │       ├── status.ts
│   │       └── rollback.ts
│   └── index.ts
├── tests/
│   └── deploy.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .my-tool.yml
```

## Generated Files

Every template includes:

- **`package.json`** — with `bin` field and build scripts
- **`tsconfig.json`** — pre-configured for Node.js
- **`.my-tool.yml`** — default project configuration
- **`README.md`** — with usage instructions

## After Scaffolding

```bash
cd my-tool
pnpm install
pnpm dev
```

Your CLI is now running in development mode. Edit `src/commands/` and changes are reflected immediately.
