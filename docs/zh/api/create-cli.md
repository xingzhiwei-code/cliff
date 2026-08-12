# create-cli

用于快速创建 cliff 项目的脚手架工具。

## 快速开始

```bash
npx create-cli my-tool
```

## 交互流程

向导引导你完成以下步骤：

1. **项目名称** — CLI 命令名称（kebab-case）
2. **包管理器** — npm、pnpm 或 yarn
3. **语言** — TypeScript（推荐）或 JavaScript
4. **模板** — 三种选择

## 模板

### 基础版

最简 CLI，只有一个命令。适合简单脚本。

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

### 子命令版

带嵌套子命令的 CLI。适合多功能工具。

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

### 全功能版

包含所有内容：命令、插件、测试、CI 配置。适合生产级工具。

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

## 生成的文件

每个模板都包含：

- **`package.json`** — 含 `bin` 字段和构建脚本
- **`tsconfig.json`** — 预配置好的 Node.js 配置
- **`.my-tool.yml`** — 默认项目配置
- **`README.md`** — 含使用说明

## 脚手架完成后

```bash
cd my-tool
pnpm install
pnpm dev
```

你的 CLI 现在以开发模式运行。编辑 `src/commands/` 中的文件，修改即时生效。
