import {EventEmitter} from 'events';
import {ethers} from 'ethers';
import databaseService from './databaseService';

interface DeFiProtocol {
    name: string;
    address: string;
    type: 'lending' | 'dex' | 'yield_farming' | 'staking' | 'liquidity_pool';
    tvl: number;
    apy: number;
    tokens: string[];
    riskScore: number;
}

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

interface LiquidityAnalysis {
    protocol: string;
    poolAddress: string;
    token0: string;
    token1: string;
    liquidity: number;
    volume24h: number;
    fees24h: number;
    priceImpact: number;
    slippage: number;
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

interface DefiMetrics {
    totalValueLocked: number;
    totalYieldEarned: number;
    averageAPY: number;
    activePositions: number;
    riskExposure: number;
    lastUpdated: Date;
}

export class DeFiAnalyzerService extends EventEmitter {
    private provider: ethers.JsonRpcProvider;
    private currentUserId: string | null = null;
    private isRunning = false;
    private analysisInterval = 30000; // 30 seconds
    private monitoringTimer: NodeJS.Timeout | null = null;

    // DeFi Protocol Contracts
    private protocols = {
        uniswap_v3: {
            name: 'Uniswap V3',
            factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
            router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            type: 'dex'
        },
        aave_v3: {
            name: 'Aave V3',
            pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
            type: 'lending'
        },
        compound_v3: {
            name: 'Compound V3',
            comet: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
            type: 'lending'
        },
        curve: {
            name: 'Curve Finance',
            registry: '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
            type: 'dex'
        },
        yearn: {
            name: 'Yearn Finance',
            registry: '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804',
            type: 'yield_farming'
        }
    };

    // Popular token addresses for analysis
    private tokens = {
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        USDC: '0xA0b86a33E6E1DCC1D5E9A8c5E3e4c3c5d5F6D7E8',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    };

    constructor() {
        super();
        this.provider = new ethers.JsonRpcProvider('https://ethereum.publicnode.com');
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async startAnalysis(): Promise<void> {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('🔍 DeFi Analyzer started - Scanning for opportunities...');

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'DeFi Analyzer service started - Scanning protocols'
            });
        }

        this.monitoringTimer = setInterval(async () => {
            try {
                await this.performAnalysis();
            } catch (error) {
                console.error('DeFi analysis error:', error);
                this.emit('analysisError', error);
            }
        }, this.analysisInterval);

        // Perform initial analysis
        await this.performAnalysis();
        this.emit('analysisStarted');
    }

    async stopAnalysis(): Promise<void> {
        this.isRunning = false;
        
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        console.log('⏹️ DeFi Analyzer stopped');

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'DeFi Analyzer service stopped'
            });
        }

        this.emit('analysisStopped');
    }

    private async performAnalysis(): Promise<void> {
        console.log('🔄 Performing DeFi analysis...');

        const [
            yieldOpportunities,
            arbitrageOpps,
            liquidityAnalysis,
            protocolMetrics
        ] = await Promise.all([
            this.findYieldOpportunities(),
            this.findArbitrageOpportunities(),
            this.analyzeLiquidity(),
            this.getProtocolMetrics()
        ]);

        const analysisResults = {
            yieldOpportunities,
            arbitrageOpportunities: arbitrageOpps,
            liquidityAnalysis,
            protocolMetrics,
            timestamp: new Date()
        };

        // Emit real-time results
        this.emit('analysisComplete', analysisResults);

        // Log high-value opportunities
        if (this.currentUserId) {
            await this.logOpportunities(analysisResults);
        }

        console.log(`✅ Analysis complete - Found ${yieldOpportunities.length} yield opportunities`);
    }

    private async findYieldOpportunities(): Promise<YieldOpportunity[]> {
        const opportunities: YieldOpportunity[] = [];

        try {
            // Simulate real DeFi yield opportunity discovery
            const mockOpportunities = [
                {
                    protocol: 'Aave V3',
                    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
                    tokenPair: ['USDC'],
                    apy: 4.25 + Math.random() * 2, // Dynamic APY simulation
                    tvl: 1250000000 + Math.random() * 500000000,
                    riskScore: 2, // Low risk
                    minimumDeposit: 100,
                    estimatedGas: 150000,
                    category: 'stable' as const
                },
                {
                    protocol: 'Uniswap V3',
                    poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
                    tokenPair: ['USDC', 'WETH'],
                    apy: 15.75 + Math.random() * 10,
                    tvl: 180000000 + Math.random() * 50000000,
                    riskScore: 6, // Medium-high risk
                    minimumDeposit: 500,
                    estimatedGas: 200000,
                    category: 'volatile' as const
                },
                {
                    protocol: 'Curve Finance',
                    poolAddress: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
                    tokenPair: ['DAI', 'USDC', 'USDT'],
                    apy: 8.90 + Math.random() * 5,
                    tvl: 850000000 + Math.random() * 200000000,
                    riskScore: 3, // Low-medium risk
                    minimumDeposit: 1000,
                    estimatedGas: 180000,
                    category: 'stable' as const
                },
                {
                    protocol: 'Yearn Finance',
                    poolAddress: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
                    tokenPair: ['WETH'],
                    apy: 12.40 + Math.random() * 8,
                    tvl: 95000000 + Math.random() * 20000000,
                    riskScore: 5, // Medium risk
                    minimumDeposit: 0.1,
                    estimatedGas: 220000,
                    category: 'volatile' as const
                }
            ];

            opportunities.push(...mockOpportunities);

            // Filter for profitable opportunities (APY > 5%)
            return opportunities.filter(opp => opp.apy > 5.0);

        } catch (error) {
            console.error('Error finding yield opportunities:', error);
            return opportunities;
        }
    }

    private async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
        const opportunities: ArbitrageOpportunity[] = [];

        try {
            // Simulate real arbitrage opportunity detection
            const tokens = ['WETH', 'USDC', 'WBTC', 'DAI'];
            const exchanges = ['Uniswap', 'Sushiswap', 'Curve', '1inch'];

            for (const token of tokens) {
                // Simulate price differences between exchanges
                const basePrice = 1000 + Math.random() * 2000; // Mock price
                const priceDiff = (Math.random() - 0.5) * 0.05; // ±2.5% difference
                
                if (Math.abs(priceDiff) > 0.01) { // Only profitable arbitrage (>1%)
                    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
                    const sellExchange = exchanges.filter(e => e !== buyExchange)[0];
                    
                    const buyPrice = basePrice * (1 - Math.abs(priceDiff) / 2);
                    const sellPrice = basePrice * (1 + Math.abs(priceDiff) / 2);
                    const gasEstimate = 300000 + Math.random() * 200000;
                    const gasPrice = await this.getGasPrice();
                    const gasCostUSD = (gasEstimate * gasPrice * 2000) / 1e18; // Approximate
                    
                    opportunities.push({
                        tokenSymbol: token,
                        buyExchange,
                        sellExchange,
                        buyPrice,
                        sellPrice,
                        priceDifference: sellPrice - buyPrice,
                        profitPercentage: ((sellPrice - buyPrice) / buyPrice) * 100,
                        gasEstimate: Math.floor(gasEstimate),
                        profitAfterGas: (sellPrice - buyPrice) - gasCostUSD
                    });
                }
            }

            return opportunities.filter(opp => opp.profitAfterGas > 10); // Min $10 profit

        } catch (error) {
            console.error('Error finding arbitrage opportunities:', error);
            return opportunities;
        }
    }

    private async analyzeLiquidity(): Promise<LiquidityAnalysis[]> {
        const analyses: LiquidityAnalysis[] = [];

        try {
            // Mock liquidity analysis for major pools
            const pools = [
                {
                    protocol: 'Uniswap V3',
                    poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
                    token0: 'USDC',
                    token1: 'WETH'
                },
                {
                    protocol: 'Curve',
                    poolAddress: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
                    token0: 'DAI',
                    token1: 'USDC'
                }
            ];

            for (const pool of pools) {
                analyses.push({
                    protocol: pool.protocol,
                    poolAddress: pool.poolAddress,
                    token0: pool.token0,
                    token1: pool.token1,
                    liquidity: 50000000 + Math.random() * 200000000,
                    volume24h: 10000000 + Math.random() * 50000000,
                    fees24h: 25000 + Math.random() * 100000,
                    priceImpact: Math.random() * 0.5, // 0-0.5%
                    slippage: Math.random() * 1.0 // 0-1%
                });
            }

        } catch (error) {
            console.error('Error analyzing liquidity:', error);
        }

        return analyses;
    }

    private async getProtocolMetrics(): Promise<DefiMetrics> {
        try {
            // Aggregate DeFi metrics
            return {
                totalValueLocked: 45000000000 + Math.random() * 10000000000, // ~$45-55B
                totalYieldEarned: 150000 + Math.random() * 50000, // Mock user earnings
                averageAPY: 8.5 + Math.random() * 5, // 8.5-13.5%
                activePositions: 12 + Math.floor(Math.random() * 8), // 12-20 positions
                riskExposure: Math.random() * 10, // 0-10 risk score
                lastUpdated: new Date()
            };
        } catch (error) {
            console.error('Error getting protocol metrics:', error);
            return {
                totalValueLocked: 0,
                totalYieldEarned: 0,
                averageAPY: 0,
                activePositions: 0,
                riskExposure: 0,
                lastUpdated: new Date()
            };
        }
    }

    private async getGasPrice(): Promise<number> {
        try {
            const feeData = await this.provider.getFeeData();
            return Number(feeData.gasPrice || 20000000000); // 20 gwei fallback
        } catch (error) {
            return 20000000000; // 20 gwei fallback
        }
    }

    private async logOpportunities(results: any): Promise<void> {
        if (!this.currentUserId) return;

        try {
            // Log high-APY yield opportunities
            const highYieldOpps = results.yieldOpportunities.filter((opp: YieldOpportunity) => opp.apy > 15);
            
            for (const opp of highYieldOpps) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: `High-yield opportunity found: ${opp.protocol} - ${opp.apy.toFixed(2)}% APY`,
                    metadata: opp
                });
            }

            // Log profitable arbitrage opportunities
            const profitableArbs = results.arbitrageOpportunities.filter((arb: ArbitrageOpportunity) => arb.profitAfterGas > 50);
            
            for (const arb of profitableArbs) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: `Arbitrage opportunity: ${arb.tokenSymbol} - ${arb.profitPercentage.toFixed(2)}% profit potential`,
                    metadata: arb
                });
            }

        } catch (error) {
            console.error('Error logging opportunities:', error);
        }
    }

    // Public methods for getting data
    async getYieldOpportunities(minAPY: number = 0): Promise<YieldOpportunity[]> {
        const opportunities = await this.findYieldOpportunities();
        return opportunities.filter(opp => opp.apy >= minAPY);
    }

    async getArbitrageOpportunities(minProfit: number = 0): Promise<ArbitrageOpportunity[]> {
        const opportunities = await this.findArbitrageOpportunities();
        return opportunities.filter(opp => opp.profitAfterGas >= minProfit);
    }

    async getBestYieldOpportunity(riskTolerance: number = 10): Promise<YieldOpportunity | null> {
        const opportunities = await this.findYieldOpportunities();
        const filteredOpps = opportunities.filter(opp => opp.riskScore <= riskTolerance);
        
        if (filteredOpps.length === 0) return null;
        
        return filteredOpps.reduce((best, current) => 
            current.apy > best.apy ? current : best
        );
    }

    async getProtocolRankings(): Promise<{ protocol: string; score: number; metrics: any }[]> {
        const opportunities = await this.findYieldOpportunities();
        const protocolScores = new Map<string, { totalAPY: number; count: number; avgRisk: number }>();

        // Calculate protocol scores
        for (const opp of opportunities) {
            const current = protocolScores.get(opp.protocol) || { totalAPY: 0, count: 0, avgRisk: 0 };
            protocolScores.set(opp.protocol, {
                totalAPY: current.totalAPY + opp.apy,
                count: current.count + 1,
                avgRisk: (current.avgRisk + opp.riskScore) / 2
            });
        }

        return Array.from(protocolScores.entries()).map(([protocol, metrics]) => ({
            protocol,
            score: (metrics.totalAPY / metrics.count) / Math.max(metrics.avgRisk, 1), // APY per risk unit
            metrics: {
                averageAPY: metrics.totalAPY / metrics.count,
                opportunityCount: metrics.count,
                averageRisk: metrics.avgRisk
            }
        })).sort((a, b) => b.score - a.score);
    }

    async simulateYieldStrategy(amount: number, duration: number, riskLevel: 'low' | 'medium' | 'high'): Promise<{
        projectedYield: number;
        bestProtocols: string[];
        riskAssessment: string;
        gasEstimate: number;
    }> {
        const opportunities = await this.findYieldOpportunities();
        const riskFilters = { low: 3, medium: 6, high: 10 };
        const filteredOpps = opportunities.filter(opp => opp.riskScore <= riskFilters[riskLevel]);

        if (filteredOpps.length === 0) {
            return {
                projectedYield: 0,
                bestProtocols: [],
                riskAssessment: 'No suitable opportunities found',
                gasEstimate: 0
            };
        }

        const bestOpp = filteredOpps.reduce((best, current) => 
            current.apy > best.apy ? current : best
        );

        const projectedYield = (amount * bestOpp.apy / 100) * (duration / 365);
        
        return {
            projectedYield,
            bestProtocols: filteredOpps.slice(0, 3).map(opp => opp.protocol),
            riskAssessment: `${riskLevel.toUpperCase()} risk strategy with average ${bestOpp.apy.toFixed(2)}% APY`,
            gasEstimate: bestOpp.estimatedGas
        };
    }

    setAnalysisInterval(intervalMs: number): void {
        if (intervalMs < 10000) {
            throw new Error('Analysis interval cannot be less than 10 seconds');
        }
        this.analysisInterval = intervalMs;
        console.log(`⏱️ DeFi analysis interval set to ${intervalMs}ms`);
    }
}

export default new DeFiAnalyzerService();