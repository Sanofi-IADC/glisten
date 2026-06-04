import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    fixturesFolder: 'tests/e2e/fixtures',
    specPattern: 'tests/e2e/specs/**/*.spec.{js,jsx,ts,tsx}',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    video: true,
    screenshotOnRunFailure: true,
    // Smaller artifacts for GitHub Actions uploads
    videoCompression: 15,
    trashAssetsBeforeRuns: true,
    supportFile: 'tests/e2e/support/index.js',
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
