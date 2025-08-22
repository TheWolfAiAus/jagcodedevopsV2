import express, {Request, Response} from 'express';

const router = express.Router();

// Webflow form webhook
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Webflow webhook routes - coming soon' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
