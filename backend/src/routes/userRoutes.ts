import {Client, Databases, Storage} from 'appwrite';
import express, {Response} from 'express';
import {AuthRequest} from '../middleware/authMiddleware';
import {createError} from '../middleware/errorHandler';

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');

const databases = new Databases(client);
const storage = new Storage(client);

// Get user profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            throw createError('User not authenticated', 401);
        }

        // Get user profile from Appwrite
        const userProfile = await databases.listDocuments(
            'users',
            'userId = ' + req.user.id
        );

        if (!userProfile.documents.length) {
            throw createError('User profile not found', 404);
        }

        res.json(userProfile.documents[0]);
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user profile',
            error: error.message
        });
    }
});

// Update user profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            throw createError('User not authenticated', 401);
        }

        const { name, phone, bio, avatar } = req.body;

        // Get current profile
        const userProfile = await databases.listDocuments(
            'users',
            'userId = ' + req.user.id
        );

        if (!userProfile.documents.length) {
            throw createError('User profile not found', 404);
        }

        const profile = userProfile.documents[0];

        // Update profile
        const updatedProfile = await databases.updateDocument(
            'users',
            profile.$id,
            {
                name: name || profile.name,
                phone: phone || profile.phone,
                bio: bio || profile.bio,
                avatar: avatar || profile.avatar,
                updatedAt: new Date().toISOString()
            }
        );

        res.json(updatedProfile);
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error updating user profile',
            error: error.message
        });
    }
});

// Get user dashboard data
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            throw createError('User not authenticated', 401);
        }

        // TODO: Fetch user's crypto portfolio, NFT collection, etc.
        const dashboardData = {
            totalPortfolioValue: 0,
            cryptoHoldings: [],
            nftCollection: [],
            recentTransactions: [],
            portfolioChange24h: 0
        };

        res.json(dashboardData);
    } catch (error: any) {
        console.error('Error fetching user dashboard:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user dashboard',
            error: error.message
        });
    }
});

// Get user settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            throw createError('User not authenticated', 401);
        }

        // TODO: Fetch user settings from Appwrite
        const settings = {
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            privacy: {
                profileVisibility: 'public',
                portfolioVisibility: 'private'
            },
            security: {
                twoFactorEnabled: false,
                loginNotifications: true
            }
        };

        res.json(settings);
    } catch (error: any) {
        console.error('Error fetching user settings:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user settings',
            error: error.message
        });
    }
});

// Update user settings
router.put('/settings', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            throw createError('User not authenticated', 401);
        }

        const { notifications, privacy, security } = req.body;

        // TODO: Update user settings in Appwrite
        const updatedSettings = {
            notifications: notifications || {},
            privacy: privacy || {},
            security: security || {},
            updatedAt: new Date().toISOString()
        };

        res.json(updatedSettings);
    } catch (error: any) {
        console.error('Error updating user settings:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error updating user settings',
            error: error.message
        });
    }
});

export default router;
