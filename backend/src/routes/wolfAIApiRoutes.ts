import express, {Request, Response} from 'express';

const router = express.Router();

// Wolf AI API endpoint
router.get('/ai', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Wolf AI API routes - coming soon' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
