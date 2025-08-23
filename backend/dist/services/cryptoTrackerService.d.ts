import { EventEmitter } from 'events';
interface CryptoPriceData {
    symbol: string;
    name: string;
    currentPrice: number;
    priceChangePercent24h: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    totalSupply?: number;
    ath: number;
    athPercent: number;
    lastUpdated: Date;
}
interface PriceAlert {
    id: string;
    userId: string;
    symbol: string;
    alertType: 'above' | 'below' | 'percent_change';
    targetValue: number;
    currentValue: number;
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}
interface MarketTrend {
    symbol: string;
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    indicators: string[];
    prediction: string;
    confidence: number;
}
export declare class CryptoTrackerService extends EventEmitter {
    private prices;
    private alerts;
    private isRunning;
    private currentUserId;
    private updateInterval?;
    private alertInterval?;
    private readonly trackedCoins;
    constructor();
    setCurrentUser(userId: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    private fetchAllPrices;
    getPriceData(symbol?: string): Promise<CryptoPriceData | CryptoPriceData[]>;
    addPriceAlert(userId: string, symbol: string, alertType: 'above' | 'below' | 'percent_change', targetValue: number): Promise<string>;
    removePriceAlert(alertId: string): Promise<boolean>;
    getUserAlerts(userId: string): PriceAlert[];
    private checkPriceAlerts;
    private triggerAlert;
    getMarketTrends(): Promise<MarketTrend[]>;
    private analyzeTrend;
    private generatePrediction;
    getTopMovers(): Promise<{
        gainers: CryptoPriceData[];
        losers: CryptoPriceData[];
    }>;
    getTrackedCoins(): string[];
    isServiceRunning(): boolean;
}
declare const _default: CryptoTrackerService;
export default _default;
//# sourceMappingURL=cryptoTrackerService.d.ts.map