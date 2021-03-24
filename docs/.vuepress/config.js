module.exports = {
  title: 'Glisten',
  description: 'Glisten documentation page',
  lang: 'en-US',
  base: '/glisten/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/BrandLogo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/Sanofi-IADC/glisten' },
    ],
    sidebar: 'auto',
    lastUpdated: 'Last Updated',
  },
  plugins: ['@vuepress/back-to-top'],
  markdown: {
    extendMarkdown: (md) => {
      md.set({ breaks: true });
      md.use(require('markdown-it-task-lists'));
    },
  },
};
