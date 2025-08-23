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
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const automationRoutes_1 = __importStar(require("./routes/automationRoutes"));
const nftHunterRoutes_1 = __importStar(require("./routes/nftHunterRoutes"));
const cryptoUtilsRoutes_1 = __importDefault(require("./routes/cryptoUtilsRoutes"));
const userManagementRoutes_1 = __importDefault(require("./routes/userManagementRoutes"));
const speechRoutes_1 = __importDefault(require("./routes/speechRoutes"));
const salesforceRoutes_1 = __importDefault(require("./routes/salesforceRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const cryptoMinerRoutes_1 = __importDefault(require("./routes/cryptoMinerRoutes"));
const cryptoTrackerRoutes_1 = __importDefault(require("./routes/cryptoTrackerRoutes"));
const componentRoutes_1 = __importDefault(require("./routes/componentRoutes"));
const storageRoutes_1 = __importDefault(require("./routes/storageRoutes"));
const automationEngine_1 = require("./services/automationEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const automationEngine = new automationEngine_1.AutomationEngine();
async function initializeServices() {
    console.log('Starting JAG-OPS Backend System...');
    try {
        await automationEngine.start();
        (0, automationRoutes_1.setAutomationEngine)(automationEngine);
        (0, nftHunterRoutes_1.setNftHunterService)(automationEngine.nftHunter);
        console.log('JAG-OPS Backend System started successfully!');
    }
    catch (error) {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    }
}
app.get('/_health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'JAG-OPS Backend System',
        status: 'operational',
        version: '1.0.0'
    });
});
app.get('/api/health', async (req, res) => {
    try {
        const systemStatus = await automationEngine.getStatus();
        res.json({
            status: 'healthy',
            system_monitor: systemStatus.services?.system_monitor?.status || {},
            automation_engine: {
                running: automationEngine.isRunning(),
                operations: systemStatus.operation_status
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});
app.use('/api/automation', automationRoutes_1.default);
app.use('/api/nft', nftHunterRoutes_1.default);
app.use('/api/crypto', cryptoUtilsRoutes_1.default);
app.use('/api/users', userManagementRoutes_1.default);
app.use('/api/speech', speechRoutes_1.default);
app.use('/api/salesforce', salesforceRoutes_1.default);
app.use('/api/wallet', walletRoutes_1.default);
app.use('/api/mining', cryptoMinerRoutes_1.default);
app.use('/api/tracker', cryptoTrackerRoutes_1.default);
app.use('/api/components', componentRoutes_1.default);
app.use('/api/storage', storageRoutes_1.default);
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
process.on('SIGTERM', async () => {
    console.log('Shutting down JAG-OPS Backend System...');
    await automationEngine.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('Shutting down JAG-OPS Backend System...');
    await automationEngine.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
const PORT = process.env.PORT || 8000;
initializeServices().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/_health`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map