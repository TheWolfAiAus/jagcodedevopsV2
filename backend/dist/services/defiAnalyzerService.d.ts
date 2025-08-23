import { EventEmitter } from 'events';
interface YieldOpportunity {
    protocol: string;
    poolAddress: string;
    tokenPair: string[];
    apy: number;
    tvl: number;
    riskScore: number;
    minimumDeposit: number;
    estimatedGas: number;
    category: 'stable' | 'volatile' | 'exotic';
}
interface ArbitrageOpportunity {
    tokenSymbol: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    priceDifference: number;
    profitPercentage: number;
    gasEstimate: number;
    profitAfterGas: number;
}
export declare class DeFiAnalyzerService extends EventEmitter {
    private provider;
    private currentUserId;
    private isRunning;
    private analysisInterval;
    private monitoringTimer;
    private protocols;
    private tokens;
    constructor();
    setCurrentUser(userId: string): void;
    startAnalysis(): Promise<void>;
    stopAnalysis(): Promise<void>;
    private performAnalysis;
    private findYieldOpportunities;
    private findArbitrageOpportunities;
    private analyzeLiquidity;
    private getProtocolMetrics;
    private getGasPrice;
    private logOpportunities;
    getYieldOpportunities(minAPY?: number): Promise<YieldOpportunity[]>;
    getArbitrageOpportunities(minProfit?: number): Promise<ArbitrageOpportunity[]>;
    getBestYieldOpportunity(riskTolerance?: number): Promise<YieldOpportunity | null>;
    getProtocolRankings(): Promise<{
        protocol: string;
        score: number;
        metrics: any;
    }[]>;
    simulateYieldStrategy(amount: number, duration: number, riskLevel: 'low' | 'medium' | 'high'): Promise<{
        projectedYield: number;
        bestProtocols: string[];
        riskAssessment: string;
        gasEstimate: number;
    }>;
    setAnalysisInterval(intervalMs: number): void;
}
declare const _default: DeFiAnalyzerService;
export default _default;
//# sourceMappingURL=defiAnalyzerService.d.ts.map