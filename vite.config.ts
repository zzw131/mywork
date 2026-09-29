import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      // HMR WebSocket is disabled in AI Studio cloud preview environment
      // to prevent WebSocket connection resets and ERR_CONNECTION_CLOSED errors
      hmr: false,
      watch: {
        usePolling: false,
        ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**'],
      },
    },
  };
});
