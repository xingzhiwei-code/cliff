 # CLI Framework PRD
 
 > 一句话：做 CLI 工具，开发者只管写 `run()` 函数，剩下的框架全包了。
 
 ---
 
 ## 1. 项目定位
 
 ### 1.1 愿景
 
 成为 CLI 工具开发领域的 Next.js——**让创建专业级 CLI 工具从 10 个库、300 行样板代码，变成一条命令 + 一个函数。**
 
 ### 1.2 类比
 
 | 领域 | 过去 | 后来 |
 |------|------|------|
 | 前端打包 | Webpack 手动配置 | **Vite** 零配置 |
 | React 全栈 | 散装路由/SSR/代码分割 | **Next.js** 一条命令 |
 | **CLI 开发** | commander + inquirer + chalk + ora + ... | **本框架** |
 
 ### 1.3 目标受众
 
 - **主要**：Node.js 全栈开发者，需要为团队/社区创建 CLI 工具
 - **次要**：想用 TypeScript 快速写脚本的开发者
 - **规模目标**：npm 周下载量达到 10 万+，GitHub stars 10k+
 
 ---
 
 ## 2. 问题分析
 
 ### 2.1 现状痛点
 
 今天做一个像样的 CLI 工具，开发者需要自行集成：
 
 | 能力 | 代表库 | 问题 |
 |------|--------|------|
 | 命令行参数解析 | commander / yargs | 各有各的 DSL，互不兼容 |
 | 交互式提示 | inquirer / prompts / clack | 另一个库，另一个 API |
 | 彩色输出 | chalk | 又一个库 |
 | 表格 | cli-table3 | 又一个库 |
 | 进度条/spinner | ora | 又一个库 |
 | Shell 补全 | tabtab | 配置复杂，手写 |
 | 子命令组织 | oclif | 重，或者手写 |
 | 配置文件 | cosmiconfig | 又一个库 |
 | 错误美化 | 手写 | 每次都手写 |
 | 插件系统 | 手写 | 架构决策成本高 |
 | 版本更新通知 | update-notifier | 又一个库 |
 | 测试 | 手写 mock | 没有标准方案 |
 | TypeScript | 手配 | 每个人都配一遍 |
 | man page | 手写 | 没人写 |
 
 **10+ 个库，样板代码比业务逻辑还多。**
 
 ### 2.2 市场信号
 
 - npm 每周发布 500+ 个 CLI 工具
 - AI 时代终端工具数量还在增长
 - 现有方案（oclif、commander、clack）各做各的，没有一家提供完整方案
 - "5 分钟做一个 CLI" 类内容天然适合社交传播
 
 ---
 
 ## 3. 竞品分析
 
 | 能力 | 本框架 | oclif | commander | clack | yargs |
 |------|--------|-------|-----------|-------|-------|
 | 参数解析 | ✅ | ✅ | ✅ | ❌ | ✅ |
 | 子命令组织 | ✅ 自动发现 | ✅ 约定式 | ❌ 手写 | ❌ | ❌ |
 | 交互式 UI | ✅ 内置 | ❌ 自己装 | ❌ 自己装 | ✅ | ❌ |
 | 插件系统 | ✅ | ✅ | ❌ | ❌ | ❌ |
 | Shell 补全 | ✅ 自动生成 | ✅ 手动 | ❌ | ❌ | ❌ |
 | 配置自动加载 | ✅ | ❌ | ❌ | ❌ | ❌ |
 | 零配置启动 | ✅ | ❌ | ✅ | ✅ | ✅ |
 | 测试工具 | ✅ | ❌ | ❌ | ❌ | ❌ |
 | 类型安全 | ✅ | ❌ | ❌ | ✅ | ❌ |
 | 脚手架 | ✅ | ❌ | ❌ | ❌ | ❌ |
 | man page 生成 | ✅ | ❌ | ❌ | ❌ | ❌ |
 | 更新通知 | ✅ | ❌ | ❌ | ❌ | ❌ |
 
 **核心差异：我们把所有事情都做了，而且是一体化设计，不是拼凑。**
 
 ---
 
 ## 4. 产品设计哲学
 
 ### 4.1 原则
 
 1. **Convention over Configuration**：有默认、能推断、不强制
 2. **Progressive Disclosure**：开箱即用功能完整，高级场景可自定义
 3. **Design > Tech**：没有技术难点，核心是 API 设计、集成优雅度、开发体验
 4. **TypeScript-first**：全部 TypeScript 编写，API 类型安全
 5. **Dogfooding**：框架自身的 CLI 用框架本身构建
 
 ### 4.2 非目标
 
 - 不做 GUI 工具
 - 不做守护进程管理
 - 不绑架特定部署平台
 - 不做包管理器（npm/pnpm 够用）
 
 ---
 
 ## 5. 功能规格
 
 ### 5.1 核心 API：`defineCommand`
 
 ```typescript
 // commands/deploy.ts
 import { defineCommand } from '@cliff/core';
 
 export default defineCommand({
   name: 'deploy',
   description: 'Deploy to production',
   options: {
     env: {
       type: 'string',
       default: 'staging',
       description: 'Target environment',
     },
     force: {
       type: 'boolean',
       default: false,
     },
   },
   async run({ options, ui, config }) {
     const confirmed = await ui.confirm(`Deploy to ${options.env}?`);
     if (!confirmed) return;
 
     const result = await ui.spinner('Building...', () => build());
     ui.table(result.files, ['name', 'size', 'time']);
     ui.success('Deployed!');
   },
 });
 ```
 
 **框架自动提供：**
 - `--help` 自动生成，带颜色和优雅排版
 - `--version` 自动
 - 参数类型校验 + 友好错误提示
 - Shell 自动补全（bash / zsh / fish）
 - 子命令自动发现（扫描 `commands/` 目录）
 - 配置文件自动加载（`.my-deploy.yml`）
 - 环境变量自动映射（`MY_DEPLOY_ENV` → `options.env`）
 
 ### 5.2 UI 组件
 
 #### 输出组件
 
 | 组件 | API | 说明 |
 |------|-----|------|
 | 彩色输出 | `ui.log()` / `ui.success()` / `ui.warn()` / `ui.error()` | 带颜色和图标 |
 | 表格 | `ui.table(data, columns)` | 自动对齐、支持 ANSI 颜色 |
 | 进度条 | `ui.progress(total, callback)` | 可配置样式 |
 | Spinner | `ui.spinner(text, asyncFn)` | 自动控制开始/停止 |
 | 分组标题 | `ui.section(title)` | 大段输出的结构化分隔 |
 
 #### 交互组件
 
 | 组件 | API | 说明 |
 |------|-----|------|
 | 确认 | `ui.confirm(message)` | yes/no |
 | 选择 | `ui.select(message, choices)` | 单选列表 |
 | 多选 | `ui.multiselect(message, choices)` | 多选列表 |
 | 输入 | `ui.input(message, { validate? })` | 自由输入+校验 |
 | 密码 | `ui.password(message)` | 隐藏输入 |
 | 步骤 | `ui.steps(steps)` | 多步向导 |
 
 ### 5.3 命令系统
 
 **约定式路由：**
 ```
 src/
   commands/
     deploy.ts        → my-tool deploy
     deploy/
       status.ts      → my-tool deploy status
     config.ts        → my-tool config
   index.ts           → 入口
 ```
 
 **特性：**
 - 自动扫描 `commands/` 目录，无需手动注册
 - 子命令支持嵌套，对应文件系统层级
 - 每个命令文件默认导出 `defineCommand({...})`
 - 支持 `index.ts` 作为目录默认命令
 
 ### 5.4 配置管理
 
 **自动加载优先级（从高到低）：**
 1. 命令行参数 `--env prod`
 2. 环境变量 `MY_DEPLOY_ENV=prod`
 3. 项目配置文件 `.my-deploy.yml`
 4. 用户配置 `~/.my-deploy.yml`
 5. 命令定义的 `default` 值
 
 **支持格式：** JSON、YAML、TOML、`.rc` 文件
 
 ### 5.5 插件系统
 
 ```typescript
 // 插件可以扩展命令、添加 hook、注入中间件
 export default definePlugin({
   name: '@my-deploy/plugin-docker',
   commands: {
     'docker:build': dockerBuildCommand,
   },
   hooks: {
     'before:run': async (ctx) => { /* ... */ },
   },
 });
 ```
 
 **特性：**
 - 插件可以是 npm 包或本地文件
 - 插件可以注册新命令（自动带命名空间前缀）
 - 生命周期 hooks：`before:run`、`after:run`、`on:error`
 - 通过 `my-tool plugins add` 安装
 
 ### 5.6 Shell 补全
 
 ```bash
 # 一行命令安装
 my-tool completion >> ~/.zshrc
 ```
 
 **支持 shell：** bash、zsh、fish
 **自动补全内容：** 命令名、子命令、选项名、选项值（枚举类型）
 
 ### 5.7 错误处理
 
 框架自动捕获并美化错误输出：
 
 ```
 ✖ Error: Connection refused to api.example.com:443
   at deploy (commands/deploy.ts:12:5)
   at Command.run (node_modules/@cliff/core/...)
 
   Tip: Check your network connection and try again.
 ```
 
 **特性：**
 - 堆栈折叠（只显示用户代码）
 - 可配置错误提示
 - 常见错误类型自动识别（网络、权限、文件不存在）
 
 ### 5.8 脚手架：`create-cli`
 
 ```bash
 npx create-cli my-tool
 ```
 
 **交互式创建流程：**
 1. 输入项目名（`my-tool`）
 2. 选择包管理器（npm / pnpm / yarn）
 3. 选择语言（TypeScript / JavaScript）
 4. 选择模板（基础 / 有子命令 / 全功能）
 5. 生成项目 + 安装依赖
 
 **生成的项目结构：**
 ```
 my-tool/
   src/
     commands/
       hello.ts
     index.ts
   package.json
   tsconfig.json
   .my-tool.yml
   README.md
 ```
 
 ### 5.9 测试工具
 
 ```typescript
 import { createTestApp } from '@cliff/test';
 
 const app = createTestApp({ commands: './commands' });
 
 const { stdout, stderr } = await app.run('deploy --env staging');
 expect(stdout).toContain('Deploy to staging?');
 
 // 模拟用户输入
 await app.run('deploy', { inputs: ['y', 'enter'] });
 ```
 
 ### 5.10 其他
 
 | 功能 | 说明 |
 |------|------|
 | man page 生成 | `my-tool man` 输出 man page 格式 |
 | 更新通知 | 非阻塞检查，有新版本时提示 |
 | 彩色 help | 自动排版，分节，示例 |
 | 静默模式 | `--silent` 全局选项 |
 | 调试模式 | `--debug` 全局选项，输出详细日志 |
 
 ---
 
 ## 6. 技术架构
 
 ### 6.1 包结构
 
 ```
 cli-framework/
   packages/
     core/                  # @cliff/core
       src/
         command.ts         # defineCommand, 命令注册
         parser.ts          # 参数解析（基于 yargs 封装）
         discovery.ts       # 命令自动发现
         config.ts          # 配置加载（基于 cosmiconfig）
         plugin.ts          # 插件系统
         completion.ts      # Shell 补全生成
         error.ts           # 错误处理 + 美化
         update.ts          # 更新通知
         index.ts
     ui/                    # @cliff/ui
       src/
         output.ts          # log / success / warn / error
         table.ts           # 表格渲染
         spinner.ts         # Spinner
         progress.ts        # 进度条
         prompts.ts         # confirm / select / input / password
         steps.ts           # 多步向导
         index.ts
     create-cli/            # create-cli
       src/
         index.ts
         templates/         # 项目模板
     test/                  # @cliff/test
       src/
         app.ts             # createTestApp
         index.ts
 ```
 
 ### 6.2 依赖策略
 
 **原则：零依赖目标，最少依赖原则。**
 
 | 能力 | 实现方式 |
 |------|----------|
 | 参数解析 | 封装 yargs 或自行实现（目标：未来移除 yargs 依赖） |
 | 配置文件 | 封装 cosmiconfig 或自实现 |
 | 输出颜色 | 手写 ANSI escape codes（避免 chalk 依赖） |
 | 交互提示 | 基于 Node.js readline 自实现 |
 | Spinner | 自实现 |
 | 表格 | 自实现 |
 | 补全 | 自实现 |
 
 **进度目标：** 框架自身 ≤ 3 个外部依赖。
 
 ### 6.3 技术选型
 
 | 决策 | 选择 | 原因 |
 |------|------|------|
 | 语言 | TypeScript 5.x | 类型安全 |
 | 构建 | tsup / unbuild | 快，支持多入口 |
 | 包管理 | pnpm | monorepo 支持好 |
 | 测试 | vitest | 快，兼容 jest |
 | 代码规范 | biome | 替代 eslint + prettier |
 | 版本管理 | changesets | 自动化 changelog |
 
 ---
 
 ## 7. API 设计规范
 
 ### 7.1 命名约定
 
 - 命令名：kebab-case（`my-deploy`）
 - 选项名：kebab-case（`--dry-run`）
 - 环境变量：UPPER_SNAKE_CASE（`MY_DEPLOY_DRY_RUN`）
 - 配置键：camelCase（`dryRun: true`）
 - 文件：kebab-case（`deploy-status.ts`）
 
 ### 7.2 退出码
 
 | 退出码 | 含义 |
 |--------|------|
 | 0 | 成功 |
 | 1 | 通用错误 |
 | 2 | 参数错误（自动设置） |
 | 3 | 用户取消 |
 | 4 | 配置错误 |
 
 ### 7.3 输出级别
 
 | 级别 | 何时使用 |
 |------|----------|
 | stdout | 命令结果、数据输出（可被管道） |
 | stderr | 日志、进度、提示、错误 |
 
 ---
 
 ## 8. 里程碑
 
 ### Phase 1：MVP（核心可用）
 
 | 功能 | 优先级 |
 |------|--------|
 | `defineCommand` + 参数解析 | P0 |
 | `--help` / `--version` 自动生成 | P0 |
 | 子命令自动发现 | P0 |
 | UI 输出组件（log, success, warn, error, table, spinner） | P0 |
 | UI 交互组件（confirm, select, input） | P0 |
 | `create-cli` 脚手架 | P0 |
 | TypeScript 类型安全 | P0 |
 
 ### Phase 2：生产就绪
 
 | 功能 | 优先级 |
 |------|--------|
 | 配置自动加载 | P1 |
 | 环境变量自动映射 | P1 |
 | Shell 补全 | P1 |
 | 错误美化 | P1 |
 | 测试工具 | P1 |
 | 文档网站 | P1 |
 
 ### Phase 3：生态建设
 
 | 功能 | 优先级 |
 |------|--------|
 | 插件系统 | P2 |
 | man page 生成 | P2 |
 | 更新通知 | P2 |
 | 插件市场 | P2 |
 | 社区模板 | P2 |
 
 ---
 
 ## 9. 成功指标
 
 | 指标 | 6 个月目标 | 12 个月目标 |
 |------|-----------|------------|
 | npm 周下载量 | 10,000 | 100,000 |
 | GitHub Stars | 5,000 | 15,000 |
 | 社区贡献者 | 20 | 50 |
 | 社区插件 | 10 | 30 |
 | 文档覆盖率 | 100% | 100% |
 
 ---
 
 ## 10. 风险与缓解
 
 | 风险 | 缓解 |
 |------|------|
 | oclif 已有生态先发优势 | 聚焦 DX 差异化：零配置 + 内置 UI |
 | 社区采纳速度慢 | 高质量文档 + 模板 + 教程 + 社交传播 |
 | 维护成本 | monorepo 自动化 + 社区贡献 |
 | 依赖膨胀 | 严格的零依赖/最少依赖原则 |
 | 框架自身太重 | 渐进式架构，按需引入 |
