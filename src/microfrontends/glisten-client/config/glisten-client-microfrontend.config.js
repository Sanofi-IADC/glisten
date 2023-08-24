const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../../../../dist/@sanofi-iadc-glisten-client-microfrontend'),
  css: {
    extract: false,
  },
  pluginOptions: {
    apollo: {
      lintGQL: true,
    },
  },
  chainWebpack: (config) => {
    if (config.plugins.has('SystemJSPublicPathWebpackPlugin')) {
      config.plugins.delete('SystemJSPublicPathWebpackPlugin');
    }
  },
  configureWebpack: (config) => {
    config.output = {
      ...config.output,
      libraryTarget: 'system',
      filename: '[name].js',
    };
    config.optimization = {
      splitChunks: false,
    };
  },
  filenameHashing: false,
};
