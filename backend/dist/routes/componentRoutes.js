"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const componentManagerService_1 = __importDefault(require("../services/componentManagerService"));
const router = (0, express_1.Router)();
router.post('/manager/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            componentManagerService_1.default.setCurrentUser(userId);
        }
        await componentManagerService_1.default.start();
        res.json({
            message: '🔧 Component manager started',
            status: 'running',
            system_metrics: componentManagerService_1.default.getSystemMetrics()
        });
        console.log('🔧 Component manager started via API');
    }
    catch (error) {
        console.error('Component manager start error:', error);
        res.status(500).json({
            error: 'Failed to start component manager',
            details: error.message
        });
    }
});
router.post('/manager/stop', async (req, res) => {
    try {
        await componentManagerService_1.default.stop();
        res.json({
            message: '🔧 Component manager stopped',
            status: 'stopped'
        });
        console.log('🔧 Component manager stopped via API');
    }
    catch (error) {
        console.error('Component manager stop error:', error);
        res.status(500).json({
            error: 'Failed to stop component manager',
            details: error.message
        });
    }
});
router.get('/system/metrics', (req, res) => {
    try {
        const metrics = componentManagerService_1.default.getSystemMetrics();
        const isHealthy = componentManagerService_1.default.isSystemHealthy();
        const isRunning = componentManagerService_1.default.isServiceRunning();
        res.json({
            message: 'System metrics retrieved',
            system_status: {
                running: isRunning,
                healthy: isHealthy,
                metrics
            }
        });
    }
    catch (error) {
        console.error('System metrics error:', error);
        res.status(500).json({
            error: 'Failed to get system metrics',
            details: error.message
        });
    }
});
router.get('/status', (req, res) => {
    try {
        const components = componentManagerService_1.default.getAllComponents();
        res.json({
            message: 'All components status',
            components,
            count: components.length,
            system_healthy: componentManagerService_1.default.isSystemHealthy()
        });
    }
    catch (error) {
        console.error('Components status error:', error);
        res.status(500).json({
            error: 'Failed to get components status',
            details: error.message
        });
    }
});
router.get('/status/:name', (req, res) => {
    try {
        const { name } = req.params;
        const component = componentManagerService_1.default.getComponentStatus(name);
        if (component) {
            res.json({
                message: `Component status for ${name}`,
                component
            });
        }
        else {
            res.status(404).json({
                error: 'Component not found',
                component_name: name
            });
        }
    }
    catch (error) {
        console.error('Component status error:', error);
        res.status(500).json({
            error: 'Failed to get component status',
            details: error.message
        });
    }
});
router.put('/status/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { status } = req.body;
        if (!['running', 'stopped', 'error'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                allowed: ['running', 'stopped', 'error']
            });
        }
        await componentManagerService_1.default.updateComponentStatus(name, status);
        const updatedComponent = componentManagerService_1.default.getComponentStatus(name);
        res.json({
            message: `Component ${name} status updated`,
            component: updatedComponent,
            previous_status: status
        });
        console.log(`🔧 Updated ${name} status to: ${status}`);
    }
    catch (error) {
        console.error('Update component status error:', error);
        res.status(500).json({
            error: 'Failed to update component status',
            details: error.message
        });
    }
});
router.post('/restart/:name', async (req, res) => {
    try {
        const { name } = req.params;
        await componentManagerService_1.default.restartComponent(name);
        res.json({
            message: `🔄 Component ${name} restart initiated`,
            component_name: name,
            status: 'restarting'
        });
        console.log(`🔄 Restarting component: ${name}`);
    }
    catch (error) {
        console.error('Restart component error:', error);
        res.status(500).json({
            error: 'Failed to restart component',
            details: error.message
        });
    }
});
router.get('/type/:type', (req, res) => {
    try {
        const { type } = req.params;
        if (!['frontend', 'backend', 'service', 'database'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid component type',
                allowed: ['frontend', 'backend', 'service', 'database']
            });
        }
        const components = componentManagerService_1.default.getComponentsByType(type);
        res.json({
            message: `${type} components`,
            type,
            components,
            count: components.length
        });
    }
    catch (error) {
        console.error('Components by type error:', error);
        res.status(500).json({
            error: 'Failed to get components by type',
            details: error.message
        });
    }
});
router.get('/health/unhealthy', (req, res) => {
    try {
        const unhealthyComponents = componentManagerService_1.default.getUnhealthyComponents();
        res.json({
            message: 'Unhealthy components',
            components: unhealthyComponents,
            count: unhealthyComponents.length,
            system_healthy: componentManagerService_1.default.isSystemHealthy()
        });
    }
    catch (error) {
        console.error('Unhealthy components error:', error);
        res.status(500).json({
            error: 'Failed to get unhealthy components',
            details: error.message
        });
    }
});
router.get('/health/summary', (req, res) => {
    try {
        const metrics = componentManagerService_1.default.getSystemMetrics();
        const isHealthy = componentManagerService_1.default.isSystemHealthy();
        const unhealthyComponents = componentManagerService_1.default.getUnhealthyComponents();
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
    }
    catch (error) {
        console.error('Health summary error:', error);
        res.status(500).json({
            error: 'Failed to get health summary',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=componentRoutes.js.map