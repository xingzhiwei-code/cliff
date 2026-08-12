# Shell 补全

cliff 自动为 bash、zsh 和 fish 生成 Shell 补全脚本。

## 安装

将补全脚本添加到你的 Shell 配置：

```bash
# bash
my-tool completion >> ~/.bashrc

# zsh
my-tool completion >> ~/.zshrc

# fish
my-tool completion > ~/.config/fish/completions/my-tool.fish
```

## 补全内容

补全从你的命令定义中自动生成：

- **命令名称** — 所有注册的命令和子命令
- **选项名称** — `--env`、`--force`、`--region`
- **选项值** — 对于枚举类型，建议允许的选项值

## 编程 API

可以通过编程方式生成补全脚本：

```ts
import { generateCompletion, printCompletion } from '@cliff/core';

// 生成字符串
const script = generateCompletion(cli);

// 直接输出到 stdout
printCompletion(cli);
```

为 CLI 添加 `completion` 命令：

```ts
export default defineCommand({
  name: 'completion',
  description: '生成 Shell 补全脚本',
  async run({ cli }) {
    printCompletion(cli);
  },
});
```

补全生成器从 `SHELL` 环境变量自动检测当前 Shell。
