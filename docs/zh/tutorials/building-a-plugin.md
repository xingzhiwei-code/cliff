# 开发一个插件

本教程从零开始构建 `@cliffx/plugin-docker` — 一个为 CLI 添加 5 个 Docker 命令的插件。你将学习 `definePlugin`、生命周期钩子和命令注册。

## 你将构建什么

```bash
my-tool docker:build --tag my-app:latest
my-tool docker:push --tag my-app:latest
my-tool docker:run --image my-app:latest --port 3000:3000
my-tool docker:cleanup --all
my-tool docker:deploy --tag my-app:latest --port 3000:3000
```

## 第一步：创建插件包

在 `packages/` 下创建新目录：

```
packages/plugin-docker/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

`package.json`：

```json
{
  "name": "@cliffx/plugin-docker",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean"
  },
  "dependencies": {
    "@cliffx/core": "workspace:*",
    "@cliffx/ui": "workspace:*"
  }
}
```

## 第二步：编写插件

创建 `src/index.ts`：

```ts
import type { Plugin } from '@cliffx/core';
import { execSync } from 'node:child_process';

function docker(args: string): string {
  return execSync(`docker ${args}`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function checkDockerDaemon(): boolean {
  try { docker('info'); return true; } catch { return false; }
}

export const pluginDocker: Plugin = {
  name: '@cliffx/plugin-docker',

  hooks: {
    'before:run': async () => {
      if (!checkDockerDaemon()) {
        throw new Error('Docker 守护进程未运行。');
      }
    },
  },

  commands: {
    'docker:build': {
      name: 'docker:build',
      description: '构建 Docker 镜像',
      options: {
        tag: { type: 'string', description: '镜像标签' },
        file: { type: 'string', default: 'Dockerfile', description: 'Dockerfile 路径' },
      },
      async run({ options, ui }) {
        const result = await ui.spinner(
          `构建中 ${options.tag}...`,
          () => docker(`build -t ${options.tag} -f ${options.file} .`),
        );
        ui.success(`构建完成：${options.tag}`);
        ui.stdout(result);
      },
    },
  },
};

export default pluginDocker;
```

## 第三步：加载插件

在 CLI 入口文件中：

```ts
import { createCli } from '@cliffx/core';
import pluginDocker from '@cliffx/plugin-docker';

const cli = createCli({
  name: 'my-tool',
  plugins: [pluginDocker],
});

await cli.discover(__dirname);
await cli.run();
```

## 核心概念

**`definePlugin`** 提供类型安全的插件定义。你也可以直接使用 `Plugin` 接口 — `definePlugin` 只是一个便利包装。

**命令命名** — 插件命令使用插件名称作为命名空间前缀。`@cliffx/plugin-docker` → `docker:build`、`docker:push` 等。

**生命周期钩子** 在 CLI 生命周期的特定节点触发：
- `before:run` — 命令执行前触发（适合做校验）
- `after:run` — 成功完成后触发（适合做清理）
- `on:error` — 命令抛出错误时触发（适合做错误上报）

**自动发现** — 将插件放在 `plugins/` 目录中，调用 `cli.discoverAllPlugins()` 即可自动加载。

## 下一步

现在你已经构建了一个插件，试试[开发一个完整的 CLI 应用](/zh/tutorials/building-a-cli-app)来使用它。
