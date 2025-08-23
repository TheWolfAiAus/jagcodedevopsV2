"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cryptoTrackerService_1 = __importDefault(require("../services/cryptoTrackerService"));
const router = (0, express_1.Router)();
router.post('/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            cryptoTrackerService_1.default.setCurrentUser(userId);
        }
        await cryptoTrackerService_1.default.start();
        res.json({
            message: '📊 Crypto tracker service started',
            status: 'running',
            tracked_coins: cryptoTrackerService_1.default.getTrackedCoins().length
        });
        console.log('📊 Crypto tracker started via API');
    }
    catch (error) {
        console.error('Crypto tracker start error:', error);
        res.status(500).json({
            error: 'Failed to start crypto tracker',
            details: error.message
        });
    }
});
router.post('/stop', async (req, res) => {
    try {
        await cryptoTrackerService_1.default.stop();
        res.json({
            message: '📊 Crypto tracker service stopped',
            status: 'stopped'
        });
        console.log('📊 Crypto tracker stopped via API');
    }
    catch (error) {
        console.error('Crypto tracker stop error:', error);
        res.status(500).json({
            error: 'Failed to stop crypto tracker',
            details: error.message
        });
    }
});
router.get('/status', (req, res) => {
    try {
        const isRunning = cryptoTrackerService_1.default.isServiceRunning();
        const trackedCoins = cryptoTrackerService_1.default.getTrackedCoins();
        res.json({
            message: 'Crypto tracker status',
            status: isRunning ? 'running' : 'stopped',
            tracked_coins: trackedCoins,
            coins_count: trackedCoins.length
        });
    }
    catch (error) {
        console.error('Crypto tracker status error:', error);
        res.status(500).json({
            error: 'Failed to get tracker status',
            details: error.message
        });
    }
});
router.get('/prices/:symbol?', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await cryptoTrackerService_1.default.getPriceData(symbol);
        if (symbol) {
            res.json({
                message: `Price data for ${symbol.toUpperCase()}`,
                symbol: symbol.toUpperCase(),
                data
            });
        }
        else {
            res.json({
                message: 'All cryptocurrency prices',
                count: Array.isArray(data) ? data.length : 1,
                data
            });
        }
    }
    catch (error) {
        console.error('Price data error:', error);
        res.status(404).json({
            error: error.message,
            details: 'Price data not available'
        });
    }
});
router.post('/alerts', async (req, res) => {
    try {
        const { userId, symbol, alertType, targetValue } = req.body;
        if (!userId || !symbol || !alertType || targetValue === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['userId', 'symbol', 'alertType', 'targetValue']
            });
        }
        if (!['above', 'below', 'percent_change'].includes(alertType)) {
            return res.status(400).json({
                error: 'Invalid alert type',
                allowed: ['above', 'below', 'percent_change']
            });
        }
        const alertId = await cryptoTrackerService_1.default.addPriceAlert(userId, symbol, alertType, parseFloat(targetValue));
        res.json({
            message: `🔔 Price alert created for ${symbol.toUpperCase()}`,
            alert_id: alertId,
            symbol: symbol.toUpperCase(),
            alert_type: alertType,
            target_value: parseFloat(targetValue)
        });
        console.log(`🔔 Created price alert: ${symbol.toUpperCase()} ${alertType} $${targetValue}`);
    }
    catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({
            error: 'Failed to create price alert',
            details: error.message
        });
    }
});
router.delete('/alerts/:alertId', async (req, res) => {
    try {
        const { alertId } = req.params;
        const success = await cryptoTrackerService_1.default.removePriceAlert(alertId);
        if (success) {
            res.json({
                message: '🔔 Price alert removed successfully',
                alert_id: alertId,
                status: 'removed'
            });
        }
        else {
            res.status(404).json({
                error: 'Price alert not found',
                alert_id: alertId
            });
        }
    }
    catch (error) {
        console.error('Remove alert error:', error);
        res.status(500).json({
            error: 'Failed to remove price alert',
            details: error.message
        });
    }
});
router.get('/alerts/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const alerts = cryptoTrackerService_1.default.getUserAlerts(userId);
        res.json({
            message: 'User price alerts',
            user_id: userId,
            alerts,
            count: alerts.length
        });
    }
    catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            error: 'Failed to get user alerts',
            details: error.message
        });
    }
});
router.get('/trends', async (req, res) => {
    try {
        const trends = await cryptoTrackerService_1.default.getMarketTrends();
        res.json({
            message: 'Market trends analysis',
            trends,
            count: trends.length,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Market trends error:', error);
        res.status(500).json({
            error: 'Failed to get market trends',
            details: error.message
        });
    }
});
router.get('/movers', async (req, res) => {
    try {
        const { gainers, losers } = await cryptoTrackerService_1.default.getTopMovers();
        res.json({
            message: 'Top market movers',
            data: {
                gainers,
                losers
            },
            gainers_count: gainers.length,
            losers_count: losers.length
        });
    }
    catch (error) {
        console.error('Top movers error:', error);
        res.status(500).json({
            error: 'Failed to get top movers',
            details: error.message
        });
    }
});
router.get('/coins', (req, res) => {
    try {
        const trackedCoins = cryptoTrackerService_1.default.getTrackedCoins();
        res.json({
            message: 'Currently tracked cryptocurrencies',
            coins: trackedCoins,
            count: trackedCoins.length
        });
    }
    catch (error) {
        console.error('Tracked coins error:', error);
        res.status(500).json({
            error: 'Failed to get tracked coins',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=cryptoTrackerRoutes.js.map