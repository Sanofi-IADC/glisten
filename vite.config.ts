/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { visualizer } from 'rollup-plugin-visualizer';

const plugins: PluginOption[] = [vue(), vuetify({ autoImport: true })];

// `npm run report` produces a bundle analysis, replacing vue-cli's `--report`.
if (process.env.BUILD_REPORT) {
  plugins.push(
    visualizer({
      filename: 'dist/report.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption,
  );
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
  preview: {
    port: 8080,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/exports.ts', import.meta.url)),
      name: 'glisten',
      fileName: (format) => (format === 'es' ? 'glisten.js' : `glisten.${format}.cjs`),
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'vuetify'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css' || assetInfo.name === 'exports.css') {
            return 'glisten.css';
          }
          return assetInfo.name ?? 'asset';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.{js,jsx,ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/unit/coverage',
      include: ['src/**/*.{js,ts,vue}'],
    },
  },
});
