# Configuration

CLI Framework automatically loads configuration from multiple sources with a clear priority chain.

## Priority Chain

Values are resolved in this order (highest priority first):

1. **CLI arguments** — `--env production`
2. **Environment variables** — `MY_TOOL_ENV=production`
3. **Project config files** — `.my-tool.yml`, `.my-tool.json`, `.my-toolrc`
4. **User config files** — `~/.my-tool.yml`, `~/.my-tool.json`
5. **Default values** — from `defineCommand` options

## Config File Formats

The framework auto-detects config files by name and supports multiple formats:

| Format | Filename |
|--------|----------|
| JSON | `.my-tool.json`, `my-tool.config.json` |
| YAML | `.my-tool.yml`, `.my-tool.yaml` |
| TOML | `.my-tool.toml` |
| RC | `.my-toolrc` |

Example `.my-tool.yml`:

```yaml
env: production
force: true
region: us-west
```

## Environment Variables

Environment variables are automatically mapped from `UPPER_SNAKE_CASE` to the `camelCase` option key. The prefix is derived from your CLI name.

For a CLI named `my-tool`:

| Environment Variable | Option Key |
|---------------------|------------|
| `MY_TOOL_ENV` | `env` |
| `MY_TOOL_FORCE` | `force` |
| `MY_TOOL_REGION` | `region` |

## Programmatic Access

You can access loaded config in your `run` function:

```ts
async run({ config, ui }) {
  ui.log(`Config loaded from: ${config._source}`);
  ui.log(`API URL: ${config.apiUrl}`);
}
```

The `loadConfig` function is also exported for direct use:

```ts
import { loadConfig, loadEnv, envPrefix, resolveOptions } from '@cliff/core';

const config = loadConfig('my-tool');
// config.values → { env: 'production', ... }
// config.source → '/path/to/.my-tool.yml'
```
