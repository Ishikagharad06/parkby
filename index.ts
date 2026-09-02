// Vercel serverless entry point.
//
// Vercel treats every file under /api as its own serverless function.
// This one re-exports the same Express app used for local dev
// (src/appServer.ts) so both environments run identical route logic.
// All requests to /api/* are routed here via the rewrite in vercel.json.
export { default } from '../src/appServer.js';
