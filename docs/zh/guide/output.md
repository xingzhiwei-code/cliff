# 输出组件

cliff 提供了一整套终端输出组件 — 无需 chalk，无需额外库。

## 基本输出

```ts
import { log, success, warn, error, info } from '@cliff/ui';

ui.log('正在处理文件...');     // │ 正在处理文件...
ui.success('构建完成！');      // ✔ 构建完成！
ui.warn('未找到配置文件');     // ⚠ 未找到配置文件
ui.error('连接失败');          // ✖ 连接失败
ui.info('使用默认设置');       // ℹ 使用默认设置
```

## 分区标题

```ts
import { section } from '@cliff/ui';

ui.section('部署');
// 部署
// ────
```

## 表格

显示带自动对齐的表格数据：

```ts
import { table } from '@cliff/ui';

const results = [
  { name: 'main.js', size: '42K', time: '1.2s' },
  { name: 'vendor.js', size: '128K', time: '3.5s' },
  { name: 'styles.css', size: '18K', time: '0.3s' },
];

ui.table(results, ['name', 'size', 'time']);
```

输出：

```
┌───────────┬──────┬──────┐
│ name      │ size │ time │
├───────────┼──────┼──────┤
│ main.js   │ 42K  │ 1.2s │
│ vendor.js │ 128K │ 3.5s │
│ styles.css│ 18K  │ 0.3s │
└───────────┴──────┴──────┘
```

## 自定义表头

```ts
ui.table(results, ['name', 'size', 'time'], {
  headers: ['文件', '大小', '耗时'],
});
```

## stdout 与 stderr

- **`ui.log`、`ui.success`、`ui.warn`、`ui.error`** — 输出到 stderr（状态消息）
- **`ui.stdout`** — 输出到 stdout（可被管道的数据输出）
- **`ui.table`** — 输出到 stdout（可管道）

```ts
// 状态消息 → stderr
ui.log('处理中...');

// 数据输出 → stdout（可被管道）
ui.stdout(JSON.stringify(result));
```

## 颜色工具

也提供底层颜色函数：

```ts
import { c, red, green, blue, yellow, cyan, gray, dim, bold, underline } from '@cliff/ui';

// 链式构建器
console.log(c('成功！').green().bold().toString());

// 直接函数
console.log(red('错误信息'));
console.log(green('OK'));
console.log(blue('提示'));
console.log(gray('元数据'));
console.log(dim('次要文本'));
console.log(bold('重要'));
console.log(underline('链接'));
```
