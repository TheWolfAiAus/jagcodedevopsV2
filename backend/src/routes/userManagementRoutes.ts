import {Request, Response, Router} from 'express';
import databaseService from '../services/databaseService';
import CryptoUtils from '../services/cryptoUtils';

const router = Router();

// User Registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, username, password, wallet_address } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ 
                error: 'Email, username, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await databaseService.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Register user in database
        const newUser = await databaseService.registerUser({
            email,
            username,
            password,
            wallet_address
        });

        // Log registration activity
        await databaseService.logActivity(newUser.id, {
            type: 'login',
            description: 'User registered successfully'
        });

        // Create default settings
        await databaseService.updateUserSettings(newUser.id, {
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
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Failed to register user',
            details: error.message 
        });
    }
});

// User Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Get user from database
        const user = await databaseService.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Verify password
        const isValidPassword = CryptoUtils.verifyAPIKey(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Log login activity
        await databaseService.logActivity(user.id, {
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
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Failed to login',
            details: error.message 
        });
    }
});

// Get User Dashboard
router.get('/:userId/dashboard', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const dashboard = await databaseService.getUserDashboard(userId);

        res.json({
            message: 'Dashboard data retrieved',
            dashboard
        });
    } catch (error: any) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            error: 'Failed to get dashboard data',
            details: error.message 
        });
    }
});

// Update User Settings
router.put('/:userId/settings', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const settings = req.body;

        await databaseService.updateUserSettings(userId, settings);

        // Log settings update
        await databaseService.logActivity(userId, {
            type: 'system_alert',
            description: 'User settings updated',
            metadata: settings
        });

        res.json({
            message: 'Settings updated successfully'
        });
    } catch (error: any) {
        console.error('Settings update error:', error);
        res.status(500).json({ 
            error: 'Failed to update settings',
            details: error.message 
        });
    }
});

// Add Portfolio Item
router.post('/:userId/portfolio', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const portfolioData = req.body;

        if (!portfolioData.asset_type || !portfolioData.symbol || !portfolioData.amount) {
            return res.status(400).json({ 
                error: 'asset_type, symbol, and amount are required' 
            });
        }

        const portfolioId = await databaseService.registerPortfolioItem(userId, portfolioData);

        res.status(201).json({
            message: 'Portfolio item added successfully',
            portfolio_id: portfolioId
        });
    } catch (error: any) {
        console.error('Portfolio addition error:', error);
        res.status(500).json({ 
            error: 'Failed to add portfolio item',
            details: error.message 
        });
    }
});

// Record Transaction
router.post('/:userId/transactions', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const transactionData = req.body;

        if (!transactionData.type || !transactionData.asset_symbol || !transactionData.amount) {
            return res.status(400).json({ 
                error: 'type, asset_symbol, and amount are required' 
            });
        }

        const transactionId = await databaseService.registerTransaction(userId, transactionData);

        res.status(201).json({
            message: 'Transaction recorded successfully',
            transaction_id: transactionId
        });
    } catch (error: any) {
        console.error('Transaction recording error:', error);
        res.status(500).json({ 
            error: 'Failed to record transaction',
            details: error.message 
        });
    }
});

// Record Mining Session
router.post('/:userId/mining-session', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sessionData = req.body;

        if (!sessionData.currency || !sessionData.hash_rate || !sessionData.duration_minutes) {
            return res.status(400).json({ 
                error: 'currency, hash_rate, and duration_minutes are required' 
            });
        }

        await databaseService.registerMiningSession(userId, sessionData);

        res.status(201).json({
            message: 'Mining session recorded successfully'
        });

        console.log(`⛏️ Mining session recorded: ${sessionData.currency} for ${sessionData.duration_minutes}min`);
    } catch (error: any) {
        console.error('Mining session error:', error);
        res.status(500).json({ 
            error: 'Failed to record mining session',
            details: error.message 
        });
    }
});

// Record NFT Opportunity
router.post('/:userId/nft-opportunity', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const opportunityData = req.body;

        if (!opportunityData.contract_address || !opportunityData.collection_name) {
            return res.status(400).json({ 
                error: 'contract_address and collection_name are required' 
            });
        }

        await databaseService.registerNFTOpportunity(userId, opportunityData);

        res.status(201).json({
            message: 'NFT opportunity recorded successfully'
        });

        console.log(`🎨 NFT opportunity recorded: ${opportunityData.collection_name}`);
    } catch (error: any) {
        console.error('NFT opportunity error:', error);
        res.status(500).json({ 
            error: 'Failed to record NFT opportunity',
            details: error.message 
        });
    }
});

// Get User Activity Log
router.get('/:userId/activity', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        // This would need to be implemented in databaseService
        // For now, just return a success message
        res.json({
            message: `Activity log for user ${userId} (limit: ${limit})`,
            // activities: activities
        });
    } catch (error: any) {
        console.error('Activity log error:', error);
        res.status(500).json({ 
            error: 'Failed to get activity log',
            details: error.message 
        });
    }
});

export default router;