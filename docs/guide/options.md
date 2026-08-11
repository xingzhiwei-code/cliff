# Options & Arguments

Options are defined per-command with full type safety. The framework handles parsing, validation, and help text generation.

## Defining Options

```ts
export default defineCommand({
  name: 'deploy',
  options: {
    env: {
      type: 'string',
      default: 'staging',
      description: 'Target environment',
      alias: 'e',
    },
    force: {
      type: 'boolean',
      default: false,
      description: 'Skip confirmation prompts',
      alias: 'f',
    },
    retries: {
      type: 'number',
      default: 3,
      description: 'Number of retry attempts',
    },
    region: {
      type: 'enum',
      choices: ['us-east', 'us-west', 'eu-west'],
      default: 'us-east',
      description: 'Deployment region',
    },
  },
  async run({ options }) {
    // options.env    → string
    // options.force  → boolean
    // options.retries → number
    // options.region  → 'us-east' | 'us-west' | 'eu-west'
  },
});
```

## Option Types

| Type | CLI Usage | Default |
|------|-----------|---------|
| `string` | `--env production` or `--env=production` | `default` value |
| `boolean` | `--force` or `--no-force` | `false` |
| `number` | `--retries 5` or `--retries=5` | `default` value |
| `enum` | `--region us-east` | First choice or `default` |

## Short Aliases

Use `alias` to define a single-character flag:

```ts
options: {
  env: { type: 'string', alias: 'e' },
  force: { type: 'boolean', alias: 'f' },
}
```

```bash
my-tool deploy -e production -f
```

## Type Safety

Options are fully typed through TypeScript inference. The `options` parameter in `run()` automatically has the correct types based on your definitions — no manual type assertions needed.

```ts
// options.env is typed as string, not string | undefined
// because it has a default value
console.log(options.env.toUpperCase()); // ✅
```

## Validation

The framework validates options automatically:

- **number**: throws if the value is not a valid number
- **enum**: throws if the value is not in the allowed choices
- **missing required**: throws with a helpful message

All validation errors are caught and displayed with formatted error messages.
