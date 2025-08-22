import { Router, Request, Response } from 'express';
import componentManagerService from '../services/componentManagerService';

const router = Router();

// Start component manager
router.post('/manager/start', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            componentManagerService.setCurrentUser(userId);
        }

        await componentManagerService.start();

        res.json({
            message: '🔧 Component manager started',
            status: 'running',
            system_metrics: componentManagerService.getSystemMetrics()
        });

        console.log('🔧 Component manager started via API');
    } catch (error: any) {
        console.error('Component manager start error:', error);
        res.status(500).json({
            error: 'Failed to start component manager',
            details: error.message
        });
    }
});

// Stop component manager
router.post('/manager/stop', async (req: Request, res: Response) => {
    try {
        await componentManagerService.stop();

        res.json({
            message: '🔧 Component manager stopped',
            status: 'stopped'
        });

        console.log('🔧 Component manager stopped via API');
    } catch (error: any) {
        console.error('Component manager stop error:', error);
        res.status(500).json({
            error: 'Failed to stop component manager',
            details: error.message
        });
    }
});

// Get system metrics and status
router.get('/system/metrics', (req: Request, res: Response) => {
    try {
        const metrics = componentManagerService.getSystemMetrics();
        const isHealthy = componentManagerService.isSystemHealthy();
        const isRunning = componentManagerService.isServiceRunning();

        res.json({
            message: 'System metrics retrieved',
            system_status: {
                running: isRunning,
                healthy: isHealthy,
                metrics
            }
        });
    } catch (error: any) {
        console.error('System metrics error:', error);
        res.status(500).json({
            error: 'Failed to get system metrics',
            details: error.message
        });
    }
});

// Get all components status
router.get('/status', (req: Request, res: Response) => {
    try {
        const components = componentManagerService.getAllComponents();

        res.json({
            message: 'All components status',
            components,
            count: components.length,
            system_healthy: componentManagerService.isSystemHealthy()
        });
    } catch (error: any) {
        console.error('Components status error:', error);
        res.status(500).json({
            error: 'Failed to get components status',
            details: error.message
        });
    }
});

// Get specific component status
router.get('/status/:name', (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const component = componentManagerService.getComponentStatus(name);

        if (component) {
            res.json({
                message: `Component status for ${name}`,
                component
            });
        } else {
            res.status(404).json({
                error: 'Component not found',
                component_name: name
            });
        }
    } catch (error: any) {
        console.error('Component status error:', error);
        res.status(500).json({
            error: 'Failed to get component status',
            details: error.message
        });
    }
});

// Update component status
router.put('/status/:name', async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { status } = req.body;

        if (!['running', 'stopped', 'error'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                allowed: ['running', 'stopped', 'error']
            });
        }

        await componentManagerService.updateComponentStatus(name, status);
        const updatedComponent = componentManagerService.getComponentStatus(name);

        res.json({
            message: `Component ${name} status updated`,
            component: updatedComponent,
            previous_status: status
        });

        console.log(`🔧 Updated ${name} status to: ${status}`);
    } catch (error: any) {
        console.error('Update component status error:', error);
        res.status(500).json({
            error: 'Failed to update component status',
            details: error.message
        });
    }
});

// Restart component
router.post('/restart/:name', async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        
        await componentManagerService.restartComponent(name);

        res.json({
            message: `🔄 Component ${name} restart initiated`,
            component_name: name,
            status: 'restarting'
        });

        console.log(`🔄 Restarting component: ${name}`);
    } catch (error: any) {
        console.error('Restart component error:', error);
        res.status(500).json({
            error: 'Failed to restart component',
            details: error.message
        });
    }
});

// Get components by type
router.get('/type/:type', (req: Request, res: Response) => {
    try {
        const { type } = req.params as { type: 'frontend' | 'backend' | 'service' | 'database' };
        
        if (!['frontend', 'backend', 'service', 'database'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid component type',
                allowed: ['frontend', 'backend', 'service', 'database']
            });
        }

        const components = componentManagerService.getComponentsByType(type);

        res.json({
            message: `${type} components`,
            type,
            components,
            count: components.length
        });
    } catch (error: any) {
        console.error('Components by type error:', error);
        res.status(500).json({
            error: 'Failed to get components by type',
            details: error.message
        });
    }
});

// Get unhealthy components
router.get('/health/unhealthy', (req: Request, res: Response) => {
    try {
        const unhealthyComponents = componentManagerService.getUnhealthyComponents();

        res.json({
            message: 'Unhealthy components',
            components: unhealthyComponents,
            count: unhealthyComponents.length,
            system_healthy: componentManagerService.isSystemHealthy()
        });
    } catch (error: any) {
        console.error('Unhealthy components error:', error);
        res.status(500).json({
            error: 'Failed to get unhealthy components',
            details: error.message
        });
    }
});

// Get system health summary
router.get('/health/summary', (req: Request, res: Response) => {
    try {
        const metrics = componentManagerService.getSystemMetrics();
        const isHealthy = componentManagerService.isSystemHealthy();
        const unhealthyComponents = componentManagerService.getUnhealthyComponents();

        const healthSummary = {
            overall_health: isHealthy ? 'healthy' : 'unhealthy',
            total_components: metrics.totalComponents,
            healthy_components: metrics.healthyComponents,
            unhealthy_components: unhealthyComponents.length,
            error_components: metrics.errorComponents,
            running_components: metrics.runningComponents,
            system_uptime_hours: Math.round(metrics.systemUptime / (1000 * 60 * 60) * 100) / 100,
            issues: unhealthyComponents.map(c => ({
                component: c.name,
                type: c.type,
                status: c.status,
                health: c.health,
                error_count: c.errorCount
            }))
        };

        res.json({
            message: 'System health summary',
            health_summary: healthSummary
        });
    } catch (error: any) {
        console.error('Health summary error:', error);
        res.status(500).json({
            error: 'Failed to get health summary',
            details: error.message
        });
    }
});

export default router;