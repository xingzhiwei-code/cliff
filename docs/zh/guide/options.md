# 选项与参数

选项在每个命令中定义，具有完整的类型安全。框架自动处理解析、校验和帮助文本生成。

## 定义选项

```ts
export default defineCommand({
  name: 'deploy',
  options: {
    env: {
      type: 'string',
      default: 'staging',
      description: '目标环境',
      alias: 'e',
    },
    force: {
      type: 'boolean',
      default: false,
      description: '跳过确认提示',
      alias: 'f',
    },
    retries: {
      type: 'number',
      default: 3,
      description: '重试次数',
    },
    region: {
      type: 'enum',
      choices: ['us-east', 'us-west', 'eu-west'],
      default: 'us-east',
      description: '部署区域',
    },
  },
  async run({ options }) {
    // options.env     → string
    // options.force   → boolean
    // options.retries → number
    // options.region  → 'us-east' | 'us-west' | 'eu-west'
  },
});
```

## 选项类型

| 类型 | CLI 用法 | 默认值 |
|------|----------|--------|
| `string` | `--env production` 或 `--env=production` | `default` 值 |
| `boolean` | `--force` 或 `--no-force` | `false` |
| `number` | `--retries 5` 或 `--retries=5` | `default` 值 |
| `enum` | `--region us-east` | 首个选项或 `default` |

## 短别名

使用 `alias` 定义单字符标志：

```ts
options: {
  env: { type: 'string', alias: 'e' },
  force: { type: 'boolean', alias: 'f' },
}
```

```bash
my-tool deploy -e production -f
```

## 类型安全

选项通过 TypeScript 类型推断获得完整的类型支持。`run()` 中的 `options` 参数根据定义自动获得正确的类型。

```ts
// options.env 被推断为 string 而非 string | undefined
// 因为它有默认值
console.log(options.env.toUpperCase()); // ✅
```

## 校验

框架自动校验选项值：

- **number**：值为非数字时抛出错误
- **enum**：值不在允许列表中时抛出错误
- **缺失值**：抛出友好的提示信息

所有校验错误都会以格式化错误信息显示。
