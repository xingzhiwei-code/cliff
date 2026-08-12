# 快速上手

几秒内创建一个新的 CLI 项目。

## 环境要求

- Node.js >= 20
- pnpm >= 9（推荐）或 npm

## 创建项目

```bash
npx create-cli my-tool
```

交互式向导将引导你完成：

1. **项目名称** — CLI 命令名称
2. **包管理器** — npm、pnpm 或 yarn
3. **语言** — TypeScript 或 JavaScript
4. **模板** — 基础版、子命令版或全功能版

## 开始开发

```bash
cd my-tool
pnpm dev
```

你的 CLI 已经就绪，试试看：

```bash
node dist/index.js hello
```

## 项目结构

```
my-tool/
├── src/
│   ├── commands/       # 命令文件放在这里
│   │   └── hello.ts    # 自动发现的命令
│   └── index.ts        # 入口文件
├── package.json
├── tsconfig.json
└── .my-tool.yml        # 配置文件
```

## 第一个命令

```ts
// src/commands/hello.ts
import { defineCommand } from '@cliff/core';

export default defineCommand({
  name: 'hello',
  description: '打个招呼',
  options: {
    name: {
      type: 'string',
      default: 'World',
      description: '打招呼的对象',
    },
  },
  async run({ options, ui }) {
    ui.success(`你好，${options.name}！`);
  },
});
```

## 下一步

- 了解[命令](/zh/guide/commands)系统
- 探索[选项与参数](/zh/guide/options)
- 看看[输出组件](/zh/guide/output)实现丰富的终端输出
