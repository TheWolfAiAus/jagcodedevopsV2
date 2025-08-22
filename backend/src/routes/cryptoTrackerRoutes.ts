import { Router, Request, Response } from 'express';
import cryptoTrackerService from '../services/cryptoTrackerService';

const router = Router();

// Start crypto tracker service
router.post('/start', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            cryptoTrackerService.setCurrentUser(userId);
        }

        await cryptoTrackerService.start();

        res.json({
            message: '📊 Crypto tracker service started',
            status: 'running',
            tracked_coins: cryptoTrackerService.getTrackedCoins().length
        });

        console.log('📊 Crypto tracker started via API');
    } catch (error: any) {
        console.error('Crypto tracker start error:', error);
        res.status(500).json({
            error: 'Failed to start crypto tracker',
            details: error.message
        });
    }
});

// Stop crypto tracker service
router.post('/stop', async (req: Request, res: Response) => {
    try {
        await cryptoTrackerService.stop();

        res.json({
            message: '📊 Crypto tracker service stopped',
            status: 'stopped'
        });

        console.log('📊 Crypto tracker stopped via API');
    } catch (error: any) {
        console.error('Crypto tracker stop error:', error);
        res.status(500).json({
            error: 'Failed to stop crypto tracker',
            details: error.message
        });
    }
});

// Get service status
router.get('/status', (req: Request, res: Response) => {
    try {
        const isRunning = cryptoTrackerService.isServiceRunning();
        const trackedCoins = cryptoTrackerService.getTrackedCoins();

        res.json({
            message: 'Crypto tracker status',
            status: isRunning ? 'running' : 'stopped',
            tracked_coins: trackedCoins,
            coins_count: trackedCoins.length
        });
    } catch (error: any) {
        console.error('Crypto tracker status error:', error);
        res.status(500).json({
            error: 'Failed to get tracker status',
            details: error.message
        });
    }
});

// Get all price data or specific coin
router.get('/prices/:symbol?', async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const data = await cryptoTrackerService.getPriceData(symbol);

        if (symbol) {
            res.json({
                message: `Price data for ${symbol.toUpperCase()}`,
                symbol: symbol.toUpperCase(),
                data
            });
        } else {
            res.json({
                message: 'All cryptocurrency prices',
                count: Array.isArray(data) ? data.length : 1,
                data
            });
        }
    } catch (error: any) {
        console.error('Price data error:', error);
        res.status(404).json({
            error: error.message,
            details: 'Price data not available'
        });
    }
});

// Create price alert
router.post('/alerts', async (req: Request, res: Response) => {
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

        const alertId = await cryptoTrackerService.addPriceAlert(
            userId, 
            symbol, 
            alertType, 
            parseFloat(targetValue)
        );

        res.json({
            message: `🔔 Price alert created for ${symbol.toUpperCase()}`,
            alert_id: alertId,
            symbol: symbol.toUpperCase(),
            alert_type: alertType,
            target_value: parseFloat(targetValue)
        });

        console.log(`🔔 Created price alert: ${symbol.toUpperCase()} ${alertType} $${targetValue}`);
    } catch (error: any) {
        console.error('Create alert error:', error);
        res.status(500).json({
            error: 'Failed to create price alert',
            details: error.message
        });
    }
});

// Remove price alert
router.delete('/alerts/:alertId', async (req: Request, res: Response) => {
    try {
        const { alertId } = req.params;
        const success = await cryptoTrackerService.removePriceAlert(alertId);

        if (success) {
            res.json({
                message: '🔔 Price alert removed successfully',
                alert_id: alertId,
                status: 'removed'
            });
        } else {
            res.status(404).json({
                error: 'Price alert not found',
                alert_id: alertId
            });
        }
    } catch (error: any) {
        console.error('Remove alert error:', error);
        res.status(500).json({
            error: 'Failed to remove price alert',
            details: error.message
        });
    }
});

// Get user's price alerts
router.get('/alerts/:userId', (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const alerts = cryptoTrackerService.getUserAlerts(userId);

        res.json({
            message: 'User price alerts',
            user_id: userId,
            alerts,
            count: alerts.length
        });
    } catch (error: any) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            error: 'Failed to get user alerts',
            details: error.message
        });
    }
});

// Get market trends analysis
router.get('/trends', async (req: Request, res: Response) => {
    try {
        const trends = await cryptoTrackerService.getMarketTrends();

        res.json({
            message: 'Market trends analysis',
            trends,
            count: trends.length,
            generated_at: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Market trends error:', error);
        res.status(500).json({
            error: 'Failed to get market trends',
            details: error.message
        });
    }
});

// Get top movers (gainers and losers)
router.get('/movers', async (req: Request, res: Response) => {
    try {
        const { gainers, losers } = await cryptoTrackerService.getTopMovers();

        res.json({
            message: 'Top market movers',
            data: {
                gainers,
                losers
            },
            gainers_count: gainers.length,
            losers_count: losers.length
        });
    } catch (error: any) {
        console.error('Top movers error:', error);
        res.status(500).json({
            error: 'Failed to get top movers',
            details: error.message
        });
    }
});

// Get tracked coins list
router.get('/coins', (req: Request, res: Response) => {
    try {
        const trackedCoins = cryptoTrackerService.getTrackedCoins();

        res.json({
            message: 'Currently tracked cryptocurrencies',
            coins: trackedCoins,
            count: trackedCoins.length
        });
    } catch (error: any) {
        console.error('Tracked coins error:', error);
        res.status(500).json({
            error: 'Failed to get tracked coins',
            details: error.message
        });
    }
});

export default router;