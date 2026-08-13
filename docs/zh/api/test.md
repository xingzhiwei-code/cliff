# @cliffx/test

测试包提供 CLI 命令集成测试的工具。

## 安装

```bash
pnpm add -D @cliffx/test
```

## `createTestApp`

创建测试友好的 CLI 实例，捕获所有输出。

```ts
import { createTestApp } from '@cliffx/test';
import { defineCommand } from '@cliffx/core';

const app = createTestApp({
  commands: [
    defineCommand({
      name: 'greet',
      options: {
        name: { type: 'string', default: 'World' },
      },
      async run({ options, ui }) {
        ui.success(`你好，${options.name}！`);
      },
    }),
  ],
  cliOptions: {
    name: 'test-cli',
    version: '1.0.0',
  },
});
```

**参数：**

```ts
interface TestAppOptions {
  commands?: CommandDef[];
  cliOptions?: Partial<CliOptions>;
}
```

**返回值：**

```ts
{
  cli: Cli;
  run: (args: string[]) => Promise<RunResult>;
}
```

## `RunResult`

```ts
interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
```

## 与 Vitest 配合使用

```ts
import { describe, it, expect } from 'vitest';
import { createTestApp } from '@cliffx/test';
import { defineCommand } from '@cliffx/core';

describe('greet', () => {
  const app = createTestApp({
    commands: [
      defineCommand({
        name: 'greet',
        options: { name: { type: 'string', default: 'World' } },
        async run({ options, ui }) {
          ui.success(`你好，${options.name}！`);
        },
      }),
    ],
  });

  it('使用默认名称问候', async () => {
    const { stderr, exitCode } = await app.run(['greet']);
    expect(stderr).toContain('你好，World！');
    expect(exitCode).toBe(0);
  });

  it('使用自定义名称问候', async () => {
    const { stderr } = await app.run(['greet', '--name', 'Alice']);
    expect(stderr).toContain('你好，Alice！');
  });

  it('处理未知命令', async () => {
    const { exitCode } = await app.run(['unknown']);
    expect(exitCode).toBe(1);
  });
});
```

## 工作原理

测试工具拦截三个 Node.js 全局变量：

| 拦截对象 | 捕获为 |
|----------|--------|
| `process.stdout.write` | `result.stdout` |
| `process.stderr.write` | `result.stderr` |
| `process.exit` | `result.exitCode` |

`run()` 完成后，所有全局变量恢复为原始值。测试工具可在并行测试中安全使用。
