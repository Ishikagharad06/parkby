import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // No /api proxy needed: `npm run dev` runs server.ts, which mounts
      // Vite as middleware inside the same Express process (see
      // server.ts), so API routes and the frontend already share one
      // origin/port. This also matches production on Vercel, where
      // vercel.json rewrites /api/* to the api/index.ts function.
    },
  };
});