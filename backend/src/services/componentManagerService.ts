import { EventEmitter } from 'events';
import databaseService from './databaseService';

interface ComponentStatus {
    name: string;
    type: 'frontend' | 'backend' | 'service' | 'database';
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
    health: 'healthy' | 'unhealthy' | 'unknown';
    uptime: number;
    lastCheck: Date;
    errorCount: number;
    memoryUsage?: number;
    cpuUsage?: number;
    url?: string;
    port?: number;
}

interface SystemMetrics {
    totalComponents: number;
    runningComponents: number;
    healthyComponents: number;
    errorComponents: number;
    systemUptime: number;
    averageResponseTime: number;
    totalMemoryUsage: number;
    lastUpdate: Date;
}

export class ComponentManagerService extends EventEmitter {
    private components: Map<string, ComponentStatus> = new Map();
    private systemStartTime: Date = new Date();
    private monitoringInterval?: NodeJS.Timeout;
    private isRunning = false;
    private currentUserId: string | null = null;

    private readonly defaultComponents: ComponentStatus[] = [
        {
            name: 'Frontend',
            type: 'frontend',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0,
            url: 'http://localhost:3000',
            port: 3000
        },
        {
            name: 'Backend API',
            type: 'backend',
            status: 'running',
            health: 'healthy',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0,
            url: 'http://localhost:8000',
            port: 8000
        },
        {
            name: 'Database Service',
            type: 'database',
            status: 'running',
            health: 'healthy',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'Crypto Tracker',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'Crypto Miner',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'Real-time Wallet Monitor',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'DeFi Analyzer',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'NFT Hunter',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'Speech Recognition',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        },
        {
            name: 'Salesforce Integration',
            type: 'service',
            status: 'stopped',
            health: 'unknown',
            uptime: 0,
            lastCheck: new Date(),
            errorCount: 0
        }
    ];

    constructor() {
        super();
        this.initializeComponents();
    }

    private initializeComponents(): void {
        for (const component of this.defaultComponents) {
            this.components.set(component.name, { ...component });
        }
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async start(): Promise<void> {
        if (this.isRunning) return;

        this.isRunning = true;
        this.systemStartTime = new Date();

        console.log('🔧 Starting component manager service...');

        // Start monitoring interval
        this.monitoringInterval = setInterval(async () => {
            await this.checkAllComponents();
        }, 30000); // Check every 30 seconds

        // Initial component check
        await this.checkAllComponents();

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Component manager service started'
            });
        }

        this.emit('managerStarted');
    }

    async stop(): Promise<void> {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }

        console.log('🔧 Component manager service stopped');

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Component manager service stopped'
            });
        }

        this.emit('managerStopped');
    }

    private async checkAllComponents(): Promise<void> {
        for (const [name, component] of this.components.entries()) {
            try {
                await this.checkComponent(name);
            } catch (error) {
                console.error(`Error checking component ${name}:`, error);
            }
        }
    }

    private async checkComponent(name: string): Promise<void> {
        const component = this.components.get(name);
        if (!component) return;

        const startTime = Date.now();
        let newStatus = component.status;
        let newHealth = component.health;

        try {
            if (component.url) {
                // Try to ping the component
                const response = await fetch(`${component.url}/health`, {
                    method: 'GET',
                    timeout: 5000
                }).catch(() => null);

                if (response && response.ok) {
                    newStatus = 'running';
                    newHealth = 'healthy';
                    component.errorCount = 0;
                } else {
                    newStatus = 'error';
                    newHealth = 'unhealthy';
                    component.errorCount++;
                }
            } else {
                // For services without URLs, simulate health checks
                if (component.type === 'service') {
                    // You would integrate with actual service status here
                    const isHealthy = Math.random() > 0.1; // 90% healthy simulation
                    newHealth = isHealthy ? 'healthy' : 'unhealthy';
                    
                    if (component.status === 'running') {
                        if (!isHealthy) {
                            component.errorCount++;
                            if (component.errorCount > 3) {
                                newStatus = 'error';
                            }
                        } else {
                            component.errorCount = 0;
                        }
                    }
                }
            }

            // Update component
            const responseTime = Date.now() - startTime;
            component.status = newStatus;
            component.health = newHealth;
            component.lastCheck = new Date();
            
            if (newStatus === 'running') {
                component.uptime += 30; // Add 30 seconds
            }

            // Simulate resource usage
            if (newStatus === 'running') {
                component.memoryUsage = Math.random() * 100;
                component.cpuUsage = Math.random() * 50;
            }

            this.components.set(name, component);
            this.emit('componentChecked', { name, component, responseTime });

        } catch (error) {
            component.status = 'error';
            component.health = 'unhealthy';
            component.errorCount++;
            component.lastCheck = new Date();
            
            this.components.set(name, component);
            console.error(`Component check failed for ${name}:`, error);
            this.emit('componentError', { name, error });
        }
    }

    async updateComponentStatus(name: string, status: 'running' | 'stopped' | 'error'): Promise<void> {
        const component = this.components.get(name);
        if (!component) {
            throw new Error(`Component ${name} not found`);
        }

        component.status = status;
        component.lastCheck = new Date();
        
        if (status === 'running') {
            component.health = 'healthy';
            component.errorCount = 0;
        } else if (status === 'error') {
            component.health = 'unhealthy';
            component.errorCount++;
        } else {
            component.health = 'unknown';
            component.uptime = 0;
        }

        this.components.set(name, component);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'component_status_change',
                description: `Component ${name} status changed to ${status}`,
                metadata: {
                    component: name,
                    old_status: component.status,
                    new_status: status
                }
            });
        }

        this.emit('componentStatusChanged', { name, status, component });
        console.log(`🔧 Component ${name} status updated to: ${status}`);
    }

    getComponentStatus(name: string): ComponentStatus | null {
        return this.components.get(name) || null;
    }

    getAllComponents(): ComponentStatus[] {
        return Array.from(this.components.values());
    }

    getSystemMetrics(): SystemMetrics {
        const components = Array.from(this.components.values());
        const runningComponents = components.filter(c => c.status === 'running');
        const healthyComponents = components.filter(c => c.health === 'healthy');
        const errorComponents = components.filter(c => c.status === 'error');
        
        const totalMemoryUsage = components
            .reduce((sum, c) => sum + (c.memoryUsage || 0), 0);

        return {
            totalComponents: components.length,
            runningComponents: runningComponents.length,
            healthyComponents: healthyComponents.length,
            errorComponents: errorComponents.length,
            systemUptime: Date.now() - this.systemStartTime.getTime(),
            averageResponseTime: 150 + Math.random() * 100, // Simulated
            totalMemoryUsage,
            lastUpdate: new Date()
        };
    }

    async restartComponent(name: string): Promise<void> {
        const component = this.components.get(name);
        if (!component) {
            throw new Error(`Component ${name} not found`);
        }

        console.log(`🔄 Restarting component: ${name}`);
        
        // Set to starting status
        await this.updateComponentStatus(name, 'error');
        component.status = 'starting';
        
        // Simulate restart delay
        setTimeout(async () => {
            await this.updateComponentStatus(name, 'running');
            console.log(`✅ Component ${name} restarted successfully`);
        }, 3000);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'component_restart',
                description: `Restarted component ${name}`,
                metadata: { component: name }
            });
        }
    }

    getComponentsByType(type: 'frontend' | 'backend' | 'service' | 'database'): ComponentStatus[] {
        return Array.from(this.components.values()).filter(c => c.type === type);
    }

    getUnhealthyComponents(): ComponentStatus[] {
        return Array.from(this.components.values()).filter(
            c => c.health === 'unhealthy' || c.status === 'error'
        );
    }

    isSystemHealthy(): boolean {
        const components = Array.from(this.components.values());
        const criticalComponents = components.filter(c => 
            c.type === 'backend' || c.type === 'database'
        );
        
        return criticalComponents.every(c => c.health === 'healthy');
    }

    isServiceRunning(): boolean {
        return this.isRunning;
    }
}

export default new ComponentManagerService();