import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500 // suppress large chunk warning
  },
  server: {
    proxy: {
      '/api': 'https://rebar-ai-backend.onrender.com'
    }
  }
});