import express, {Request, Response} from 'express';

const router = express.Router();

// Get wolf pack information
router.get('/pack', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Wolf pack routes - coming soon' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
