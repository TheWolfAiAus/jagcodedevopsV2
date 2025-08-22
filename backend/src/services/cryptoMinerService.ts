import { EventEmitter } from 'events';
import databaseService from './databaseService';

interface MiningConfig {
    coin: string;
    algorithm: string;
    poolUrl: string;
    difficulty: string;
    hashRate: number;
    isActive: boolean;
}

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
    activeMinersByAlgo: { [algorithm: string]: number };
    miners: MiningStats[];
    startTime?: Date;
    totalEarnings: number;
}

export class CryptoMinerService extends EventEmitter {
    private miners: Map<string, MiningStats> = new Map();
    private isRunning = false;
    private startTime?: Date;
    private currentUserId: string | null = null;
    private miningInterval?: NodeJS.Timeout;

    private readonly supportedCoins: MiningConfig[] = [
        {
            coin: 'BTC',
            algorithm: 'SHA256',
            poolUrl: 'stratum+tcp://btc.pool.com:4444',
            difficulty: 'auto',
            hashRate: 0,
            isActive: false
        },
        {
            coin: 'ETH',
            algorithm: 'Ethash',
            poolUrl: 'stratum1+tcp://eth.pool.com:4444',
            difficulty: 'auto',
            hashRate: 0,
            isActive: false
        },
        {
            coin: 'LTC',
            algorithm: 'Scrypt',
            poolUrl: 'stratum+tcp://ltc.pool.com:3333',
            difficulty: 'auto',
            hashRate: 0,
            isActive: false
        },
        {
            coin: 'XMR',
            algorithm: 'RandomX',
            poolUrl: 'pool.supportxmr.com:443',
            difficulty: 'auto',
            hashRate: 0,
            isActive: false
        }
    ];

    constructor() {
        super();
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⛏️ Mining already running');
            return;
        }

        this.isRunning = true;
        this.startTime = new Date();
        
        console.log('🚀 Starting crypto mining operations...');

        // Start mining for all configured coins
        for (const config of this.supportedCoins) {
            await this.startMiningCoin(config.coin);
        }

        // Start monitoring interval
        this.miningInterval = setInterval(async () => {
            await this.updateMiningStats();
        }, 30000); // Update every 30 seconds

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto mining operations started'
            });
        }

        this.emit('miningStarted');
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            console.log('⛏️ Mining already stopped');
            return;
        }

        this.isRunning = false;
        
        // Stop all mining operations
        for (const coin of this.miners.keys()) {
            await this.stopMiningCoin(coin);
        }

        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = undefined;
        }

        console.log('🛑 All mining operations stopped');

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto mining operations stopped'
            });
        }

        this.emit('miningStopped');
    }

    async startMiningCoin(coin: string): Promise<boolean> {
        const coinUpper = coin.toUpperCase();
        const config = this.supportedCoins.find(c => c.coin === coinUpper);
        
        if (!config) {
            console.error(`❌ Unsupported coin: ${coinUpper}`);
            return false;
        }

        if (this.miners.has(coinUpper)) {
            console.log(`⛏️ Already mining ${coinUpper}`);
            return true;
        }

        try {
            // Initialize mining stats
            const stats: MiningStats = {
                coin: coinUpper,
                hashRate: this.generateHashRate(config.algorithm),
                sharesAccepted: 0,
                sharesRejected: 0,
                uptimeMs: 0,
                estimatedEarnings: 0,
                currentBlock: await this.getCurrentBlockNumber(coinUpper),
                difficulty: config.difficulty,
                lastUpdate: new Date()
            };

            this.miners.set(coinUpper, stats);
            config.isActive = true;

            console.log(`🚀 Started mining ${coinUpper} with ${config.algorithm} algorithm`);
            console.log(`📊 Hash rate: ${stats.hashRate.toFixed(2)} MH/s`);

            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'mining_start',
                    description: `Started mining ${coinUpper}`,
                    metadata: {
                        coin: coinUpper,
                        algorithm: config.algorithm,
                        hash_rate: stats.hashRate
                    }
                });
            }

            this.emit('coinMiningStarted', { coin: coinUpper, stats });
            return true;
        } catch (error) {
            console.error(`❌ Error starting mining for ${coinUpper}:`, error);
            return false;
        }
    }

    async stopMiningCoin(coin: string): Promise<boolean> {
        const coinUpper = coin.toUpperCase();
        const stats = this.miners.get(coinUpper);
        
        if (!stats) {
            console.log(`⛏️ Not mining ${coinUpper}`);
            return true;
        }

        try {
            this.miners.delete(coinUpper);
            
            const config = this.supportedCoins.find(c => c.coin === coinUpper);
            if (config) {
                config.isActive = false;
            }

            console.log(`🛑 Stopped mining ${coinUpper}`);
            console.log(`📊 Final stats - Shares: ${stats.sharesAccepted} accepted, ${stats.sharesRejected} rejected`);

            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'mining_stop',
                    description: `Stopped mining ${coinUpper}`,
                    metadata: {
                        coin: coinUpper,
                        shares_accepted: stats.sharesAccepted,
                        shares_rejected: stats.sharesRejected,
                        estimated_earnings: stats.estimatedEarnings
                    }
                });
            }

            this.emit('coinMiningStopped', { coin: coinUpper, finalStats: stats });
            return true;
        } catch (error) {
            console.error(`❌ Error stopping mining for ${coinUpper}:`, error);
            return false;
        }
    }

    async getMiningStatus(): Promise<MiningStatus> {
        const miners = Array.from(this.miners.values());
        const totalHashRate = miners.reduce((sum, miner) => sum + miner.hashRate, 0);
        const totalEarnings = miners.reduce((sum, miner) => sum + miner.estimatedEarnings, 0);

        const activeMinersByAlgo: { [algorithm: string]: number } = {};
        for (const miner of miners) {
            const config = this.supportedCoins.find(c => c.coin === miner.coin);
            if (config) {
                activeMinersByAlgo[config.algorithm] = (activeMinersByAlgo[config.algorithm] || 0) + 1;
            }
        }

        return {
            isRunning: this.isRunning,
            totalHashRate,
            activeMinersByAlgo,
            miners,
            startTime: this.startTime,
            totalEarnings
        };
    }

    getSupportedCoins(): string[] {
        return this.supportedCoins.map(c => c.coin);
    }

    private async updateMiningStats(): Promise<void> {
        for (const [coin, stats] of this.miners.entries()) {
            // Simulate mining progress
            const newShares = Math.floor(Math.random() * 5) + 1;
            const rejectedShares = Math.random() < 0.1 ? 1 : 0;

            stats.sharesAccepted += newShares;
            stats.sharesRejected += rejectedShares;
            stats.uptimeMs = this.startTime ? Date.now() - this.startTime.getTime() : 0;
            stats.estimatedEarnings += this.calculateEarnings(coin, newShares);
            stats.lastUpdate = new Date();

            // Occasionally update current block
            if (Math.random() < 0.3) {
                stats.currentBlock = await this.getCurrentBlockNumber(coin);
            }

            this.emit('miningStatsUpdated', { coin, stats });
        }
    }

    private generateHashRate(algorithm: string): number {
        // Simulate different hash rates based on algorithm
        const baseRates = {
            'SHA256': 50, // TH/s for Bitcoin
            'Ethash': 100, // MH/s for Ethereum
            'Scrypt': 500, // MH/s for Litecoin  
            'RandomX': 5 // KH/s for Monero
        };

        const baseRate = baseRates[algorithm as keyof typeof baseRates] || 50;
        return baseRate * (0.8 + Math.random() * 0.4); // ±20% variance
    }

    private async getCurrentBlockNumber(coin: string): Promise<number> {
        // Simulate getting current block number
        const baseBlocks = {
            'BTC': 800000,
            'ETH': 18000000,
            'LTC': 2500000,
            'XMR': 2900000
        };

        const base = baseBlocks[coin as keyof typeof baseBlocks] || 1000000;
        return base + Math.floor(Math.random() * 1000);
    }

    private calculateEarnings(coin: string, shares: number): number {
        // Simulate earnings calculation based on current coin prices
        const basePrices = {
            'BTC': 45000,
            'ETH': 3000,
            'LTC': 100,
            'XMR': 150
        };

        const price = basePrices[coin as keyof typeof basePrices] || 100;
        const earningsPerShare = (price * 0.00001) * (Math.random() * 0.5 + 0.5);
        
        return shares * earningsPerShare;
    }
}

export default new CryptoMinerService();