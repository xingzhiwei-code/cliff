# Man 手册

cliff 可以为你的 CLI 工具生成 Unix man 手册页，格式为 troff。

## 生成 Man 手册

```ts
import { generateManPage, printManPage } from '@cliff/core';

// 生成字符串
const manPage = generateManPage('my-tool', '1.0.0', '我的 CLI 工具', cli.getCommands());

// 直接输出到 stdout
printManPage('my-tool', '1.0.0', '我的 CLI 工具', cli.getCommands());
```

## 添加 `man` 命令

为 CLI 添加内置命令用于生成 man 手册：

```ts
export default defineCommand({
  name: 'man',
  description: '生成 man 手册',
  async run({ cli }) {
    printManPage(
      cli.options.name,
      cli.options.version,
      cli.options.description,
      cli.getCommands(),
    );
  },
});
```

然后管道输出到 man 目录：

```bash
my-tool man > /usr/local/share/man/man1/my-tool.1
man my-tool
```

## Man 手册结构

生成的 man 手册包含：

- **NAME** — CLI 名称和描述
- **SYNOPSIS** — 使用模式
- **DESCRIPTION** — 来自 `createCli` 的描述
- **COMMANDS** — 所有注册的命令及其选项
- **GLOBAL OPTIONS** — `--help`、`--version`、`--debug`
- **SEE ALSO** — 相关工具引用

## 格式

输出为标准 troff 格式，兼容 macOS、Linux 及其他 Unix 系统的 `man` 命令。
