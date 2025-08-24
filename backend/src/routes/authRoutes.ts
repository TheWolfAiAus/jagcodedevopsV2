import {Account, Client, Databases, Query} from 'appwrite';
import bcrypt from 'bcryptjs';
import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {createError} from '../middleware/errorHandler';

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057')
    .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_JAGCODE_API || '');

const account = new Account(client);
const databases = new Databases(client);

// User registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            throw createError('Email, password, and name are required', 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw createError('Invalid email format', 400);
        }

        // Validate password strength
        if (password.length < 8) {
            throw createError('Password must be at least 8 characters long', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user in Appwrite
        const user = await account.create(
            'unique()',
            email,
            password,
            name
        );

        // Create user profile in database
        const userProfile = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID || '68a3b34a00375e270b14',
            '68a3b34a00375e270b15',
            'unique()',
            {
                userId: user.$id,
                email,
                name,
                phone: phone || null,
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.$id,
                email: user.email,
                role: 'user'
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.$id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.code === 409) {
            res.status(409).json({
                message: 'User with this email already exists'
            });
        } else {
            res.status(error.statusCode || 500).json({
                message: 'Error registering user',
                error: error.message
            });
        }
    }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw createError('Email and password are required', 400);
        }

        // Create email session with Appwrite
        const session = await account.createEmailSession(email, password);

        // Get user details
        const user = await account.get();

        // Get user profile from database
        const userProfile = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || '68a3b34a00375e270b14',
            '68a3b34a00375e270b15',
            [Query.equal('userId', user.$id)]
        );

        if (!userProfile.documents.length) {
            throw createError('User profile not found', 404);
        }

        const profile = userProfile.documents[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.$id,
                email: user.email,
                role: profile.role
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

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
    } catch (error: any) {
        console.error('Login error:', error);

        if (error.code === 401) {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        } else {
            res.status(error.statusCode || 500).json({
                message: 'Error during login',
                error: error.message
            });
        }
    }
});

// User logout
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (sessionId) {
            // Delete specific session
            await account.deleteSession(sessionId);
        } else {
            // Delete current session
            await account.deleteSessions();
        }

        res.json({ message: 'Logout successful' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error during logout',
            error: error.message
        });
    }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            throw createError('Token is required', 400);
        }

        // Verify current token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

        // Generate new token
        const newToken = jwt.sign(
            {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Token refreshed successfully',
            token: newToken
        });
    } catch (error: any) {
        console.error('Token refresh error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error refreshing token',
            error: error.message
        });
    }
});

// Forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw createError('Email is required', 400);
        }

        // Send password reset email via Appwrite
        await account.createRecovery(
            email,
            `${process.env.FRONTEND_URL}/reset-password`
        );

        res.json({
            message: 'Password reset email sent successfully'
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error sending password reset email',
            error: error.message
        });
    }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { userId, secret, password } = req.body;

        if (!userId || !secret || !password) {
            throw createError('User ID, secret, and new password are required', 400);
        }

        // Update password via Appwrite
        await account.updateRecovery(
            userId,
            secret,
            password,
            password
        );

        res.json({
            message: 'Password reset successfully'
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(error.statusCode || 500).json({
            message: 'Error resetting password',
            error: error.message
        });
    }
});

export default router;
