export declare class NFTHunter {
    private running;
    private currentUserId;
    setCurrentUser(userId: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    getTopOpportunities(limit?: number): Promise<any[]>;
    isRunning(): boolean;
}
//# sourceMappingURL=nftHunter.d.ts.map