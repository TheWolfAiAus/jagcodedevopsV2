"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNftHunterService = setNftHunterService;
const express_1 = require("express");
const router = (0, express_1.Router)();
let nftHunterService = null;
function setNftHunterService(service) {
    nftHunterService = service;
}
router.get('/opportunities', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        const limit = parseInt(req.query.limit) || 20;
        const opportunities = await nftHunterService.getTopOpportunities(limit);
        res.json({
            opportunities,
            count: opportunities.length,
            status: 'success'
        });
    }
    catch (error) {
        console.error('Error getting NFT opportunities:', error);
        res.status(500).json({ error: `Failed to get opportunities: ${error.message}` });
    }
});
router.get('/status', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        res.json({
            is_running: nftHunterService.isRunning(),
            sources: [],
            status: nftHunterService.isRunning() ? 'active' : 'inactive'
        });
    }
    catch (error) {
        console.error('Error getting NFT hunter status:', error);
        res.status(500).json({ error: `Failed to get status: ${error.message}` });
    }
});
router.post('/start', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        await nftHunterService.start();
        res.json({
            message: '🎨 NFT Hunter started - Hunting for free NFTs!',
            status: 'started'
        });
    }
    catch (error) {
        console.error('Error starting NFT hunter:', error);
        res.status(500).json({ error: `Failed to start NFT hunter: ${error.message}` });
    }
});
router.post('/stop', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        await nftHunterService.stop();
        res.json({
            message: '🛑 NFT Hunter stopped',
            status: 'stopped'
        });
    }
    catch (error) {
        console.error('Error stopping NFT hunter:', error);
        res.status(500).json({ error: `Failed to stop NFT hunter: ${error.message}` });
    }
});
router.get('/opportunities/top', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        const limit = parseInt(req.query.limit) || 5;
        const opportunities = await nftHunterService.getTopOpportunities(limit);
        const topOpportunities = opportunities.filter((opp) => (opp.score || 0) >= 8.0);
        res.json({
            top_opportunities: topOpportunities,
            count: topOpportunities.length,
            message: `Found ${topOpportunities.length} premium opportunities`
        });
    }
    catch (error) {
        console.error('Error getting top opportunities:', error);
        res.status(500).json({ error: `Failed to get top opportunities: ${error.message}` });
    }
});
router.get('/stats', async (req, res) => {
    try {
        if (!nftHunterService) {
            return res.status(500).json({ error: 'NFT Hunter service not available' });
        }
        const allOpportunities = await nftHunterService.getTopOpportunities(1000);
        if (allOpportunities.length === 0) {
            return res.json({
                total_discovered: 0,
                average_score: 0,
                sources_active: 0,
                high_value_count: 0
            });
        }
        const totalDiscovered = allOpportunities.length;
        const averageScore = allOpportunities.reduce((sum, opp) => sum + (opp.score || 0), 0) / totalDiscovered;
        const highValueCount = allOpportunities.filter((opp) => (opp.score || 0) >= 8.0).length;
        const sources = Array.from(new Set(allOpportunities.map((opp) => opp.source || '')));
        res.json({
            total_discovered: totalDiscovered,
            average_score: Math.round(averageScore * 100) / 100,
            sources_active: sources.length,
            high_value_count: highValueCount,
            sources: sources,
            is_hunting: nftHunterService.isRunning()
        });
    }
    catch (error) {
        console.error('Error getting NFT stats:', error);
        res.status(500).json({ error: `Failed to get stats: ${error.message}` });
    }
});
exports.default = router;
//# sourceMappingURL=nftHunterRoutes.js.map