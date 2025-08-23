"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appwrite_1 = require("appwrite");
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const client = new appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');
const databases = new appwrite_1.Databases(client);
const storage = new appwrite_1.Storage(client);
router.get('/profile', async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const userProfile = await databases.listDocuments('users', 'userId = ' + req.user.id);
        if (!userProfile.documents.length) {
            throw (0, errorHandler_1.createError)('User profile not found', 404);
        }
        res.json(userProfile.documents[0]);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user profile',
            error: error.message
        });
    }
});
router.put('/profile', async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { name, phone, bio, avatar } = req.body;
        const userProfile = await databases.listDocuments('users', 'userId = ' + req.user.id);
        if (!userProfile.documents.length) {
            throw (0, errorHandler_1.createError)('User profile not found', 404);
        }
        const profile = userProfile.documents[0];
        const updatedProfile = await databases.updateDocument('users', profile.$id, {
            name: name || profile.name,
            phone: phone || profile.phone,
            bio: bio || profile.bio,
            avatar: avatar || profile.avatar,
            updatedAt: new Date().toISOString()
        });
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error updating user profile',
            error: error.message
        });
    }
});
router.get('/dashboard', async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const dashboardData = {
            totalPortfolioValue: 0,
            cryptoHoldings: [],
            nftCollection: [],
            recentTransactions: [],
            portfolioChange24h: 0
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error('Error fetching user dashboard:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user dashboard',
            error: error.message
        });
    }
});
router.get('/settings', async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
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
    }
    catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error fetching user settings',
            error: error.message
        });
    }
});
router.put('/settings', async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { notifications, privacy, security } = req.body;
        const updatedSettings = {
            notifications: notifications || {},
            privacy: privacy || {},
            security: security || {},
            updatedAt: new Date().toISOString()
        };
        res.json(updatedSettings);
    }
    catch (error) {
        console.error('Error updating user settings:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error updating user settings',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map