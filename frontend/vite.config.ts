import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_Base_Url,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'window',
  },
});

