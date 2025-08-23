import {Request, Response, Router} from 'express';
import {AutomationEngine} from '../services/automationEngine';

const router = Router();

// Global automation engine instance
let automationEngine: AutomationEngine | null = null;

export function setAutomationEngine(engine: AutomationEngine) {
    automationEngine = engine;
}

router.post('/start', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        // Start all operations in background
        automationEngine.startAllOperations();

        res.json({
            message: '🚀 ALL SYSTEMS ACTIVATED! JAG-OPS is now generating profits!',
            status: 'success',
            operations_starting: true
        });
    } catch (error: any) {
        console.error('Error starting operations:', error);
        res.status(500).json({ error: `Failed to start operations: ${error.message}` });
    }
});

router.post('/stop', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        await automationEngine.stopAllOperations();

        res.json({
            message: '🛑 All operations stopped',
            status: 'success'
        });
    } catch (error: any) {
        console.error('Error stopping operations:', error);
        res.status(500).json({ error: `Failed to stop operations: ${error.message}` });
    }
});

router.post('/emergency-stop', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        await automationEngine.emergencyStop();

        res.json({
            message: '🚨 Emergency stop activated - All operations halted',
            status: 'emergency_stopped'
        });
    } catch (error: any) {
        console.error('Error during emergency stop:', error);
        res.status(500).json({ error: `Emergency stop failed: ${error.message}` });
    }
});

router.get('/status', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        const status = await automationEngine.getStatus();
        res.json(status);
    } catch (error: any) {
        console.error('Error getting system status:', error);
        res.status(500).json({ error: `Failed to get status: ${error.message}` });
    }
});

router.get('/profit-report', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        const report = await automationEngine.getProfitReport();
        res.json(report);
    } catch (error: any) {
        console.error('Error generating profit report:', error);
        res.status(500).json({ error: `Failed to generate profit report: ${error.message}` });
    }
});

router.post('/optimize', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        // Start optimization in background
        automationEngine.optimizeOperations();

        res.json({
            message: '🎯 Optimization started - Maximizing profits!',
            status: 'optimizing'
        });
    } catch (error: any) {
        console.error('Error starting optimization:', error);
        res.status(500).json({ error: `Failed to start optimization: ${error.message}` });
    }
});

router.post('/transfer-profits', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        // Start profit transfer in background
        automationEngine.transferProfitsToExodus();

        res.json({
            message: '💸 Profit transfer initiated to Exodus wallet',
            status: 'transferring'
        });
    } catch (error: any) {
        console.error('Error initiating profit transfer:', error);
        res.status(500).json({ error: `Failed to transfer profits: ${error.message}` });
    }
});

router.post('/execute-strategy', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.status(500).json({ error: 'Automation engine not initialized' });
        }

        // Execute profit strategy in background
        automationEngine.executeProfitStrategy();

        res.json({
            message: '💰 Profit strategy execution started',
            status: 'executing'
        });
    } catch (error: any) {
        console.error('Error executing profit strategy:', error);
        res.status(500).json({ error: `Failed to execute strategy: ${error.message}` });
    }
});

router.get('/health', async (req: Request, res: Response) => {
    try {
        if (!automationEngine) {
            return res.json({
                status: 'unhealthy',
                message: 'Automation engine not initialized'
            });
        }

        const engineStatus = automationEngine.isRunning();

        res.json({
            status: engineStatus ? 'healthy' : 'inactive',
            engine_running: engineStatus,
            message: engineStatus ? 'JAG-OPS Backend is operational' : 'JAG-OPS Backend is inactive'
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        res.json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

export default router;