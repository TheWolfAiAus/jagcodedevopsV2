import {Request, Response, Router} from 'express';
import realTimeWalletService from '../services/realTimeWalletService';
import defiAnalyzerService from '../services/defiAnalyzerService';

const router = Router();

// Real-Time Wallet Monitoring Routes

// Start wallet monitoring
router.post('/monitoring/start', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            realTimeWalletService.setCurrentUser(userId);
        }

        await realTimeWalletService.startMonitoring();

        res.json({
            message: 'Real-time wallet monitoring started',
            status: 'monitoring',
            update_interval: '10 seconds'
        });

        console.log('🔄 Real-time wallet monitoring started');
    } catch (error: any) {
        console.error('Wallet monitoring start error:', error);
        res.status(500).json({
            error: 'Failed to start wallet monitoring',
            details: error.message
        });
    }
});

// Stop wallet monitoring
router.post('/monitoring/stop', async (req: Request, res: Response) => {
    try {
        await realTimeWalletService.stopMonitoring();

        res.json({
            message: 'Real-time wallet monitoring stopped',
            status: 'stopped'
        });

        console.log('⏹️ Real-time wallet monitoring stopped');
    } catch (error: any) {
        console.error('Wallet monitoring stop error:', error);
        res.status(500).json({
            error: 'Failed to stop wallet monitoring',
            details: error.message
        });
    }
});

// Add wallet to monitoring
router.post('/monitoring/add', async (req: Request, res: Response) => {
    try {
        const { address, userId } = req.body;

        if (!address) {
            return res.status(400).json({ 
                error: 'Wallet address is required' 
            });
        }

        if (userId) {
            realTimeWalletService.setCurrentUser(userId);
        }

        await realTimeWalletService.addWalletToMonitor(address);

        res.json({
            message: `Wallet ${address} added to real-time monitoring`,
            address,
            status: 'monitoring'
        });

        console.log(`📊 Added wallet to monitoring: ${address}`);
    } catch (error: any) {
        console.error('Add wallet error:', error);
        res.status(500).json({
            error: 'Failed to add wallet to monitoring',
            details: error.message
        });
    }
});

// Remove wallet from monitoring
router.post('/monitoring/remove', async (req: Request, res: Response) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ 
                error: 'Wallet address is required' 
            });
        }

        await realTimeWalletService.removeWalletFromMonitor(address);

        res.json({
            message: `Wallet ${address} removed from monitoring`,
            address,
            status: 'removed'
        });

        console.log(`❌ Removed wallet from monitoring: ${address}`);
    } catch (error: any) {
        console.error('Remove wallet error:', error);
        res.status(500).json({
            error: 'Failed to remove wallet from monitoring',
            details: error.message
        });
    }
});

// Get real-time wallet data
router.get('/data/:address', async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        const walletData = await realTimeWalletService.getWalletSnapshot(address);

        res.json({
            message: 'Real-time wallet data retrieved',
            data: walletData
        });
    } catch (error: any) {
        console.error('Wallet data retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve wallet data',
            details: error.message
        });
    }
});

// Get portfolio summary for multiple wallets
router.post('/portfolio/summary', async (req: Request, res: Response) => {
    try {
        const { addresses } = req.body;

        if (!addresses || !Array.isArray(addresses)) {
            return res.status(400).json({ 
                error: 'Addresses array is required' 
            });
        }

        const summary = await realTimeWalletService.getPortfolioSummary(addresses);

        res.json({
            message: 'Portfolio summary generated',
            summary,
            wallets_analyzed: addresses.length
        });
    } catch (error: any) {
        console.error('Portfolio summary error:', error);
        res.status(500).json({
            error: 'Failed to generate portfolio summary',
            details: error.message
        });
    }
});

// Detect large transactions
router.get('/transactions/large/:address', async (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        const { threshold = 10000 } = req.query;

        const largeTransactions = await realTimeWalletService.detectLargeTransactions(
            address, 
            Number(threshold)
        );

        res.json({
            message: `Large transactions detected (>${threshold} USD)`,
            transactions: largeTransactions,
            count: largeTransactions.length,
            threshold_usd: Number(threshold)
        });
    } catch (error: any) {
        console.error('Large transaction detection error:', error);
        res.status(500).json({
            error: 'Failed to detect large transactions',
            details: error.message
        });
    }
});

// Get monitored wallets list
router.get('/monitoring/list', (req: Request, res: Response) => {
    try {
        const monitoredWallets = realTimeWalletService.getMonitoredWallets();

        res.json({
            message: 'Currently monitored wallets',
            wallets: monitoredWallets,
            count: monitoredWallets.length
        });
    } catch (error: any) {
        console.error('Monitored wallets list error:', error);
        res.status(500).json({
            error: 'Failed to get monitored wallets list',
            details: error.message
        });
    }
});

// Update monitoring interval
router.put('/monitoring/interval', (req: Request, res: Response) => {
    try {
        const { intervalMs } = req.body;

        if (!intervalMs || intervalMs < 5000) {
            return res.status(400).json({ 
                error: 'Interval must be at least 5000ms (5 seconds)' 
            });
        }

        realTimeWalletService.setUpdateInterval(intervalMs);

        res.json({
            message: 'Monitoring interval updated',
            interval_ms: intervalMs,
            interval_seconds: intervalMs / 1000
        });
    } catch (error: any) {
        console.error('Interval update error:', error);
        res.status(500).json({
            error: 'Failed to update monitoring interval',
            details: error.message
        });
    }
});

// DeFi Analyzer Routes

// Start DeFi analysis
router.post('/defi/analysis/start', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            defiAnalyzerService.setCurrentUser(userId);
        }

        await defiAnalyzerService.startAnalysis();

        res.json({
            message: 'DeFi analysis started',
            status: 'analyzing',
            analysis_interval: '30 seconds'
        });

        console.log('🔍 DeFi analysis started');
    } catch (error: any) {
        console.error('DeFi analysis start error:', error);
        res.status(500).json({
            error: 'Failed to start DeFi analysis',
            details: error.message
        });
    }
});

// Stop DeFi analysis
router.post('/defi/analysis/stop', async (req: Request, res: Response) => {
    try {
        await defiAnalyzerService.stopAnalysis();

        res.json({
            message: 'DeFi analysis stopped',
            status: 'stopped'
        });

        console.log('⏹️ DeFi analysis stopped');
    } catch (error: any) {
        console.error('DeFi analysis stop error:', error);
        res.status(500).json({
            error: 'Failed to stop DeFi analysis',
            details: error.message
        });
    }
});

// Get yield opportunities
router.get('/defi/yield', async (req: Request, res: Response) => {
    try {
        const { minAPY = 0 } = req.query;

        const opportunities = await defiAnalyzerService.getYieldOpportunities(Number(minAPY));

        res.json({
            message: 'Yield opportunities retrieved',
            opportunities,
            count: opportunities.length,
            min_apy_filter: Number(minAPY)
        });
    } catch (error: any) {
        console.error('Yield opportunities error:', error);
        res.status(500).json({
            error: 'Failed to get yield opportunities',
            details: error.message
        });
    }
});

// Get arbitrage opportunities
router.get('/defi/arbitrage', async (req: Request, res: Response) => {
    try {
        const { minProfit = 0 } = req.query;

        const opportunities = await defiAnalyzerService.getArbitrageOpportunities(Number(minProfit));

        res.json({
            message: 'Arbitrage opportunities retrieved',
            opportunities,
            count: opportunities.length,
            min_profit_filter: Number(minProfit)
        });
    } catch (error: any) {
        console.error('Arbitrage opportunities error:', error);
        res.status(500).json({
            error: 'Failed to get arbitrage opportunities',
            details: error.message
        });
    }
});

// Get best yield opportunity
router.get('/defi/yield/best', async (req: Request, res: Response) => {
    try {
        const { riskTolerance = 10 } = req.query;

        const bestOpportunity = await defiAnalyzerService.getBestYieldOpportunity(Number(riskTolerance));

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
    } catch (error: any) {
        console.error('Best yield opportunity error:', error);
        res.status(500).json({
            error: 'Failed to get best yield opportunity',
            details: error.message
        });
    }
});

// Get protocol rankings
router.get('/defi/protocols/rankings', async (req: Request, res: Response) => {
    try {
        const rankings = await defiAnalyzerService.getProtocolRankings();

        res.json({
            message: 'Protocol rankings retrieved',
            rankings,
            count: rankings.length
        });
    } catch (error: any) {
        console.error('Protocol rankings error:', error);
        res.status(500).json({
            error: 'Failed to get protocol rankings',
            details: error.message
        });
    }
});

// Simulate yield strategy
router.post('/defi/simulate', async (req: Request, res: Response) => {
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

        const simulation = await defiAnalyzerService.simulateYieldStrategy(
            Number(amount), 
            Number(duration), 
            riskLevel
        );

        res.json({
            message: 'Yield strategy simulation completed',
            simulation,
            input: {
                amount: Number(amount),
                duration_days: Number(duration),
                risk_level: riskLevel
            }
        });
    } catch (error: any) {
        console.error('Yield simulation error:', error);
        res.status(500).json({
            error: 'Failed to simulate yield strategy',
            details: error.message
        });
    }
});

// Update DeFi analysis interval
router.put('/defi/analysis/interval', (req: Request, res: Response) => {
    try {
        const { intervalMs } = req.body;

        if (!intervalMs || intervalMs < 10000) {
            return res.status(400).json({ 
                error: 'Interval must be at least 10000ms (10 seconds)' 
            });
        }

        defiAnalyzerService.setAnalysisInterval(intervalMs);

        res.json({
            message: 'DeFi analysis interval updated',
            interval_ms: intervalMs,
            interval_seconds: intervalMs / 1000
        });
    } catch (error: any) {
        console.error('DeFi interval update error:', error);
        res.status(500).json({
            error: 'Failed to update DeFi analysis interval',
            details: error.message
        });
    }
});

export default router;