export declare class CryptoMiner {
    private running;
    private currentUserId;
    private miningStartTime;
    setCurrentUser(userId: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    getMiningStatus(): Promise<any>;
    isRunning(): boolean;
}
//# sourceMappingURL=cryptoMiner.d.ts.map