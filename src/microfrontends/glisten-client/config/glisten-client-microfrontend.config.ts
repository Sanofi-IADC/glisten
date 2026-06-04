import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));

// Builds the glisten-client as a single-spa (SystemJS) micro-frontend bundle.
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist/@sanofi-iadc-glisten-client-microfrontend'),
    cssCodeSplit: false,
    // Broaden output compatibility (replaces the previous `babel-polyfill` import)
    // so the micro-frontend keeps running on the browsers listed in .browserslistrc.
    target: 'es2015',
    lib: {
      entry: fileURLToPath(new URL('../index.ts', import.meta.url)),
      name: 'glistenClientMicrofrontend',
      formats: ['system'],
      fileName: () => 'glisten-client.js',
    },
    rollupOptions: {
      external: ['vue', 'vuetify'],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
        },
      },
    },
  },
});
