"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appwrite_1 = require("appwrite");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const client = new appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');
const account = new appwrite_1.Account(client);
const databases = new appwrite_1.Databases(client);
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        if (!email || !password || !name) {
            throw (0, errorHandler_1.createError)('Email, password, and name are required', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw (0, errorHandler_1.createError)('Invalid email format', 400);
        }
        if (password.length < 8) {
            throw (0, errorHandler_1.createError)('Password must be at least 8 characters long', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await account.create('unique()', email, password, name);
        const userProfile = await databases.createDocument('users', 'unique()', {
            userId: user.$id,
            email,
            name,
            phone: phone || null,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.$id,
            email: user.email,
            role: 'user'
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.$id,
                email: user.email,
                name: user.name
            },
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === 409) {
            res.status(409).json({
                message: 'User with this email already exists'
            });
        }
        else {
            res.status(error.statusCode || 500).json({
                message: 'Error registering user',
                error: error.message
            });
        }
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Email and password are required', 400);
        }
        const session = await account.createEmailSession(email, password);
        const user = await account.get();
        const userProfile = await databases.listDocuments('users', 'userId = ' + user.$id);
        if (!userProfile.documents.length) {
            throw (0, errorHandler_1.createError)('User profile not found', 404);
        }
        const profile = userProfile.documents[0];
        const token = jsonwebtoken_1.default.sign({
            id: user.$id,
            email: user.email,
            role: profile.role
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            user: {
                id: user.$id,
                email: user.email,
                name: profile.name,
                role: profile.role
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.code === 401) {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        else {
            res.status(error.statusCode || 500).json({
                message: 'Error during login',
                error: error.message
            });
        }
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (sessionId) {
            await account.deleteSession(sessionId);
        }
        else {
            await account.deleteSessions();
        }
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error during logout',
            error: error.message
        });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw (0, errorHandler_1.createError)('Token is required', 400);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const newToken = jsonwebtoken_1.default.sign({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.json({
            message: 'Token refreshed successfully',
            token: newToken
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error refreshing token',
            error: error.message
        });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw (0, errorHandler_1.createError)('Email is required', 400);
        }
        await account.createRecovery(email, `${process.env.FRONTEND_URL}/reset-password`);
        res.json({
            message: 'Password reset email sent successfully'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error sending password reset email',
            error: error.message
        });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { userId, secret, password } = req.body;
        if (!userId || !secret || !password) {
            throw (0, errorHandler_1.createError)('User ID, secret, and new password are required', 400);
        }
        await account.updateRecovery(userId, secret, password, password);
        res.json({
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error resetting password',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map