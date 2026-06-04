import { defineUserConfig } from 'vuepress';
import { defaultTheme } from '@vuepress/theme-default';
import { viteBundler } from '@vuepress/bundler-vite';
import taskLists from 'markdown-it-task-lists';

export default defineUserConfig({
  title: 'Glisten',
  description: 'Glisten documentation page',
  lang: 'en-US',
  base: '/glisten/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: '/BrandLogo.svg',
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/Sanofi-IADC/glisten' },
    ],
    sidebar: 'auto',
    lastUpdated: true,
    // back-to-top is provided by the default theme (replaces the standalone
    // @vuepress/plugin-back-to-top used with VuePress 1).
    backToTop: true,
  }),
  markdown: {
    breaks: true,
  },
  extendsMarkdown: (md) => {
    md.use(taskLists);
  },
});
