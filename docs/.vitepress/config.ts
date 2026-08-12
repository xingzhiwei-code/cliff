import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/cliff/',

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'cliff',
      description: 'The Next.js for CLI tools',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/core' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/getting-started' },
                { text: 'Quick Start', link: '/guide/quick-start' },
                { text: 'Project Structure', link: '/guide/project-structure' },
              ],
            },
            {
              text: 'Core Concepts',
              items: [
                { text: 'Commands', link: '/guide/commands' },
                { text: 'Options & Arguments', link: '/guide/options' },
                { text: 'Configuration', link: '/guide/configuration' },
                { text: 'Shell Completion', link: '/guide/completion' },
                { text: 'Error Handling', link: '/guide/error-handling' },
              ],
            },
            {
              text: 'UI Components',
              items: [
                { text: 'Output', link: '/guide/output' },
                { text: 'Prompts', link: '/guide/prompts' },
                { text: 'Spinners & Progress', link: '/guide/spinners-progress' },
              ],
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Plugins', link: '/guide/plugins' },
                { text: 'Testing', link: '/guide/testing' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'Packages',
              items: [
                { text: '@cliff/core', link: '/api/core' },
                { text: '@cliff/ui', link: '/api/ui' },
                { text: '@cliff/test', link: '/api/test' },
                { text: 'create-cli', link: '/api/create-cli' },
              ],
            },
          ],
        },
      },
    },

    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'cliff',
      description: 'CLI 工具开发的 Next.js',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'API', link: '/zh/api/core' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '项目介绍', link: '/zh/guide/getting-started' },
                { text: '快速上手', link: '/zh/guide/quick-start' },
                { text: '项目结构', link: '/zh/guide/project-structure' },
              ],
            },
            {
              text: '核心概念',
              items: [
                { text: '命令', link: '/zh/guide/commands' },
                { text: '选项与参数', link: '/zh/guide/options' },
                { text: '配置管理', link: '/zh/guide/configuration' },
                { text: 'Shell 补全', link: '/zh/guide/completion' },
                { text: '错误处理', link: '/zh/guide/error-handling' },
              ],
            },
            {
              text: 'UI 组件',
              items: [
                { text: '输出组件', link: '/zh/guide/output' },
                { text: '交互组件', link: '/zh/guide/prompts' },
                { text: 'Spinner 与进度条', link: '/zh/guide/spinners-progress' },
              ],
            },
            {
              text: '进阶',
              items: [
                { text: '插件系统', link: '/zh/guide/plugins' },
                { text: '测试', link: '/zh/guide/testing' },
              ],
            },
          ],
          '/zh/api/': [
            {
              text: '包',
              items: [
                { text: '@cliff/core', link: '/zh/api/core' },
                { text: '@cliff/ui', link: '/zh/api/ui' },
                { text: '@cliff/test', link: '/zh/api/test' },
                { text: 'create-cli', link: '/zh/api/create-cli' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xingzhiwei-code/cliff' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'MIT Licensed',
    },
  },
});
