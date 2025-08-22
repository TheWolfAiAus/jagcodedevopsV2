import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import automationRoutes, { setAutomationEngine } from './routes/automationRoutes';
import nftHunterRoutes, { setNftHunterService } from './routes/nftHunterRoutes';
import cryptoUtilsRoutes from './routes/cryptoUtilsRoutes';
import userManagementRoutes from './routes/userManagementRoutes';
import speechRoutes from './routes/speechRoutes';
import salesforceRoutes from './routes/salesforceRoutes';
import walletRoutes from './routes/walletRoutes';
import cryptoMinerRoutes from './routes/cryptoMinerRoutes';
import cryptoTrackerRoutes from './routes/cryptoTrackerRoutes';
import componentRoutes from './routes/componentRoutes';
import storageRoutes from './routes/storageRoutes';

// Import services
import { AutomationEngine } from './services/automationEngine';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global instances
const automationEngine = new AutomationEngine();

// Initialize services
async function initializeServices() {
    console.log('Starting JAG-OPS Backend System...');

    try {
        // Start automation engine
        await automationEngine.start();

        // Inject services into routes
        setAutomationEngine(automationEngine);
        setNftHunterService(automationEngine.nftHunter);

        console.log('JAG-OPS Backend System started successfully!');
    } catch (error) {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    }
}

// Health check
app.get('/_health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'JAG-OPS Backend System',
        status: 'operational',
        version: '1.0.0'
    });
});

// API health check
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
    } catch (error: any) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/automation', automationRoutes);
app.use('/api/nft', nftHunterRoutes);
app.use('/api/crypto', cryptoUtilsRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/salesforce', salesforceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/mining', cryptoMinerRoutes);
app.use('/api/tracker', cryptoTrackerRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/storage', storageRoutes);

// WebSocket connection handling
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

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Graceful shutdown
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

// Initialize services and start server
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

export { app, io };