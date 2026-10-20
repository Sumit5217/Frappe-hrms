import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frappeTarget = env.VITE_FRAPPE_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: frappeTarget,
          changeOrigin: true,
          secure: false,
        },
        '/assets': {
          target: frappeTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
