<<<<<<< HEAD
import {Router} from 'express';
import {runResearch} from '../controllers/wolfController';
import {authenticateToken} from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all wolf routes
router.use(authenticateToken);

// Define a route for initiating research
router.post('/research', runResearch);

export default router;
