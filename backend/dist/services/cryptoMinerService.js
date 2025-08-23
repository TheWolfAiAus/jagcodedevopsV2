"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoMinerService = void 0;
const events_1 = require("events");
const databaseService_1 = __importDefault(require("./databaseService"));
class CryptoMinerService extends events_1.EventEmitter {
    constructor() {
        super();
        this.miners = new Map();
        this.isRunning = false;
        this.currentUserId = null;
        this.supportedCoins = [
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
    }
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    async start() {
        if (this.isRunning) {
            console.log('⛏️ Mining already running');
            return;
        }
        this.isRunning = true;
        this.startTime = new Date();
        console.log('🚀 Starting crypto mining operations...');
        for (const config of this.supportedCoins) {
            await this.startMiningCoin(config.coin);
        }
        this.miningInterval = setInterval(async () => {
            await this.updateMiningStats();
        }, 30000);
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto mining operations started'
            });
        }
        this.emit('miningStarted');
    }
    async stop() {
        if (!this.isRunning) {
            console.log('⛏️ Mining already stopped');
            return;
        }
        this.isRunning = false;
        for (const coin of this.miners.keys()) {
            await this.stopMiningCoin(coin);
        }
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = undefined;
        }
        console.log('🛑 All mining operations stopped');
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto mining operations stopped'
            });
        }
        this.emit('miningStopped');
    }
    async startMiningCoin(coin) {
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
            const stats = {
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
                await databaseService_1.default.logActivity(this.currentUserId, {
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
        }
        catch (error) {
            console.error(`❌ Error starting mining for ${coinUpper}:`, error);
            return false;
        }
    }
    async stopMiningCoin(coin) {
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
                await databaseService_1.default.logActivity(this.currentUserId, {
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
        }
        catch (error) {
            console.error(`❌ Error stopping mining for ${coinUpper}:`, error);
            return false;
        }
    }
    async getMiningStatus() {
        const miners = Array.from(this.miners.values());
        const totalHashRate = miners.reduce((sum, miner) => sum + miner.hashRate, 0);
        const totalEarnings = miners.reduce((sum, miner) => sum + miner.estimatedEarnings, 0);
        const activeMinersByAlgo = {};
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
    getSupportedCoins() {
        return this.supportedCoins.map(c => c.coin);
    }
    async updateMiningStats() {
        for (const [coin, stats] of this.miners.entries()) {
            const newShares = Math.floor(Math.random() * 5) + 1;
            const rejectedShares = Math.random() < 0.1 ? 1 : 0;
            stats.sharesAccepted += newShares;
            stats.sharesRejected += rejectedShares;
            stats.uptimeMs = this.startTime ? Date.now() - this.startTime.getTime() : 0;
            stats.estimatedEarnings += this.calculateEarnings(coin, newShares);
            stats.lastUpdate = new Date();
            if (Math.random() < 0.3) {
                stats.currentBlock = await this.getCurrentBlockNumber(coin);
            }
            this.emit('miningStatsUpdated', { coin, stats });
        }
    }
    generateHashRate(algorithm) {
        const baseRates = {
            'SHA256': 50,
            'Ethash': 100,
            'Scrypt': 500,
            'RandomX': 5
        };
        const baseRate = baseRates[algorithm] || 50;
        return baseRate * (0.8 + Math.random() * 0.4);
    }
    async getCurrentBlockNumber(coin) {
        const baseBlocks = {
            'BTC': 800000,
            'ETH': 18000000,
            'LTC': 2500000,
            'XMR': 2900000
        };
        const base = baseBlocks[coin] || 1000000;
        return base + Math.floor(Math.random() * 1000);
    }
    calculateEarnings(coin, shares) {
        const basePrices = {
            'BTC': 45000,
            'ETH': 3000,
            'LTC': 100,
            'XMR': 150
        };
        const price = basePrices[coin] || 100;
        const earningsPerShare = (price * 0.00001) * (Math.random() * 0.5 + 0.5);
        return shares * earningsPerShare;
    }
}
exports.CryptoMinerService = CryptoMinerService;
exports.default = new CryptoMinerService();
//# sourceMappingURL=cryptoMinerService.js.map