import express, { Request, Response } from 'express';

const router = express.Router();

// Get user actions
router.get('/', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Action routes - coming soon' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
