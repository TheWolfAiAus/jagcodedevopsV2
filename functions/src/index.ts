import express from 'express';
import * as functions from 'firebase-functions';

const app = express();
app.use(express.json());

// Helper to safely require route modules from the repository's src/routes folder
function tryLoadRoute(relativePath: string): express.Router | null {
  try {
    // Use require to load CommonJS-style modules
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(`../../src/routes/${relativePath}`);
    // Module may export router as default or module.exports
    return mod && (mod.default || mod);
  } catch (e) {
    console.warn(`Failed to load route ${relativePath}:`, e.message || e);
    return null;
  }
}

// Mount known routes if present
const routesToMount = [
  { path: '/api/crypto', file: 'cryptoRoutes.js' },
  { path: '/api/nft', file: 'nftRoutes.js' },
  { path: '/api/wolf', file: 'wolfRoutes.js' },
  { path: '/api/wolfai', file: 'wolfAIApiRoutes.js' },
  { path: '/api/auth', file: 'authRoutes.js' },
  { path: '/api/user', file: 'userRoutes.js' },
  { path: '/', file: 'webflowFormWebhook.js' }
];

for (const r of routesToMount) {
  const router = tryLoadRoute(r.file);
  if (router) app.use(r.path, router);
}

// Minimal healthcheck
app.get('/_health', (_req, res) => res.json({ ok: true }));

export const api = functions.https.onRequest(app);
