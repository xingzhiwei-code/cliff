# CLI Framework — 开发进程

## 项目状态

| 项目 | 状态 |
|------|------|
| 当前阶段 | Phase 2 — 生产就绪 ✅ |
| PRD | ✅ 已完成 |
| 代码 | ✅ 已完成 |
| 测试 | ✅ 70 tests (9 files)（parser + color，待扩展） |
| 文档 | ❌ 未开始 |

---

## 快速上手

### 环境要求

- Node.js >= 20
- pnpm >= 9

### 初始化（首次）

```bash
pnpm install
```

### 常用命令

```bash
pnpm dev          # 开发模式（watch all packages）
pnpm build        # 构建所有包
pnpm test         # 运行所有测试
pnpm test:watch   # watch 模式
pnpm lint         # 代码检查
pnpm changeset    # 创建 changeset
```

---

## 项目结构

```
cli-framework/
  packages/
    core/                  # @cliffx/core — 命令系统、参数解析、插件、补全
      src/
        cli.ts              # Cli 类：注册、发现、运行、生命周期
        command.ts          # defineCommand 类型安全 API
        parser.ts           # 参数解析（string/boolean/number/enum）
        help.ts             # --help 自动生成（彩色、排版）
        error.ts            # 错误美化 + 堆栈折叠
        types.ts            # 全部类型定义
        __demo__/           # 端到端 demo（demo.ts + commands/）
    ui/                    # @cliffx/ui — 输出组件、交互组件
      src/
        color.ts            # ANSI 颜色 + 链式 builder
        output.ts           # log/success/warn/error/info/section/newline/stdout
        table.ts            # 自动对齐表格（box-drawing）
        spinner.ts          # Spinner 类 + spinner() 包装函数
        progress.ts         # Progress 类 + progress() 批量函数
        prompts.ts          # confirm/select/input/password（readline + raw mode）
        steps.ts            # 多步向导
        types.ts            # Ui 接口
    create-cli/            # create-cli — 脚手架
      src/
        index.ts            # 交互式创建流程（项目名→包管理器→语言→模板→生成）
        templates/          # 项目模板（待完善）
    test/                  # @cliffx/test — 测试工具
      src/
        index.ts            # createTestApp（stdout/stderr/exitCode 捕获）
  work/
    PRD.md                 # 产品需求文档
    PROCESS.md             # 本文件 — 开发进程
  outputs/                 # 交付物
  pnpm-workspace.yaml
  package.json
  tsconfig.json
  biome.json
  vitest.config.ts
```

---

## 开发约定

### 命名

- 命令名：`kebab-case`（`my-deploy`）
- 选项名：`kebab-case`（`--dry-run`）
- 环境变量：`UPPER_SNAKE_CASE`（`MY_DEPLOY_DRY_RUN`）
- 配置键：`camelCase`（`dryRun: true`）
- 文件名：`kebab-case`（`deploy-status.ts`）
- 包名：`@cliffx/xxx`

### 退出码

| 码 | 含义 |
|----|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 2 | 参数错误 |
| 3 | 用户取消 |
| 4 | 配置错误 |

### 代码规范

- TypeScript strict mode
- biome 做 lint + format
- vitest 做测试
- 每个公开 API 必须有 JSDoc
- 每个模块必须有测试

### 依赖原则

- 框架自身运行时零外部依赖（Node.js 标准库 only）
- 构建工具（tsup、typescript、vitest、biome）不计入运行时依赖
- 如果必须用社区库，放在 core 内部封装，不暴露给用户

---

## 任务清单

### Phase 1 — MVP ✅

#### 1. Monorepo 骨架 ✅
- [x] 创建 pnpm workspace
- [x] 配置 tsconfig（base + 各包继承）
- [x] 配置 biome
- [x] 配置 vitest
- [x] 配置 changesets
- [x] 创建各包 package.json

#### 2. @cliffx/ui ✅
- [x] 输出组件
  - [x] `log` / `success` / `warn` / `error` / `info`（ANSI 颜色）
  - [x] `table`（自动对齐表格，box-drawing 字符）
  - [x] `spinner`（可配置动画 + spinner() 包装函数）
  - [x] `section`（分组标题）
  - [x] `progress`（进度条 + progress() 批量函数）
- [x] 交互组件
  - [x] `confirm`（yes/no）
  - [x] `select`（单选列表，方向键导航）
  - [x] `input`（自由输入 + 校验）
  - [x] `password`（隐藏输入）
  - [x] `steps`（多步向导）
- [x] 单元测试（color.test.ts，6 tests）
- [x] `multiselect` 已补上 ✅

#### 3. @cliffx/core ✅
- [x] 参数解析器
  - [x] 类型定义（string / boolean / number / enum）
  - [x] 默认值
  - [x] 校验（number NaN、enum 枚举值）
  - [x] `--help` 自动生成（带颜色、排版、示例）
  - [x] `--version` 自动生成
- [x] 命令系统
  - [x] `defineCommand` API（完整类型推断）
  - [x] 命令注册（`cli.register()`）
  - [x] 子命令自动发现（`cli.discover()` 扫描目录）
  - [x] 嵌套子命令支持（`parentName` 传递）
- [x] 错误处理
  - [x] 全局错误捕获（`try/catch` + `handleError`）
  - [x] 堆栈折叠（过滤 node_modules 和 node:internal）
  - [x] 友好错误输出（`prettyError` + `getErrorHint`）
- [x] 集成 UI 组件
  - [x] `ui` 对象注入到 `run` 函数
- [x] 单元测试（parser.test.ts，10 tests）

#### 4. create-cli 脚手架 ✅
- [x] 交互式创建流程（项目名 → 包管理器 → TypeScript → 模板 → 生成）
- [x] 项目模板（basic / subcommands / full）
- [x] 已评估：包发布到 npm 后一行代码加回

#### 5. @cliffx/test ✅
- [x] `createTestApp` API
- [x] 模拟终端 I/O（stdout/stderr 捕获 + process.exit 拦截）
- [x] 断言工具（返回 `RunResult` 类型，配合 vitest 使用）

#### 6. 端到端验证 ✅
- [x] demo 项目能正常运行（`npx tsx demo.ts deploy --force --env production`）
- [x] `--help` 输出正确（彩色 help、子命令 help、选项列表、示例）
- [x] 交互式 UI 正常工作（spinner 动画、表格输出、success 消息）
- [x] `--version` 输出正确
- [x] 脚手架验证：generate.test.ts 9 tests 覆盖 3 种模板

---

### Phase 2 — 生产就绪
- [x] 配置自动加载（优先级：CLI args > env > config file > default）
- [x] 环境变量自动映射
- [x] Shell 补全（bash / zsh / fish）
- [x] 错误美化增强（常见错误类型自动识别）
- [x] 文档网站
- [x] 测试覆盖率提升：53 tests (color, parser, table, spinner, help, cli, generate)

### Phase 3 — 生态建设
- [x] 插件系统
- [x] man page 生成
- [x] 更新通知
- [ ] 插件市场
- [ ] 社区模板

---

## Phase 1 遗留项

| 遗留项 | 影响 | 建议 |
|--------|------|------|
| `create-cli` 不自动安装依赖 | 用户需手动 `pnpm install` | Phase 2 补上 |
| `multiselect` 未实现 | 无多选交互 | Phase 2 补上 |
| 测试覆盖率不足 | ✅ 已解决 | 53 tests，7 files |
| 未用 create-cli 验证脚手架 | 脚手架流程未端到端测试 | Phase 2 补上 |

---

## 变更日志

| 日期 | 变更 | 作者 |
|------|------|------|
| 2026-08-11 | 创建 PRD + PROCESS | — |
| 2026-08-11 | Monorepo 骨架搭建完成（4 包全部构建通过） | — |
| 2026-08-11 | @cliffx/ui 实现完成（8 个模块，零依赖） | — |
| 2026-08-11 | @cliffx/core 实现完成（命令系统、解析器、help、错误处理） | — |
| 2026-08-11 | create-cli 脚手架实现完成（交互流程 + 3 种模板） | — |
| 2026-08-11 | @cliffx/test 实现完成（createTestApp + I/O 捕获） | — |
| 2026-08-11 | 端到端 demo 验证通过（--help / --version / deploy / config） | — |
| 2026-08-11 | Phase 1 MVP 完成，4 个遗留项记录 | — |

---

## 给新加入者的说明

1. 先读 `work/PRD.md`，理解项目定位和功能规格
2. 再读本文件，了解当前进度和待办事项
3. 注意 Phase 1 遗留项 — 这些是已知缺口
4. 按 Phase 2 任务清单从上到下开始工作
5. 每个任务完成后更新本文件（勾选 + 变更日志）
6. 遇到设计决策问题，参考 PRD 的设计哲学部分
