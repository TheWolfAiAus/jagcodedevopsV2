import { EventEmitter } from 'events';
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
export declare class ComponentManagerService extends EventEmitter {
    private components;
    private systemStartTime;
    private monitoringInterval?;
    private isRunning;
    private currentUserId;
    private readonly defaultComponents;
    constructor();
    private initializeComponents;
    setCurrentUser(userId: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    private checkAllComponents;
    private checkComponent;
    updateComponentStatus(name: string, status: 'running' | 'stopped' | 'error'): Promise<void>;
    getComponentStatus(name: string): ComponentStatus | null;
    getAllComponents(): ComponentStatus[];
    getSystemMetrics(): SystemMetrics;
    restartComponent(name: string): Promise<void>;
    getComponentsByType(type: 'frontend' | 'backend' | 'service' | 'database'): ComponentStatus[];
    getUnhealthyComponents(): ComponentStatus[];
    isSystemHealthy(): boolean;
    isServiceRunning(): boolean;
}
declare const _default: ComponentManagerService;
export default _default;
//# sourceMappingURL=componentManagerService.d.ts.map