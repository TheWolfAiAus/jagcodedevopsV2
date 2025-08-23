"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cryptoMinerService_1 = __importDefault(require("../services/cryptoMinerService"));
const router = (0, express_1.Router)();
router.get('/status', async (req, res) => {
    try {
        const status = await cryptoMinerService_1.default.getMiningStatus();
        res.json({
            message: '⛏️ Mining status retrieved',
            status: status.isRunning ? 'active' : 'inactive',
            data: status
        });
    }
    catch (error) {
        console.error('Mining status error:', error);
        res.status(500).json({
            error: 'Failed to get mining status',
            details: error.message
        });
    }
});
router.post('/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            cryptoMinerService_1.default.setCurrentUser(userId);
        }
        await cryptoMinerService_1.default.start();
        res.json({
            message: '⛏️ Crypto mining started for all coins!',
            status: 'started',
            supported_coins: cryptoMinerService_1.default.getSupportedCoins()
        });
        console.log('🚀 Crypto mining started via API');
    }
    catch (error) {
        console.error('Mining start error:', error);
        res.status(500).json({
            error: 'Failed to start mining',
            details: error.message
        });
    }
});
router.post('/stop', async (req, res) => {
    try {
        await cryptoMinerService_1.default.stop();
        res.json({
            message: '🛑 All mining operations stopped',
            status: 'stopped'
        });
        console.log('🛑 Crypto mining stopped via API');
    }
    catch (error) {
        console.error('Mining stop error:', error);
        res.status(500).json({
            error: 'Failed to stop mining',
            details: error.message
        });
    }
});
router.post('/start/:coin', async (req, res) => {
    try {
        const { coin } = req.params;
        const { userId } = req.body;
        if (userId) {
            cryptoMinerService_1.default.setCurrentUser(userId);
        }
        const success = await cryptoMinerService_1.default.startMiningCoin(coin);
        if (success) {
            res.json({
                message: `⛏️ Started mining ${coin.toUpperCase()}`,
                status: 'started',
                coin: coin.toUpperCase()
            });
            console.log(`🚀 Started mining ${coin.toUpperCase()} via API`);
        }
        else {
            res.status(400).json({
                error: `Failed to start mining ${coin.toUpperCase()}`,
                details: 'Coin may not be supported or already mining'
            });
        }
    }
    catch (error) {
        console.error(`Mining start error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to start mining ${req.params.coin}`,
            details: error.message
        });
    }
});
router.post('/stop/:coin', async (req, res) => {
    try {
        const { coin } = req.params;
        const success = await cryptoMinerService_1.default.stopMiningCoin(coin);
        if (success) {
            res.json({
                message: `🛑 Stopped mining ${coin.toUpperCase()}`,
                status: 'stopped',
                coin: coin.toUpperCase()
            });
            console.log(`🛑 Stopped mining ${coin.toUpperCase()} via API`);
        }
        else {
            res.status(400).json({
                error: `Failed to stop mining ${coin.toUpperCase()}`,
                details: 'Coin may not be currently mining'
            });
        }
    }
    catch (error) {
        console.error(`Mining stop error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to stop mining ${req.params.coin}`,
            details: error.message
        });
    }
});
router.get('/supported', (req, res) => {
    try {
        const supportedCoins = cryptoMinerService_1.default.getSupportedCoins();
        res.json({
            message: 'Supported mining coins retrieved',
            supported_coins: supportedCoins,
            count: supportedCoins.length
        });
    }
    catch (error) {
        console.error('Supported coins error:', error);
        res.status(500).json({
            error: 'Failed to get supported coins',
            details: error.message
        });
    }
});
router.get('/stats/:coin', async (req, res) => {
    try {
        const { coin } = req.params;
        const status = await cryptoMinerService_1.default.getMiningStatus();
        const coinStats = status.miners.find(m => m.coin === coin.toUpperCase());
        if (coinStats) {
            res.json({
                message: `Mining stats for ${coin.toUpperCase()} retrieved`,
                coin: coin.toUpperCase(),
                stats: coinStats
            });
        }
        else {
            res.status(404).json({
                error: `No mining stats found for ${coin.toUpperCase()}`,
                details: 'Coin is not currently being mined'
            });
        }
    }
    catch (error) {
        console.error(`Mining stats error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to get mining stats for ${req.params.coin}`,
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=cryptoMinerRoutes.js.map