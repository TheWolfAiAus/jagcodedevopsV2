import { EventEmitter } from 'events';
interface MiningStats {
    coin: string;
    hashRate: number;
    sharesAccepted: number;
    sharesRejected: number;
    uptimeMs: number;
    estimatedEarnings: number;
    currentBlock: number;
    difficulty: string;
    lastUpdate: Date;
}
interface MiningStatus {
    isRunning: boolean;
    totalHashRate: number;
    activeMinersByAlgo: {
        [algorithm: string]: number;
    };
    miners: MiningStats[];
    startTime?: Date;
    totalEarnings: number;
}
export declare class CryptoMinerService extends EventEmitter {
    private miners;
    private isRunning;
    private startTime?;
    private currentUserId;
    private miningInterval?;
    private readonly supportedCoins;
    constructor();
    setCurrentUser(userId: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    startMiningCoin(coin: string): Promise<boolean>;
    stopMiningCoin(coin: string): Promise<boolean>;
    getMiningStatus(): Promise<MiningStatus>;
    getSupportedCoins(): string[];
    private updateMiningStats;
    private generateHashRate;
    private getCurrentBlockNumber;
    private calculateEarnings;
}
declare const _default: CryptoMinerService;
export default _default;
//# sourceMappingURL=cryptoMinerService.d.ts.map