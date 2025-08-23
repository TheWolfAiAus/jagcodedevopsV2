"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const databaseService_1 = __importDefault(require("../services/databaseService"));
const cryptoUtils_1 = __importDefault(require("../services/cryptoUtils"));
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, wallet_address } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({
                error: 'Email, username, and password are required'
            });
        }
        const existingUser = await databaseService_1.default.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                error: 'User with this email already exists'
            });
        }
        const newUser = await databaseService_1.default.registerUser({
            email,
            username,
            password,
            wallet_address
        });
        await databaseService_1.default.logActivity(newUser.id, {
            type: 'login',
            description: 'User registered successfully'
        });
        await databaseService_1.default.updateUserSettings(newUser.id, {
            auto_mining: false,
            nft_hunting: true,
            profit_threshold: 0.01,
            notification_settings: {
                email: true,
                push: true,
                sms: false
            }
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                wallet_addresses: newUser.wallet_addresses,
                created_at: newUser.created_at
            }
        });
        console.log(`🎯 New user registered: ${username} (${email})`);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register user',
            details: error.message
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }
        const user = await databaseService_1.default.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }
        const isValidPassword = cryptoUtils_1.default.verifyAPIKey(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }
        await databaseService_1.default.logActivity(user.id, {
            type: 'login',
            description: 'User logged in successfully'
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                wallet_addresses: user.wallet_addresses,
                preferences: user.preferences,
                stats: user.stats
            }
        });
        console.log(`🔐 User logged in: ${user.username}`);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Failed to login',
            details: error.message
        });
    }
});
router.get('/:userId/dashboard', async (req, res) => {
    try {
        const { userId } = req.params;
        const dashboard = await databaseService_1.default.getUserDashboard(userId);
        res.json({
            message: 'Dashboard data retrieved',
            dashboard
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            error: 'Failed to get dashboard data',
            details: error.message
        });
    }
});
router.put('/:userId/settings', async (req, res) => {
    try {
        const { userId } = req.params;
        const settings = req.body;
        await databaseService_1.default.updateUserSettings(userId, settings);
        await databaseService_1.default.logActivity(userId, {
            type: 'system_alert',
            description: 'User settings updated',
            metadata: settings
        });
        res.json({
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({
            error: 'Failed to update settings',
            details: error.message
        });
    }
});
router.post('/:userId/portfolio', async (req, res) => {
    try {
        const { userId } = req.params;
        const portfolioData = req.body;
        if (!portfolioData.asset_type || !portfolioData.symbol || !portfolioData.amount) {
            return res.status(400).json({
                error: 'asset_type, symbol, and amount are required'
            });
        }
        const portfolioId = await databaseService_1.default.registerPortfolioItem(userId, portfolioData);
        res.status(201).json({
            message: 'Portfolio item added successfully',
            portfolio_id: portfolioId
        });
    }
    catch (error) {
        console.error('Portfolio addition error:', error);
        res.status(500).json({
            error: 'Failed to add portfolio item',
            details: error.message
        });
    }
});
router.post('/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;
        const transactionData = req.body;
        if (!transactionData.type || !transactionData.asset_symbol || !transactionData.amount) {
            return res.status(400).json({
                error: 'type, asset_symbol, and amount are required'
            });
        }
        const transactionId = await databaseService_1.default.registerTransaction(userId, transactionData);
        res.status(201).json({
            message: 'Transaction recorded successfully',
            transaction_id: transactionId
        });
    }
    catch (error) {
        console.error('Transaction recording error:', error);
        res.status(500).json({
            error: 'Failed to record transaction',
            details: error.message
        });
    }
});
router.post('/:userId/mining-session', async (req, res) => {
    try {
        const { userId } = req.params;
        const sessionData = req.body;
        if (!sessionData.currency || !sessionData.hash_rate || !sessionData.duration_minutes) {
            return res.status(400).json({
                error: 'currency, hash_rate, and duration_minutes are required'
            });
        }
        await databaseService_1.default.registerMiningSession(userId, sessionData);
        res.status(201).json({
            message: 'Mining session recorded successfully'
        });
        console.log(`⛏️ Mining session recorded: ${sessionData.currency} for ${sessionData.duration_minutes}min`);
    }
    catch (error) {
        console.error('Mining session error:', error);
        res.status(500).json({
            error: 'Failed to record mining session',
            details: error.message
        });
    }
});
router.post('/:userId/nft-opportunity', async (req, res) => {
    try {
        const { userId } = req.params;
        const opportunityData = req.body;
        if (!opportunityData.contract_address || !opportunityData.collection_name) {
            return res.status(400).json({
                error: 'contract_address and collection_name are required'
            });
        }
        await databaseService_1.default.registerNFTOpportunity(userId, opportunityData);
        res.status(201).json({
            message: 'NFT opportunity recorded successfully'
        });
        console.log(`🎨 NFT opportunity recorded: ${opportunityData.collection_name}`);
    }
    catch (error) {
        console.error('NFT opportunity error:', error);
        res.status(500).json({
            error: 'Failed to record NFT opportunity',
            details: error.message
        });
    }
});
router.get('/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        res.json({
            message: `Activity log for user ${userId} (limit: ${limit})`,
        });
    }
    catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({
            error: 'Failed to get activity log',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=userManagementRoutes.js.map