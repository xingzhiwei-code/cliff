# 配置管理

cliff 自动从多个来源加载配置，具有清晰的优先级链。

## 优先级

值按以下顺序解析（优先级从高到低）：

1. **CLI 参数** — `--env production`
2. **环境变量** — `MY_TOOL_ENV=production`
3. **项目配置文件** — `.my-tool.yml`、`.my-tool.json`、`.my-toolrc`
4. **用户配置** — `~/.my-tool.yml`、`~/.my-tool.json`
5. **默认值** — 来自 `defineCommand` 选项

## 配置格式

框架自动按文件名检测格式，支持多种格式：

| 格式 | 文件名 |
|------|--------|
| JSON | `.my-tool.json`、`my-tool.config.json` |
| YAML | `.my-tool.yml`、`.my-tool.yaml` |
| TOML | `.my-tool.toml` |
| RC | `.my-toolrc` |

`.my-tool.yml` 示例：

```yaml
env: production
force: true
region: us-west
```

## 环境变量

环境变量自动从 `UPPER_SNAKE_CASE` 映射到 `camelCase` 选项键。前缀从 CLI 名称派生。

对于名为 `my-tool` 的 CLI：

| 环境变量 | 选项键 |
|----------|--------|
| `MY_TOOL_ENV` | `env` |
| `MY_TOOL_FORCE` | `force` |
| `MY_TOOL_REGION` | `region` |

## 程序访问

在 `run` 函数中访问已加载的配置：

```ts
async run({ config, ui }) {
  ui.log(`配置来源：${config._source}`);
  ui.log(`API URL：${config.apiUrl}`);
}
```

`loadConfig` 函数也可直接导出使用：

```ts
import { loadConfig, loadEnv, envPrefix, resolveOptions } from '@cliffx/core';

const config = loadConfig('my-tool');
// config.values → { env: 'production', ... }
// config.source → '/path/to/.my-tool.yml'
```
