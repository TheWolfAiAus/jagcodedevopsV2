import { EventEmitter } from 'events';
import { NFTHunter } from './nftHunter';
import { CryptoMiner } from './cryptoMiner';
import { WalletManager } from './walletManager';
import { SmartContractManager } from './smartContractManager';
import { SystemMonitor } from './systemMonitor';
export declare class AutomationEngine extends EventEmitter {
    private running;
    private operationStatus;
    private currentUserId;
    nftHunter: NFTHunter;
    cryptoMiner: CryptoMiner;
    walletManager: WalletManager;
    smartContractManager: SmartContractManager;
    systemMonitor: SystemMonitor;
    constructor();
    setCurrentUser(userId: string): void;
    private logActivity;
    start(): Promise<void>;
    stop(): Promise<void>;
    startAllOperations(): Promise<void>;
    stopAllOperations(): Promise<void>;
    getStatus(): Promise<any>;
    executeProfitStrategy(): Promise<void>;
    emergencyStop(): Promise<void>;
    getProfitReport(): Promise<any>;
    optimizeOperations(): Promise<void>;
    transferProfitsToExodus(): Promise<void>;
    isRunning(): boolean;
}
//# sourceMappingURL=automationEngine.d.ts.map