# 交互组件

通过键盘可导航的提示构建交互式命令行体验。

## 确认

简单的 yes/no 确认：

```ts
const confirmed = await ui.confirm('部署到生产环境？');
// ? 部署到生产环境？ (Y/n)

if (!confirmed) {
  ui.log('部署已取消。');
  return;
}
```

## 单选

带方向键导航的单选列表：

```ts
const region = await ui.select('选择区域', [
  { label: '华东', value: 'us-east', hint: '弗吉尼亚' },
  { label: '美西', value: 'us-west', hint: '俄勒冈' },
  { label: '欧洲', value: 'eu-west', hint: '爱尔兰' },
]);
// ? 选择区域
//   ❯ 华东  弗吉尼亚
//     美西  俄勒冈
//     欧洲  爱尔兰
```

## 多选

按空格键切换的多选列表：

```ts
const features = await ui.multiselect('选择功能', [
  { label: 'TypeScript', value: 'ts' },
  { label: 'ESLint', value: 'eslint' },
  { label: 'Prettier', value: 'prettier' },
  { label: 'Vitest', value: 'vitest' },
]);
// ? 选择功能 (已选 2 项)
//   ❯ ◉ TypeScript
//     ○ ESLint
//     ◉ Vitest
//     ○ Prettier
```

## 输入

带校验的自由文本输入：

```ts
const projectName = await ui.input('项目名称', {
  default: 'my-app',
  validate: (value) => {
    if (value.length < 2) return '名称至少 2 个字符';
    if (!/^[a-z0-9-]+$/.test(value)) return '只能使用小写字母、数字和连字符';
    return true;
  },
});
```

## 密码

隐藏输入的敏感数据：

```ts
const token = await ui.password('输入 API 令牌');
// ? 输入 API 令牌：****
```

## 步骤

多步向导：

```ts
import { steps } from '@cliffx/ui';

const results = await ui.steps([
  {
    title: '安装依赖',
    async run() { await installDeps(); },
  },
  {
    title: '构建项目',
    async run() { await build(); },
  },
  {
    title: '运行测试',
    async run() { await test(); },
  },
]);

// 每步运行时显示动画，完成后显示勾号
```

## 导航按键

| 按键 | 功能 |
|------|------|
| `↑` / `k` | 上移 |
| `↓` / `j` | 下移 |
| `Enter` | 确认选择 |
| `空格` | 切换（多选） |
| `Ctrl+C` | 取消（退出码 3） |
