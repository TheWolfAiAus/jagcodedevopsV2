"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const functions = __importStar(require("firebase-functions"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Helper to safely require route modules from the repository's src/routes folder
function tryLoadRoute(relativePath) {
    try {
        // Use require to load CommonJS-style modules
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(`../../src/routes/${relativePath}`);
        // Module may export router as default or module.exports
        return mod && (mod.default || mod);
    }
    catch (e) {
        console.warn(`Failed to load route ${relativePath}:`, e.message || e);
        return null;
    }
}
// Try to load a routers index that exports all routers. Falls back to individual files.
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const routers = require('../../src/routes/routersIndex');
    if (routers) {
        if (routers.cryptoRoutes)
            app.use('/api/crypto', routers.cryptoRoutes);
        if (routers.nftRoutes)
            app.use('/api/nft', routers.nftRoutes);
        if (routers.wolfRoutes)
            app.use('/api/wolf', routers.wolfRoutes);
        if (routers.wolfAIApiRoutes)
            app.use('/api/wolfai', routers.wolfAIApiRoutes);
        if (routers.authRoutes)
            app.use('/api/auth', routers.authRoutes);
        if (routers.userRoutes)
            app.use('/api/user', routers.userRoutes);
        if (routers.actionRoutes)
            app.use('/api/actions', routers.actionRoutes);
        if (routers.webflowFormWebhook)
            app.use('/', routers.webflowFormWebhook);
        if (routers.webflowIntegrationRoutes)
            app.use('/api/webflow', routers.webflowIntegrationRoutes);
        if (routers.miniAppRoutes)
            app.use('/api/mini', routers.miniAppRoutes);
    }
}
catch (e) {
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
        if (router)
            app.use(r.path, router);
    }
}
// Minimal healthcheck
app.get('/_health', (_req, res) => res.json({ ok: true }));
exports.api = functions.https.onRequest(app);
