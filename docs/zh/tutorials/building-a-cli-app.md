# 开发一个 CLI 应用

本教程从零开始构建一个 API 调试工具。你将学习如何搭建项目、创建命令和子命令、使用表格和动画、以及管理本地数据。

## 你将构建什么

```bash
api request --method GET --url https://api.github.com
api request --method POST --url https://api.example.com --body '{"key":"value"}' --save my-request
api collection list
api collection run --name my-request
api collection delete --name my-request
```

## 第一步：创建项目

使用 cliff 脚手架创建：

```bash
npx create-cli api-cli
cd api-cli
pnpm install
```

项目结构：

```
api-cli/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## 第二步：入口文件

编辑 `src/index.ts`：

```ts
import { createCli } from '@cliffx/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cli = createCli({
  name: 'api',
  version: '0.0.1',
  description: 'API 调试工具 — TypeScript 时代的 curl',
});

await cli.discover(__dirname);
await cli.run();
```

## 第三步：创建请求命令

创建 `src/commands/request.ts`：

```ts
import { defineCommand } from '@cliffx/core';

export default defineCommand({
  name: 'request',
  description: '发送 HTTP 请求',
  options: {
    method: {
      type: 'enum',
      choices: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
      alias: 'X',
    },
    url: { type: 'string', description: '请求 URL' },
    headers: { type: 'string', description: '请求头（key:value,key:value）', alias: 'H' },
    body: { type: 'string', description: 'JSON 请求体', alias: 'd' },
    save: { type: 'string', description: '保存到集合' },
  },
  async run({ options, ui }) {
    // 发送请求，带 spinner
    const result = await ui.spinner(`${options.method} ${options.url}`, async () => {
      const start = Date.now();
      const res = await fetch(options.url as string, {
        method: options.method as string,
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? String(options.body) : undefined,
      });
      const duration = Date.now() - start;
      const text = await res.text();
      return { status: res.status, statusText: res.statusText, body: text, duration };
    });

    // 格式化并展示响应
    ui.log(`${result.status} ${result.statusText} — ${result.duration}ms`);

    ui.newline();
    ui.section('响应体');
    ui.stdout(JSON.stringify(JSON.parse(result.body), null, 2));
  },
});
```

## 第四步：创建集合子命令

嵌套目录自动创建子命令：

```
src/commands/
├── request.ts
└── collection/
    ├── list.ts
    ├── run.ts
    └── delete.ts
```

创建 `src/commands/collection/list.ts`：

```ts
import { defineCommand } from '@cliffx/core';
import { readFileSync, existsSync } from 'node:fs';

export default defineCommand({
  name: 'list',
  description: '列出已保存的请求',
  async run({ ui }) {
    const collections = loadCollections();
    const rows = Object.values(collections).map((e) => ({
      name: e.name, method: e.method, url: e.url,
    }));
    ui.table(rows, ['name', 'method', 'url']);
  },
});
```

## 第五步：运行

```bash
pnpm dev
node dist/index.js request --url https://api.github.com
```

完整示例：

```bash
api request --method POST \
  --url https://jsonplaceholder.typicode.com/posts \
  --body '{"title":"hello","body":"world","userId":1}'
```

## 核心概念

**文件系统路由** — `commands/collection/list.ts` 自动变为 `api collection list`，无需手动注册。

**UI 组件** — `ui.spinner` 处理异步操作，`ui.table` 展示表格数据，`ui.section` 结构化输出，`ui.stdout` 输出可管道数据。

**数据持久化** — 使用 `node:fs` 读写 JSON 文件。存储在 `~/.api-cli/` 中作为用户级数据。

**类型安全** — `defineCommand` 推断选项类型。`options.url` 因为没有默认值而被推断为 `string`，`options.method` 被推断为枚举选项的联合类型。

## 下一步

现在你已经构建了一个 CLI 应用，试试[开发一个插件](/zh/tutorials/building-a-plugin)来扩展它的功能。
