"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoMiner = void 0;
const databaseService_1 = __importDefault(require("./databaseService"));
class CryptoMiner {
    constructor() {
        this.running = false;
        this.currentUserId = null;
        this.miningStartTime = null;
    }
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    async start() {
        this.running = true;
        this.miningStartTime = new Date();
        console.log('⛏️ Crypto Miner service started');
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'mining_start',
                description: 'Crypto mining operations started',
                metadata: {
                    start_time: this.miningStartTime,
                    currencies: ['BTC', 'ETH']
                }
            });
        }
    }
    async stop() {
        if (this.running && this.currentUserId && this.miningStartTime) {
            const endTime = new Date();
            const durationMinutes = Math.floor((endTime.getTime() - this.miningStartTime.getTime()) / 60000);
            await databaseService_1.default.registerMiningSession(this.currentUserId, {
                currency: 'BTC',
                hash_rate: '1.5 TH/s',
                duration_minutes: durationMinutes,
                earnings: durationMinutes * 0.0001,
                power_consumption: '100W'
            });
        }
        this.running = false;
        this.miningStartTime = null;
        console.log('⛏️ Crypto Miner service stopped');
    }
    async getMiningStatus() {
        return {
            is_running: this.running,
            operations: this.running ? [
                {
                    currency: 'BTC',
                    hash_rate: '1.5 TH/s',
                    earnings_total: 0.001,
                    power_consumption: '100W'
                }
            ] : []
        };
    }
    isRunning() {
        return this.running;
    }
}
exports.CryptoMiner = CryptoMiner;
//# sourceMappingURL=cryptoMiner.js.map