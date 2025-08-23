export declare class SystemMonitor {
    private running;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): Promise<any>;
    getPerformanceMetrics(): Promise<any>;
    isRunning(): boolean;
}
//# sourceMappingURL=systemMonitor.d.ts.map