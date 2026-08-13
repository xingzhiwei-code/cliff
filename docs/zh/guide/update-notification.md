# 更新通知

cliff 自动检查 CLI 包的新版本，当有新版本可用时显示非阻塞通知。

## 工作原理

调用 `cli.run()` 时，框架在后台发起 HTTP 请求到 npm registry 检查最新版本，不会阻塞命令执行。

检测到新版本时，向 stderr 打印提示：

```
  Update available!
   0.0.1 → 0.1.0
   Run pnpm add my-tool@latest to upgrade.
```

## 频率限制

检查频率限制为每 24 小时一次，避免不必要的网络请求。

## 要求

CLI 的 `package.json` 必须发布到 npm registry。更新检查使用 `createCli` 中的 CLI 名称和版本：

```ts
const cli = createCli({
  name: 'my-tool',     // 必须与 npm 包名一致
  version: '1.0.0',    // 当前版本
});
```

## 编程 API

也可以直接使用检查函数：

```ts
import { checkForUpdates } from '@cliffx/core';

const result = await checkForUpdates('my-tool', '1.0.0');
if (result?.outdated) {
  console.log(`新版本可用：${result.latest}`);
}
```

## 静默模式

抑制自动通知：

```ts
await checkForUpdates('my-tool', '1.0.0', { silent: true });
```

## 禁用

要完全禁用更新检查，在 `createCli` 选项中省略 `version` 字段即可。
