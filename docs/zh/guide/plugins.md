# 插件系统

通过一流的插件系统扩展 CLI。插件可以添加命令、生命周期钩子和中间件。

## 定义插件

使用 `definePlugin` 获得类型安全的插件定义：

```ts
import { definePlugin } from '@cliffx/core';

export default definePlugin({
  name: '@my-tool/plugin-docker',
  commands: {
    'docker:build': {
      name: 'docker:build',
      description: '构建 Docker 镜像',
      async run({ options, ui }) {
        await ui.spinner('构建镜像中...', () => buildImage());
        ui.success('镜像构建成功');
      },
    },
  },
  hooks: {
    'before:run': async (ctx) => {
      console.log(`执行中：${ctx.name}`);
    },
    'after:run': async (ctx) => {
      console.log(`完成：${ctx.name}`);
    },
    'on:error': async (err) => {
      console.error('命令失败：', err.message);
    },
  },
});
```

## 自动发现

将插件放在 `plugins/` 目录中，它们会被自动加载：

```
src/
├── plugins/
│   ├── docker.ts
│   └── slack.ts
├── commands/
│   └── deploy.ts
└── index.ts
```

```ts
// src/index.ts
const cli = createCli({ name: 'my-tool' });
await cli.discoverAllPlugins(__dirname);
await cli.discover(__dirname);
await cli.run();
```

## 加载插件

```ts
import { createCli } from '@cliffx/core';
import dockerPlugin from '@my-tool/plugin-docker';

const cli = createCli({
  name: 'my-tool',
  plugins: [dockerPlugin],
});

// 或动态加载
cli.use(dockerPlugin);
```

## 插件命令

插件命令自动以插件名称前缀命名空间：

```bash
my-tool docker:build --tag latest
```

## 生命周期钩子

| 钩子 | 触发时机 | 上下文 |
|------|----------|--------|
| `before:run` | 命令执行前 | `{ name, args }` |
| `after:run` | 命令成功完成后 | `{ name, args }` |
| `on:error` | 命令抛出错误时 | `Error` |

## TypeScript

插件具有完整的类型支持：

```ts
import type { Plugin } from '@cliffx/core';

const plugin: Plugin = {
  name: 'my-plugin',
  commands: {
    // ...
  },
  hooks: {
    'before:run': async (ctx) => {
      // ctx.name 类型为 string
      // ctx.args 类型为 string[]
    },
  },
};
```
