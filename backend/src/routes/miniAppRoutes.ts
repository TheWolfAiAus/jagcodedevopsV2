import express, { Request, Response } from 'express';

const router = express.Router();

// Mini app routes
router.get('/', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Mini app routes - coming soon' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
