# 项目介绍

cliff 是一个功能齐全的 TypeScript 命令行工具开发框架。它之于 CLI 开发，正如 Next.js 之于 React — 框架帮你处理所有样板代码，你只需专注于功能本身。

## 问题

如今构建一个像样的 CLI 工具，需要拼凑 10+ 个库：

| 能力 | 常见库 |
|------|--------|
| 参数解析 | commander / yargs |
| 交互式提示 | inquirer / prompts |
| 彩色输出 | chalk |
| 表格 | cli-table3 |
| 动画 | ora |
| Shell 补全 | tabtab |
| 配置加载 | cosmiconfig |
| 错误格式化 | 手写 |
| 插件系统 | 手写 |
| 更新通知 | update-notifier |

**样板代码比业务逻辑还多。**

## 解决方案

cliff 在一个统一的包中提供所有这些能力 — 零运行时依赖。

```ts
// commands/deploy.ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'deploy',
  description: '部署到生产环境',
  options: {
    env: { type: 'string', default: 'staging', description: '目标环境' },
    force: { type: 'boolean', default: false, alias: 'f' },
  },
  async run({ options, ui }) {
    const confirmed = await ui.confirm(`部署到 ${options.env}？`);
    if (!confirmed) return;

    await ui.spinner('构建中...', () => build());
    ui.success('部署成功！');
  },
});
```

## 设计哲学

- **约定优于配置** — 合理的默认值，需要时可以覆盖
- **渐进式披露** — 简单的事情很简单，复杂的事情可实现
- **TypeScript 优先** — 每个 API 都有完整的类型推断
- **零运行时依赖** — 仅使用 Node.js 标准库

## 对比

| 功能 | cliff | oclif | commander | yargs |
|------|:---:|:---:|:---:|:---:|
| 参数解析 | ✅ | ✅ | ✅ | ✅ |
| 子命令自动发现 | ✅ | ✅ | ❌ | ❌ |
| 交互式 UI | ✅ | ❌ | ❌ | ❌ |
| 插件系统 | ✅ | ✅ | ❌ | ❌ |
| Shell 补全 | ✅ | ✅ | ❌ | ❌ |
| 配置自动加载 | ✅ | ❌ | ❌ | ❌ |
| 测试工具 | ✅ | ❌ | ❌ | ❌ |
| TypeScript 类型 | ✅ | ❌ | ❌ | ❌ |
| 零依赖 | ✅ | ❌ | ❌ | ❌ |
