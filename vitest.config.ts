import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      reportsDirectory: '../coverages/frontend/coverage',
    },

    globals: true,
    environment: 'happy-dom',

    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    }
  },

  plugins: [react()]
});
