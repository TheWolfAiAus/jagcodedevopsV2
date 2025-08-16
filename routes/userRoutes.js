const express = require('express');
const router = express.Router();

// Placeholder for user dashboard configurations
const userConfigs = [
    {userId: 1, dashboard: {layout: 'default', widgets: []}},
    {userId: 2, dashboard: {layout: 'default', widgets: []}},
    {userId: 3, dashboard: {layout: 'default', widgets: []}},
    {userId: 4, dashboard: {layout: 'default', widgets: []}},
    {userId: 5, dashboard: {layout: 'default', widgets: []}},
];

// Get user dashboard configuration
router.get('/:userId/dashboard', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userConfig = userConfigs.find(config => config.userId === userId);

    if (userConfig) {
        res.json(userConfig.dashboard);
    } else {
        res.status(404).json({message: 'User configuration not found'});
    }
});

// Save user dashboard configuration
router.post('/:userId/dashboard', (req, res) => {
    const userId = parseInt(req.params.userId);
    const dashboardData = req.body;

    const userConfig = userConfigs.find(config => config.userId === userId);

    if (userConfig) {
        // In a real application, you would save this to a database
        userConfig.dashboard = dashboardData;
        res.json({message: 'Dashboard configuration saved successfully'});
    } else {
        res.status(404).json({message: 'User configuration not found'});
    }
});

module.exports = router;