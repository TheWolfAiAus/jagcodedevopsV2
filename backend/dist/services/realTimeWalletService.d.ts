import { EventEmitter } from 'events';
interface WalletBalance {
    address: string;
    balance: string;
    balanceUSD: number;
    currency: string;
    lastUpdated: Date;
}
interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    valueUSD: number;
    gas: string;
    gasPrice: string;
    gasUsed?: string;
    timestamp: Date;
    blockNumber: number;
    status: 'pending' | 'confirmed' | 'failed';
    type: 'sent' | 'received';
}
interface TokenBalance {
    contractAddress: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    valueUSD: number;
}
interface WalletData {
    address: string;
    ethBalance: WalletBalance;
    tokenBalances: TokenBalance[];
    transactions: Transaction[];
    totalValueUSD: number;
    lastUpdated: Date;
}
export declare class RealTimeWalletService extends EventEmitter {
    private web3;
    private ethersProvider;
    private monitoringWallets;
    private currentUserId;
    private isRunning;
    private updateInterval;
    private priceCache;
    private readonly tokenContracts;
    constructor();
    setCurrentUser(userId: string): void;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    addWalletToMonitor(address: string): Promise<void>;
    removeWalletFromMonitor(address: string): Promise<void>;
    private fetchWalletData;
    private getETHBalance;
    private getTokenBalances;
    private getERC20Balance;
    private getRecentTransactions;
    private getTokenPrice;
    private startPriceUpdateService;
    private updateDatabasePortfolio;
    getWalletSnapshot(address: string): Promise<WalletData>;
    getMonitoredWallets(): string[];
    setUpdateInterval(intervalMs: number): void;
    detectLargeTransactions(address: string, thresholdUSD?: number): Promise<Transaction[]>;
    getPortfolioSummary(addresses: string[]): Promise<{
        totalValue: number;
        assetBreakdown: {
            [symbol: string]: {
                amount: number;
                valueUSD: number;
            };
        };
        lastUpdated: Date;
    }>;
}
declare const _default: RealTimeWalletService;
export default _default;
//# sourceMappingURL=realTimeWalletService.d.ts.map