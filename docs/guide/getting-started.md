# Introduction

CLI Framework is a batteries-included toolkit for building command-line tools in TypeScript. It is to CLI development what Next.js is to React — a framework that handles the boilerplate so you can focus on your features.

## The Problem

Building a polished CLI tool today requires stitching together 10+ libraries:

| Capability | Typical Library |
|------------|----------------|
| Argument parsing | commander / yargs |
| Interactive prompts | inquirer / prompts |
| Colored output | chalk |
| Tables | cli-table3 |
| Spinners | ora |
| Shell completion | tabtab |
| Config loading | cosmiconfig |
| Error formatting | hand-written |
| Plugin system | hand-written |
| Update notifications | update-notifier |

**More boilerplate than business logic.**

## The Solution

CLI Framework provides all of these capabilities in a single, cohesive package — with zero runtime dependencies.

```ts
// commands/deploy.ts
import { defineCommand } from '@cliff/core';

export default defineCommand({
  name: 'deploy',
  description: 'Deploy to production',
  options: {
    env: { type: 'string', default: 'staging', description: 'Target environment' },
    force: { type: 'boolean', default: false, alias: 'f' },
  },
  async run({ options, ui }) {
    const confirmed = await ui.confirm(`Deploy to ${options.env}?`);
    if (!confirmed) return;

    await ui.spinner('Building...', () => build());
    ui.success('Deployed!');
  },
});
```

## Design Philosophy

- **Convention over Configuration** — sensible defaults that you can override when needed
- **Progressive Disclosure** — simple things are simple, advanced things are possible
- **TypeScript-first** — every API is fully typed with inference
- **Zero Runtime Dependencies** — ships with only Node.js standard library

## Comparison

| Feature | CLI Framework | oclif | commander | yargs |
|---------|:---:|:---:|:---:|:---:|
| Argument parsing | ✅ | ✅ | ✅ | ✅ |
| Subcommand discovery | ✅ auto | ✅ convention | ❌ manual | ❌ |
| Interactive UI | ✅ | ❌ | ❌ | ❌ |
| Plugin system | ✅ | ✅ | ❌ | ❌ |
| Shell completion | ✅ auto | ✅ manual | ❌ | ❌ |
| Config auto-loading | ✅ | ❌ | ❌ | ❌ |
| Test utilities | ✅ | ❌ | ❌ | ❌ |
| TypeScript types | ✅ | ❌ | ❌ | ❌ |
| Zero dependencies | ✅ | ❌ | ❌ | ❌ |
