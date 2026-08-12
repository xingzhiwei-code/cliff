# Spinner 与进度条

在长时间运行的操作中保持用户知情。

## Spinner

`ui.spinner` 函数包装一个异步操作并显示动画：

```ts
const result = await ui.spinner('安装依赖中...', async () => {
  await installDeps();
  return '完成';
});
// ⠋ 安装依赖中...
// ✔ 安装依赖中... 完成
```

Spinner 自动：
- 操作开始时启动
- 成功时显示勾号
- 失败时显示叉号（并重新抛出错误）

## 自定义 Spinner

如需更多控制，直接使用 `Spinner` 类：

```ts
import { Spinner } from '@cliff/ui';

const spin = new Spinner('加载中...');
spin.start();

try {
  await slowOperation();
  spin.succeed('加载完成！');
} catch (err) {
  spin.fail('加载失败');
  throw err;
}
```

## 进度条

`ui.progress` 函数包装批量操作：

```ts
const items = ['file1.ts', 'file2.ts', 'file3.ts'];

await ui.progress(items.length, async (tick) => {
  for (const item of items) {
    await processFile(item);
    tick(); // 推进进度条
  }
});
```

输出：

```
[████████████████████████████] 100% 3/3
```

## 自定义进度条

如需更多控制，直接使用 `Progress` 类：

```ts
import { Progress } from '@cliff/ui';

const bar = new Progress({ total: 100, width: 40 });

for (let i = 0; i <= 100; i++) {
  bar.update(i);
  await sleep(50);
}
bar.done();
```

## 进度条选项

```ts
const bar = new Progress({
  total: 100,        // 总数
  width: 40,         // 进度条宽度（字符数）
  format: '{bar} {percent}% {current}/{total}', // 自定义格式
});
```
