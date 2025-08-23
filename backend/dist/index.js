"use strict";
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
const cryptoRoutes_1 = __importDefault(require("./routes/cryptoRoutes"));
const nftRoutes_1 = __importDefault(require("./routes/nftRoutes"));
const wolfRoutes_1 = __importDefault(require("./routes/wolfRoutes"));
const wolfAIApiRoutes_1 = __importDefault(require("./routes/wolfAIApiRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const actionRoutes_1 = __importDefault(require("./routes/actionRoutes"));
const webflowFormWebhook_1 = __importDefault(require("./routes/webflowFormWebhook"));
const webflowIntegrationRoutes_1 = __importDefault(require("./routes/webflowIntegrationRoutes"));
const miniAppRoutes_1 = __importDefault(require("./routes/miniAppRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const authMiddleware_1 = require("./middleware/authMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
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
    origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/_health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0'
    });
});
app.use('/api/crypto', cryptoRoutes_1.default);
app.use('/api/nft', nftRoutes_1.default);
app.use('/api/wolf', wolfRoutes_1.default);
app.use('/api/wolfai', wolfAIApiRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', authMiddleware_1.authMiddleware, userRoutes_1.default);
app.use('/api/actions', authMiddleware_1.authMiddleware, actionRoutes_1.default);
app.use('/api/webflow', webflowIntegrationRoutes_1.default);
app.use('/api/mini', miniAppRoutes_1.default);
app.use('/', webflowFormWebhook_1.default);
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
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
const PORT = process.env['PORT'] || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/_health`);
});
//# sourceMappingURL=index.js.map