module.exports = {
  title: 'Glisten',
  description: 'Glisten documentation page',
  lang: 'en-US',
  base: '/glisten/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: 'auto',
  },
};
