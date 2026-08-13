# 命令

命令是 CLI 的核心。每个命令是 `commands/` 目录中的一个文件，导出 `defineCommand` 定义。

## 定义命令

```ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'deploy',
  description: '部署应用',
  help: '该命令将应用部署到指定环境。',
  options: {
    env: {
      type: 'string',
      default: 'staging',
      description: '目标环境',
    },
  },
  examples: [
    'my-tool deploy --env production',
    'my-tool deploy --env staging --force',
  ],
  async run({ options, ui, config, args, cli }) {
    // 你的命令逻辑
  },
});
```

## run 上下文

`run` 函数接收一个上下文对象，包含命令所需的一切信息：

| 属性 | 类型 | 说明 |
|------|------|------|
| `options` | `ResolvedOptions<T>` | 类型安全的解析后选项（已应用默认值） |
| `ui` | `Ui` | 完整的 UI 工具包（输出、提示、动画、表格） |
| `config` | `Record<string, unknown>` | 已加载的配置值 |
| `args` | `string[]` | 原始 CLI 参数 |
| `cli` | `Cli` | CLI 实例（高级用法） |

## 子命令

子命令通过嵌套目录创建：

```
commands/
├── deploy.ts            # my-tool deploy
└── deploy/
    ├── status.ts        # my-tool deploy status
    └── rollback.ts      # my-tool deploy rollback
```

每个子命令文件是标准的 `defineCommand` 定义，框架自动处理嵌套和路由。

## 隐藏命令

设置 `hidden: true` 可从 `--help` 和 Shell 补全中隐藏命令：

```ts
export default defineCommand({
  name: 'internal-task',
  hidden: true,
  async run({ ui }) {
    ui.log('执行内部任务...');
  },
});
```
