import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  }
});
