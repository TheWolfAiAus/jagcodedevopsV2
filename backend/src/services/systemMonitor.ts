import * as os from 'os';

export class SystemMonitor {
    private running = false;

    async start(): Promise<void> {
        this.running = true;
        console.log('📊 System Monitor service started');
    }

    async stop(): Promise<void> {
        this.running = false;
        console.log('📊 System Monitor service stopped');
    }

    async getStatus(): Promise<any> {
        if (!this.running) {
            return {
                service_status: { system_healthy: false },
                message: 'System monitor not running'
            };
        }

        return {
            service_status: { system_healthy: true },
            system_info: {
                platform: os.platform(),
                arch: os.arch(),
                total_memory: os.totalmem(),
                free_memory: os.freemem(),
                cpu_count: os.cpus().length
            },
            uptime: os.uptime()
        };
    }

    async getPerformanceMetrics(): Promise<any> {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        return {
            current_stats: {
                cpu: {
                    percent: Math.min(loadAvg[0] * 10, 100), // Simplified CPU usage calculation
                    cores: cpus.length
                },
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem()
                },
                load_average: loadAvg
            }
        };
    }

    isRunning(): boolean {
        return this.running;
    }
}