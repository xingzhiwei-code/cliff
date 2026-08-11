import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/cliff/',
  title: 'cliff',
  description: 'The Next.js for CLI tools — build production-grade CLIs with zero boilerplate',
  lang: 'en-US',

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
