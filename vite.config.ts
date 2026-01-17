import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@game': resolve(__dirname, 'src/game'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@tools': resolve(__dirname, 'src/tools'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
