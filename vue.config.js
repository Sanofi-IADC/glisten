const nodeExternals = require('webpack-node-externals');

module.exports = {
  css: {
    extract: false,
  },
  pluginOptions: {
    apollo: {
      lintGQL: true,
    },
  },
  // configureWebpack: (config) => {
  //   if (process.env.NODE_ENV === 'production') {
  //     config.externals = [nodeExternals()];
  //   }
  // },
  publicPath: '/',
  chainWebpack: (config) => {
    config.externals(['vue', 'vue-router', 'vue-matomo', 'vuetify']);
  },
};
