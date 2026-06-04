const path = require('path');

// Generates API markdown docs from the SFCs (Vue 3 / <script setup> compatible),
// replacing the previous @vuedoc/md tooling.
module.exports = {
  componentsRoot: path.resolve(__dirname, 'src/components'),
  components: '{GlistenClient,GlistenCsat}.vue',
  outDir: path.resolve(__dirname, 'docs/api'),
  getDocFileName: (componentPath) =>
    path.join(path.resolve(__dirname, 'docs/api'), `${path.basename(componentPath, '.vue')}.md`),
  apiOptions: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
