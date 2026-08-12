# 测试

cliff 内置测试工具。像写单元测试一样为 CLI 编写集成测试。

## 设置

```ts
import { createTestApp } from '@cliff/test';
import { defineCommand } from '@cliff/core';

const app = createTestApp({
  commands: [
    defineCommand({
      name: 'deploy',
      options: {
        env: { type: 'string', default: 'staging' },
      },
      async run({ options, ui }) {
        ui.success(`已部署到 ${options.env}`);
      },
    }),
  ],
});
```

## 运行命令

`run()` 方法捕获所有输出并返回结果：

```ts
const result = await app.run(['deploy', '--env', 'production']);

console.log(result.stdout);   // 数据输出（表格等）
console.log(result.stderr);   // 状态消息、错误
console.log(result.exitCode); // 0 表示成功，1 表示错误
```

## 断言

与 vitest（或任何测试框架）配合使用：

```ts
import { describe, it, expect } from 'vitest';

describe('deploy 命令', () => {
  it('默认部署到 staging', async () => {
    const { stderr, exitCode } = await app.run(['deploy']);
    expect(stderr).toContain('已部署到 staging');
    expect(exitCode).toBe(0);
  });

  it('支持 --env 标志', async () => {
    const { stderr } = await app.run(['deploy', '--env', 'production']);
    expect(stderr).toContain('已部署到 production');
  });

  it('优雅处理错误', async () => {
    const { stderr, exitCode } = await app.run(['deploy', '--retries', 'abc']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error');
  });
});
```

## 工作原理

`createTestApp` 拦截以下内容：
- `process.stdout.write` — 捕获为 `result.stdout`
- `process.stderr.write` — 捕获为 `result.stderr`
- `process.exit` — 捕获为 `result.exitCode`（内部抛出 `TestExitError`）

测试后，所有流恢复为原始状态。
