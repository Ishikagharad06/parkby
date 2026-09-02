// Local development entry point ONLY.
//
// This file is what `npm run dev` and `npm run build`/`npm start` use.
// It is NOT used on Vercel — Vercel instead calls `api/index.ts`, which
// imports the same Express app from `src/appServer.ts` as a serverless
// function. Keeping the app definition in one shared file (appServer.ts)
// means dev and production always run identical route logic.
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app, { initDb } from './src/appServer.js';
import { completeExpiredNeonBookings } from './src/db/neon.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

initDb()
  .then(() => startServer())
  .then(() => {
    // Auto-expire bookings whose scheduled time has passed, freeing their
    // slots. Only meaningful for this long-running dev/traditional-host
    // process — on Vercel there's no persistent process to run an
    // interval in, so the serverless app instead relies on the
    // opportunistic completeExpiredNeonBookings() calls on every
    // /api/slots and /api/bookings/my request, plus /api/cron/expire-bookings.
    setInterval(() => {
      completeExpiredNeonBookings().catch(err =>
        console.error('❌ Failed to auto-complete expired bookings:', err)
      );
    }, 30_000);
  })
  .catch((error) => {
    console.error('❌ Database startup error:', error);
    process.exit(1);
  });
