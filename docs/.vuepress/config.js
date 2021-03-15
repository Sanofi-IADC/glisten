module.exports = {
  // title: 'Glisten',
  description: 'Glisten documentation page',
  lang: 'en-US',
  base: '/glisten/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/glisten.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: 'auto',
  },
  plugins: ['@vuepress/back-to-top'],
  markdown: {
    extendMarkdown: (md) => {
      md.set({ breaks: true });
      // markdown-it plugins
      md.use(require('markdown-it-task-lists'));
    },
  },
};
