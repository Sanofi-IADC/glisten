const path = require('path');

// Load .env files
const { loadEnv } = require('vue-cli-plugin-apollo/utils/load-env');
const env = loadEnv([path.resolve(__dirname, '.env'), path.resolve(__dirname, '.env.local')]);

module.exports = {
  client: {
    service: {
      name: 'whispr',
      url: 'http://localhost:3000/graphql',
    },
    includes: ['src/**/*.{js,jsx,ts,tsx,vue,gql}'],
  },
};
