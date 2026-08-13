# @cliffx/ui

UI 包提供终端输出组件、交互式提示、动画、进度条和 ANSI 颜色工具 — 全部零外部依赖。

## 安装

```bash
pnpm add @cliffx/ui
```

## 输出函数

### `log` / `success` / `warn` / `error` / `info`

向 stderr 写入带样式的消息。

```ts
import { log, success, warn, error, info } from '@cliffx/ui';

log('处理中...');       // │ 处理中...
success('完成！');      // ✔ 完成！
warn('未找到配置');     // ⚠ 未找到配置
error('失败！');        // ✖ 失败！
info('使用默认值');     // ℹ 使用默认值
```

### `section`

写入分区标题。

```ts
import { section } from '@cliffx/ui';

section('构建');
// 构建
// ────
```

### `stdout`

向 stdout 写入数据（用于可管道输出）。

```ts
import { stdout } from '@cliffx/ui';

stdout(JSON.stringify({ status: 'ok' }));
```

### `newline`

向 stderr 写入空行。

```ts
import { newline } from '@cliffx/ui';

newline();
```

## 表格

### `table`

渲染带边框的表格数据。

```ts
import { table } from '@cliffx/ui';

table(data, ['name', 'size', 'time'], {
  headers: ['文件', '大小', '耗时'],
});
```

**类型：**

```ts
function table<T extends Record<string, unknown>>(
  data: T[],
  columns: (keyof T)[],
  options?: TableOptions,
): void;

interface TableOptions {
  headers?: string[];
}
```

## 提示

### `confirm`

yes/no 确认。

```ts
import { confirm } from '@cliffx/ui';

const ok = await confirm('继续？'); // 默认为 true
// ? 继续？ (Y/n)
```

### `select`

带方向键的单选列表。

```ts
import { select } from '@cliffx/ui';

const choice = await select('选择一项', [
  { label: '选项 A', value: 'a', hint: '推荐' },
  { label: '选项 B', value: 'b' },
]);
```

### `multiselect`

按空格键切换的多选列表。

```ts
import { multiselect } from '@cliffx/ui';

const selected = await multiselect('选择多项', [
  { label: 'TypeScript', value: 'ts' },
  { label: 'ESLint', value: 'eslint' },
]);
```

### `input`

带校验的文本输入。

```ts
import { input } from '@cliffx/ui';

const name = await input('项目名称', {
  default: 'my-app',
  validate: (v) => v.length >= 2 || '太短了',
});
```

### `password`

隐藏输入。

```ts
import { password } from '@cliffx/ui';

const token = await password('API 令牌');
```

## Spinner

### `spinner`

包装异步操作并显示动画。

```ts
import { spinner } from '@cliffx/ui';

const result = await spinner('加载中...', async () => {
  return await fetchData();
});
```

### `Spinner`

手动控制动画的类。

```ts
import { Spinner } from '@cliffx/ui';

const spin = new Spinner('工作中...');
spin.start();
spin.succeed('完成！');
spin.fail('失败！');
```

## 进度条

### `progress`

批量进度条。

```ts
import { progress } from '@cliffx/ui';

await progress(100, async (tick) => {
  for (const item of items) {
    await process(item);
    tick();
  }
});
```

### `Progress`

手动控制进度条的类。

```ts
import { Progress } from '@cliffx/ui';

const bar = new Progress({ total: 100, width: 40 });
bar.update(50);
bar.done();
```

## 步骤向导

### `steps`

多步向导。

```ts
import { steps } from '@cliffx/ui';

const results = await steps([
  { title: '安装', run: () => installDeps() },
  { title: '构建', run: () => build() },
  { title: '测试', run: () => test() },
]);
```

## 颜色工具

### 直接颜色函数

```ts
import { red, green, yellow, blue, cyan, gray, dim, bold, underline } from '@cliffx/ui';

console.log(red('错误'));
console.log(green('OK'));
console.log(bold('重要'));
```

### 链式构建器

```ts
import { c } from '@cliffx/ui';

console.log(c('警告').yellow().bold().toString());
console.log(c('标题').brightBlue().bold().toString());
```

### 工具函数

```ts
import { supportsColor, stripColor, visibleLength } from '@cliffx/ui';

supportsColor(); // 终端是否支持颜色
stripColor('\x1b[31m红色\x1b[0m'); // '红色'
visibleLength('hello'); // 5（忽略 ANSI 代码）
```

## 类型

```ts
import type { Ui, Choice, TableOptions, ProgressOptions, Step } from '@cliffx/ui';
```

`Ui` 接口是注入到 `run()` 函数中 `ui` 对象的类型。
