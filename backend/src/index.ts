import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import {createServer} from 'http';
import {Server} from 'socket.io';

// Import routes
import cryptoRoutes from './routes/cryptoRoutes';
import nftRoutes from './routes/nftRoutes';
import wolfRoutes from './routes/wolfRoutes';
import wolfAIApiRoutes from './routes/wolfAIApiRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import actionRoutes from './routes/actionRoutes';
import webflowFormWebhook from './routes/webflowFormWebhook';
import webflowIntegrationRoutes from './routes/webflowIntegrationRoutes';
import miniAppRoutes from './routes/miniAppRoutes';

// Import middleware
import {errorHandler} from './middleware/errorHandler';
import {authMiddleware} from './middleware/authMiddleware';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
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
  origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/_health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0'
  });
});

// API Routes
app.use('/api/crypto', cryptoRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/wolf', wolfRoutes);
app.use('/api/wolfai', wolfAIApiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/actions', authMiddleware, actionRoutes);
app.use('/api/webflow', webflowIntegrationRoutes);
app.use('/api/mini', miniAppRoutes);
app.use('/', webflowFormWebhook);

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
app.use(errorHandler);

// 404 handler
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

export { app, io };
