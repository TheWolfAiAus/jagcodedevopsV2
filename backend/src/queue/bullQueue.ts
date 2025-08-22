import Queue, { QueueOptions, Job } from 'bull';

let initialized = false;
export let myQueue: Queue | undefined;

function getRedisConnection(): string | QueueOptions['redis'] {
  const url = process.env.REDIS_URL;
  if (url) return url;
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
  const password = process.env.REDIS_PASSWORD;
  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}

export function setupBull(): void {
  if (initialized) return;
  if (process.env.ENABLE_BULL !== 'true') {
    console.log('Bull is disabled. Set ENABLE_BULL=true to enable job queue.');
    return;
  }

  try {
    const conn = getRedisConnection();
    myQueue = new Queue('my-queue', conn);

    // Process jobs
    myQueue.process(async (job: Job) => {
      console.log(`Processing job: ${job.id}`);
      // Simulate some async work
      return { ok: true };
    });

    // Add a sample job
    myQueue.add({ job: 'process-data' });

    // Basic event handlers to avoid unhandled errors
    myQueue.on('error', (err: Error) => {
      console.error('Bull queue error:', (err as any).message || err);
    });
    myQueue.on('failed', (job, err: Error) => {
      console.error(`Job ${job.id} failed:`, (err as any).message || err);
    });
    myQueue.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    initialized = true;
    console.log('Bull queue initialized. Queue name: my-queue');
  } catch (err: any) {
    console.warn('Failed to initialize Bull. Continuing without queue. Reason:', err?.message || err);
  }
}
