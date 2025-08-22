import { Router, Request, Response } from 'express';
import cryptoMinerService from '../services/cryptoMinerService';

const router = Router();

// Get mining status
router.get('/status', async (req: Request, res: Response) => {
    try {
        const status = await cryptoMinerService.getMiningStatus();

        res.json({
            message: '⛏️ Mining status retrieved',
            status: status.isRunning ? 'active' : 'inactive',
            data: status
        });
    } catch (error: any) {
        console.error('Mining status error:', error);
        res.status(500).json({
            error: 'Failed to get mining status',
            details: error.message
        });
    }
});

// Start mining for all coins
router.post('/start', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            cryptoMinerService.setCurrentUser(userId);
        }

        await cryptoMinerService.start();

        res.json({
            message: '⛏️ Crypto mining started for all coins!',
            status: 'started',
            supported_coins: cryptoMinerService.getSupportedCoins()
        });

        console.log('🚀 Crypto mining started via API');
    } catch (error: any) {
        console.error('Mining start error:', error);
        res.status(500).json({
            error: 'Failed to start mining',
            details: error.message
        });
    }
});

// Stop all mining operations
router.post('/stop', async (req: Request, res: Response) => {
    try {
        await cryptoMinerService.stop();

        res.json({
            message: '🛑 All mining operations stopped',
            status: 'stopped'
        });

        console.log('🛑 Crypto mining stopped via API');
    } catch (error: any) {
        console.error('Mining stop error:', error);
        res.status(500).json({
            error: 'Failed to stop mining',
            details: error.message
        });
    }
});

// Start mining for specific coin
router.post('/start/:coin', async (req: Request, res: Response) => {
    try {
        const { coin } = req.params;
        const { userId } = req.body;

        if (userId) {
            cryptoMinerService.setCurrentUser(userId);
        }

        const success = await cryptoMinerService.startMiningCoin(coin);

        if (success) {
            res.json({
                message: `⛏️ Started mining ${coin.toUpperCase()}`,
                status: 'started',
                coin: coin.toUpperCase()
            });

            console.log(`🚀 Started mining ${coin.toUpperCase()} via API`);
        } else {
            res.status(400).json({
                error: `Failed to start mining ${coin.toUpperCase()}`,
                details: 'Coin may not be supported or already mining'
            });
        }
    } catch (error: any) {
        console.error(`Mining start error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to start mining ${req.params.coin}`,
            details: error.message
        });
    }
});

// Stop mining for specific coin
router.post('/stop/:coin', async (req: Request, res: Response) => {
    try {
        const { coin } = req.params;

        const success = await cryptoMinerService.stopMiningCoin(coin);

        if (success) {
            res.json({
                message: `🛑 Stopped mining ${coin.toUpperCase()}`,
                status: 'stopped',
                coin: coin.toUpperCase()
            });

            console.log(`🛑 Stopped mining ${coin.toUpperCase()} via API`);
        } else {
            res.status(400).json({
                error: `Failed to stop mining ${coin.toUpperCase()}`,
                details: 'Coin may not be currently mining'
            });
        }
    } catch (error: any) {
        console.error(`Mining stop error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to stop mining ${req.params.coin}`,
            details: error.message
        });
    }
});

// Get supported coins
router.get('/supported', (req: Request, res: Response) => {
    try {
        const supportedCoins = cryptoMinerService.getSupportedCoins();

        res.json({
            message: 'Supported mining coins retrieved',
            supported_coins: supportedCoins,
            count: supportedCoins.length
        });
    } catch (error: any) {
        console.error('Supported coins error:', error);
        res.status(500).json({
            error: 'Failed to get supported coins',
            details: error.message
        });
    }
});

// Get mining stats for specific coin
router.get('/stats/:coin', async (req: Request, res: Response) => {
    try {
        const { coin } = req.params;
        const status = await cryptoMinerService.getMiningStatus();
        
        const coinStats = status.miners.find(m => m.coin === coin.toUpperCase());
        
        if (coinStats) {
            res.json({
                message: `Mining stats for ${coin.toUpperCase()} retrieved`,
                coin: coin.toUpperCase(),
                stats: coinStats
            });
        } else {
            res.status(404).json({
                error: `No mining stats found for ${coin.toUpperCase()}`,
                details: 'Coin is not currently being mined'
            });
        }
    } catch (error: any) {
        console.error(`Mining stats error for ${req.params.coin}:`, error);
        res.status(500).json({
            error: `Failed to get mining stats for ${req.params.coin}`,
            details: error.message
        });
    }
});

export default router;