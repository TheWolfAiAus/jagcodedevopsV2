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

// Try to load a routers index that exports all routers. Falls back to individual files.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const routers = require('../../src/routes/routersIndex');
  if (routers) {
    if (routers.cryptoRoutes) app.use('/api/crypto', routers.cryptoRoutes);
    if (routers.nftRoutes) app.use('/api/nft', routers.nftRoutes);
    if (routers.wolfRoutes) app.use('/api/wolf', routers.wolfRoutes);
    if (routers.wolfAIApiRoutes) app.use('/api/wolfai', routers.wolfAIApiRoutes);
    if (routers.authRoutes) app.use('/api/auth', routers.authRoutes);
    if (routers.userRoutes) app.use('/api/user', routers.userRoutes);
    if (routers.actionRoutes) app.use('/api/actions', routers.actionRoutes);
    if (routers.webflowFormWebhook) app.use('/', routers.webflowFormWebhook);
    if (routers.webflowIntegrationRoutes) app.use('/api/webflow', routers.webflowIntegrationRoutes);
    if (routers.miniAppRoutes) app.use('/api/mini', routers.miniAppRoutes);
  }
} catch (e) {
  // Fallback: attempt to load individual route files by name
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
}

// Minimal healthcheck
app.get('/_health', (_req: express.Request, res: express.Response) => res.json({ ok: true }));

export const api = functions.https.onRequest(app);
