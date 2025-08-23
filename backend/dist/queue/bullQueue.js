"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myQueue = void 0;
exports.setupBull = setupBull;
const bull_1 = __importDefault(require("bull"));
let initialized = false;
function getRedisConnection() {
    const url = process.env.REDIS_URL;
    if (url)
        return url;
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    const password = process.env.REDIS_PASSWORD;
    if (password) {
        return `redis://:${password}@${host}:${port}`;
    }
    return `redis://${host}:${port}`;
}
function setupBull() {
    if (initialized)
        return;
    if (process.env.ENABLE_BULL !== 'true') {
        console.log('Bull is disabled. Set ENABLE_BULL=true to enable job queue.');
        return;
    }
    try {
        const conn = getRedisConnection();
        exports.myQueue = new bull_1.default('my-queue', conn);
        exports.myQueue.process(async (job) => {
            console.log(`Processing job: ${job.id}`);
            return { ok: true };
        });
        exports.myQueue.add({ job: 'process-data' });
        exports.myQueue.on('error', (err) => {
            console.error('Bull queue error:', err.message || err);
        });
        exports.myQueue.on('failed', (job, err) => {
            console.error(`Job ${job.id} failed:`, err.message || err);
        });
        exports.myQueue.on('completed', (job) => {
            console.log(`Job ${job.id} completed`);
        });
        initialized = true;
        console.log('Bull queue initialized. Queue name: my-queue');
    }
    catch (err) {
        console.warn('Failed to initialize Bull. Continuing without queue. Reason:', err?.message || err);
    }
}
//# sourceMappingURL=bullQueue.js.map