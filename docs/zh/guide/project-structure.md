# 项目结构

cliff 使用约定优于配置的方式组织项目。文件系统即 API。

## 目录布局

```
my-tool/
├── src/
│   ├── commands/           # 命令文件（自动发现）
│   │   ├── deploy.ts       # my-tool deploy
│   │   ├── deploy/
│   │   │   ├── status.ts   # my-tool deploy status
│   │   │   └── rollback.ts # my-tool deploy rollback
│   │   ├── config.ts       # my-tool config
│   │   └── index.ts        # my-tool（默认命令）
│   └── index.ts            # 入口 — 创建 CLI 实例
├── package.json
├── tsconfig.json
└── .my-tool.yml            # 项目级配置
```

## 约定

| 位置 | 约定 | 结果 |
|------|------|------|
| `commands/hello.ts` | 平面文件 | `my-tool hello` |
| `commands/deploy/status.ts` | 嵌套目录 | `my-tool deploy status` |
| `commands/index.ts` | 索引文件 | 默认命令（在根级运行） |
| `commands/hello.ts` → `export default` | 默认导出 | 命令定义 |

## 入口文件

在 `src/index.ts` 中创建 CLI 入口：

```ts
import { createCli } from '@cliffx/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cli = createCli({
  name: 'my-tool',
  version: '1.0.0',
  description: '一个很棒的 CLI 工具',
});

await cli.discover(__dirname);
await cli.run();
```

`discover()` 调用扫描 `commands/` 目录并自动注册所有找到的命令。`run()` 调用解析参数并执行匹配的命令。
