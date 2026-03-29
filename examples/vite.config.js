import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/dynamic-font/',
  resolve: {
    alias: {
      // Point directly to source so changes are reflected without rebuilding
      'dynamic-font/react': path.resolve(__dirname, '../src/react/index.js'),
      'dynamic-font/core': path.resolve(__dirname, '../src/core.js'),
      'dynamic-font': path.resolve(__dirname, '../src/index.js'),
    },
  },
});
