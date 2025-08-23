"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const realTimeWalletService_1 = __importDefault(require("../services/realTimeWalletService"));
const defiAnalyzerService_1 = __importDefault(require("../services/defiAnalyzerService"));
const router = (0, express_1.Router)();
router.post('/monitoring/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            realTimeWalletService_1.default.setCurrentUser(userId);
        }
        await realTimeWalletService_1.default.startMonitoring();
        res.json({
            message: 'Real-time wallet monitoring started',
            status: 'monitoring',
            update_interval: '10 seconds'
        });
        console.log('🔄 Real-time wallet monitoring started');
    }
    catch (error) {
        console.error('Wallet monitoring start error:', error);
        res.status(500).json({
            error: 'Failed to start wallet monitoring',
            details: error.message
        });
    }
});
router.post('/monitoring/stop', async (req, res) => {
    try {
        await realTimeWalletService_1.default.stopMonitoring();
        res.json({
            message: 'Real-time wallet monitoring stopped',
            status: 'stopped'
        });
        console.log('⏹️ Real-time wallet monitoring stopped');
    }
    catch (error) {
        console.error('Wallet monitoring stop error:', error);
        res.status(500).json({
            error: 'Failed to stop wallet monitoring',
            details: error.message
        });
    }
});
router.post('/monitoring/add', async (req, res) => {
    try {
        const { address, userId } = req.body;
        if (!address) {
            return res.status(400).json({
                error: 'Wallet address is required'
            });
        }
        if (userId) {
            realTimeWalletService_1.default.setCurrentUser(userId);
        }
        await realTimeWalletService_1.default.addWalletToMonitor(address);
        res.json({
            message: `Wallet ${address} added to real-time monitoring`,
            address,
            status: 'monitoring'
        });
        console.log(`📊 Added wallet to monitoring: ${address}`);
    }
    catch (error) {
        console.error('Add wallet error:', error);
        res.status(500).json({
            error: 'Failed to add wallet to monitoring',
            details: error.message
        });
    }
});
router.post('/monitoring/remove', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({
                error: 'Wallet address is required'
            });
        }
        await realTimeWalletService_1.default.removeWalletFromMonitor(address);
        res.json({
            message: `Wallet ${address} removed from monitoring`,
            address,
            status: 'removed'
        });
        console.log(`❌ Removed wallet from monitoring: ${address}`);
    }
    catch (error) {
        console.error('Remove wallet error:', error);
        res.status(500).json({
            error: 'Failed to remove wallet from monitoring',
            details: error.message
        });
    }
});
router.get('/data/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const walletData = await realTimeWalletService_1.default.getWalletSnapshot(address);
        res.json({
            message: 'Real-time wallet data retrieved',
            data: walletData
        });
    }
    catch (error) {
        console.error('Wallet data retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve wallet data',
            details: error.message
        });
    }
});
router.post('/portfolio/summary', async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!addresses || !Array.isArray(addresses)) {
            return res.status(400).json({
                error: 'Addresses array is required'
            });
        }
        const summary = await realTimeWalletService_1.default.getPortfolioSummary(addresses);
        res.json({
            message: 'Portfolio summary generated',
            summary,
            wallets_analyzed: addresses.length
        });
    }
    catch (error) {
        console.error('Portfolio summary error:', error);
        res.status(500).json({
            error: 'Failed to generate portfolio summary',
            details: error.message
        });
    }
});
router.get('/transactions/large/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { threshold = 10000 } = req.query;
        const largeTransactions = await realTimeWalletService_1.default.detectLargeTransactions(address, Number(threshold));
        res.json({
            message: `Large transactions detected (>${threshold} USD)`,
            transactions: largeTransactions,
            count: largeTransactions.length,
            threshold_usd: Number(threshold)
        });
    }
    catch (error) {
        console.error('Large transaction detection error:', error);
        res.status(500).json({
            error: 'Failed to detect large transactions',
            details: error.message
        });
    }
});
router.get('/monitoring/list', (req, res) => {
    try {
        const monitoredWallets = realTimeWalletService_1.default.getMonitoredWallets();
        res.json({
            message: 'Currently monitored wallets',
            wallets: monitoredWallets,
            count: monitoredWallets.length
        });
    }
    catch (error) {
        console.error('Monitored wallets list error:', error);
        res.status(500).json({
            error: 'Failed to get monitored wallets list',
            details: error.message
        });
    }
});
router.put('/monitoring/interval', (req, res) => {
    try {
        const { intervalMs } = req.body;
        if (!intervalMs || intervalMs < 5000) {
            return res.status(400).json({
                error: 'Interval must be at least 5000ms (5 seconds)'
            });
        }
        realTimeWalletService_1.default.setUpdateInterval(intervalMs);
        res.json({
            message: 'Monitoring interval updated',
            interval_ms: intervalMs,
            interval_seconds: intervalMs / 1000
        });
    }
    catch (error) {
        console.error('Interval update error:', error);
        res.status(500).json({
            error: 'Failed to update monitoring interval',
            details: error.message
        });
    }
});
router.post('/defi/analysis/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            defiAnalyzerService_1.default.setCurrentUser(userId);
        }
        await defiAnalyzerService_1.default.startAnalysis();
        res.json({
            message: 'DeFi analysis started',
            status: 'analyzing',
            analysis_interval: '30 seconds'
        });
        console.log('🔍 DeFi analysis started');
    }
    catch (error) {
        console.error('DeFi analysis start error:', error);
        res.status(500).json({
            error: 'Failed to start DeFi analysis',
            details: error.message
        });
    }
});
router.post('/defi/analysis/stop', async (req, res) => {
    try {
        await defiAnalyzerService_1.default.stopAnalysis();
        res.json({
            message: 'DeFi analysis stopped',
            status: 'stopped'
        });
        console.log('⏹️ DeFi analysis stopped');
    }
    catch (error) {
        console.error('DeFi analysis stop error:', error);
        res.status(500).json({
            error: 'Failed to stop DeFi analysis',
            details: error.message
        });
    }
});
router.get('/defi/yield', async (req, res) => {
    try {
        const { minAPY = 0 } = req.query;
        const opportunities = await defiAnalyzerService_1.default.getYieldOpportunities(Number(minAPY));
        res.json({
            message: 'Yield opportunities retrieved',
            opportunities,
            count: opportunities.length,
            min_apy_filter: Number(minAPY)
        });
    }
    catch (error) {
        console.error('Yield opportunities error:', error);
        res.status(500).json({
            error: 'Failed to get yield opportunities',
            details: error.message
        });
    }
});
router.get('/defi/arbitrage', async (req, res) => {
    try {
        const { minProfit = 0 } = req.query;
        const opportunities = await defiAnalyzerService_1.default.getArbitrageOpportunities(Number(minProfit));
        res.json({
            message: 'Arbitrage opportunities retrieved',
            opportunities,
            count: opportunities.length,
            min_profit_filter: Number(minProfit)
        });
    }
    catch (error) {
        console.error('Arbitrage opportunities error:', error);
        res.status(500).json({
            error: 'Failed to get arbitrage opportunities',
            details: error.message
        });
    }
});
router.get('/defi/yield/best', async (req, res) => {
    try {
        const { riskTolerance = 10 } = req.query;
        const bestOpportunity = await defiAnalyzerService_1.default.getBestYieldOpportunity(Number(riskTolerance));
        if (!bestOpportunity) {
            return res.json({
                message: 'No suitable yield opportunities found',
                opportunity: null,
                risk_tolerance: Number(riskTolerance)
            });
        }
        res.json({
            message: 'Best yield opportunity found',
            opportunity: bestOpportunity,
            risk_tolerance: Number(riskTolerance)
        });
    }
    catch (error) {
        console.error('Best yield opportunity error:', error);
        res.status(500).json({
            error: 'Failed to get best yield opportunity',
            details: error.message
        });
    }
});
router.get('/defi/protocols/rankings', async (req, res) => {
    try {
        const rankings = await defiAnalyzerService_1.default.getProtocolRankings();
        res.json({
            message: 'Protocol rankings retrieved',
            rankings,
            count: rankings.length
        });
    }
    catch (error) {
        console.error('Protocol rankings error:', error);
        res.status(500).json({
            error: 'Failed to get protocol rankings',
            details: error.message
        });
    }
});
router.post('/defi/simulate', async (req, res) => {
    try {
        const { amount, duration, riskLevel = 'medium' } = req.body;
        if (!amount || !duration) {
            return res.status(400).json({
                error: 'Amount and duration are required'
            });
        }
        if (!['low', 'medium', 'high'].includes(riskLevel)) {
            return res.status(400).json({
                error: 'Risk level must be low, medium, or high'
            });
        }
        const simulation = await defiAnalyzerService_1.default.simulateYieldStrategy(Number(amount), Number(duration), riskLevel);
        res.json({
            message: 'Yield strategy simulation completed',
            simulation,
            input: {
                amount: Number(amount),
                duration_days: Number(duration),
                risk_level: riskLevel
            }
        });
    }
    catch (error) {
        console.error('Yield simulation error:', error);
        res.status(500).json({
            error: 'Failed to simulate yield strategy',
            details: error.message
        });
    }
});
router.put('/defi/analysis/interval', (req, res) => {
    try {
        const { intervalMs } = req.body;
        if (!intervalMs || intervalMs < 10000) {
            return res.status(400).json({
                error: 'Interval must be at least 10000ms (10 seconds)'
            });
        }
        defiAnalyzerService_1.default.setAnalysisInterval(intervalMs);
        res.json({
            message: 'DeFi analysis interval updated',
            interval_ms: intervalMs,
            interval_seconds: intervalMs / 1000
        });
    }
    catch (error) {
        console.error('DeFi interval update error:', error);
        res.status(500).json({
            error: 'Failed to update DeFi analysis interval',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map