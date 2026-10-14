import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Hosted previews proxy HTTP but do not expose Vite's HMR WebSocket.
  server: {
    hmr: false,
    watch: null,
  },
  plugins: [
    react(),
    {
      name: 'disable-preview-hmr-client',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(/<script[^>]+src=["']\/?@vite\/client["'][^>]*><\/script>/gi, '');
        },
      },
    },
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
