# @cliffx/core

核心包提供命令系统、参数解析器、帮助生成器、错误处理、配置管理和 Shell 补全。

## 安装

```bash
pnpm add @cliffx/core
```

## 导出

### `defineCommand`

定义命令，具有完整的选项类型推断。

```ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'deploy',
  description: '部署应用',
  options: {
    env: { type: 'string', default: 'staging', alias: 'e' },
    force: { type: 'boolean', default: false, alias: 'f' },
  },
  examples: ['my-tool deploy --env production'],
  async run({ options, ui, config, args, cli }) {
    // ...
  },
});
```

**参数：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 命令名称（kebab-case） |
| `description` | `string` | 否 | 帮助中显示的简短描述 |
| `help` | `string` | 否 | 详细帮助文本 |
| `options` | `OptionsDef` | 否 | 选项定义 |
| `examples` | `string[]` | 否 | 使用示例 |
| `hidden` | `boolean` | 否 | 从帮助和补全中隐藏 |
| `run` | `(ctx) => void \| Promise<void>` | 是 | 命令处理函数 |

### `createCli`

创建 CLI 实例。

```ts
import { createCli } from '@cliffx/core';

const cli = createCli({
  name: 'my-tool',
  version: '1.0.0',
  description: '一个很棒的 CLI',
  commandsDir: 'commands',
  plugins: [],
  debug: false,
});
```

**参数：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | — | CLI 名称（必填） |
| `version` | `string` | — | 版本号 |
| `description` | `string` | — | 顶层描述 |
| `commandsDir` | `string` | `'commands'` | 扫描命令的目录 |
| `plugins` | `Plugin[]` | `[]` | 要加载的插件 |
| `debug` | `boolean` | `false` | 启用调试模式 |

### `Cli`

`createCli` 返回的 CLI 类实例。

**方法：**

| 方法 | 说明 |
|------|------|
| `register(def)` | 编程方式注册命令 |
| `use(plugin)` | 加载插件 |
| `discover(baseDir)` | 从目录自动发现命令 |
| `getCommands()` | 获取所有已注册的命令 |
| `run(args?)` | 使用给定参数运行 CLI |

### `parseArgs`

根据选项定义解析原始 argv 字符串。

```ts
import { parseArgs } from '@cliffx/core';

const options = parseArgs(['--env', 'prod', '--force'], {
  env: { type: 'string', default: 'staging' },
  force: { type: 'boolean', default: false },
});
// options.env → 'prod'
// options.force → true
```

### `generateHelp` / `generateRootHelp`

生成格式化的帮助文本。

```ts
import { generateHelp, generateRootHelp } from '@cliffx/core';

const helpText = generateHelp(command, 'my-tool');
const rootHelp = generateRootHelp('my-tool', '1.0.0', '描述', cmds);
```

### `generateCompletion` / `printCompletion`

生成 Shell 补全脚本。

```ts
import { generateCompletion, printCompletion } from '@cliffx/core';

const script = generateCompletion(cli);
printCompletion(cli); // 输出到 stdout
```

### `loadConfig` / `loadEnv` / `resolveOptions`

配置管理工具。

```ts
import { loadConfig, loadEnv, envPrefix, resolveOptions } from '@cliffx/core';

const config = loadConfig('my-tool');
// { values: { env: 'production' }, source: '/path/.my-tool.yml' }

const prefix = envPrefix('my-tool'); // → 'MY_TOOL'
const env = loadEnv(prefix); // → { env: 'production' }

const final = resolveOptions(cliArgs, env, config.values, optionsDef);
```

### `prettyError` / `getErrorHint`

错误格式化工具。

```ts
import { prettyError, getErrorHint } from '@cliffx/core';

const formatted = prettyError(new Error('出错了'));
const hint = getErrorHint(new Error('连接被拒绝'));
// → '请检查网络连接并重试。'
```

## 类型

```ts
import type {
  Command, CommandDef, OptionsDef, OptionDef, OptionType,
  RunContext, ResolvedOptions, Plugin, CliOptions,
} from '@cliffx/core';
```

| 类型 | 说明 |
|------|------|
| `CommandDef<T>` | 带类型选项的命令定义 |
| `OptionsDef` | 选项名到定义的映射 |
| `OptionDef` | 单个选项定义 |
| `OptionType` | `'string' \| 'boolean' \| 'number' \| 'enum'` |
| `RunContext<T>` | 传递给 `run()` 的上下文 |
| `ResolvedOptions<T>` | 具有正确类型的解析后选项 |
| `Plugin` | 插件定义 |
| `CliOptions` | CLI 构造选项 |
