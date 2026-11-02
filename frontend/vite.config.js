import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests to /api go to the Express back end, so no CORS setup is needed in dev.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
});
