module.exports = {
  output: 'docs/api/',
  filenames: ['src/components/GlistenClient.vue', 'src/components/GlistenCsat.vue'],
  parsing: {
    features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events'],
  },
};
