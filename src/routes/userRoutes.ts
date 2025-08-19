import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/:id', (req: Request, res: Response) => {
  res.status(501).json({ message: 'User retrieval not implemented. Integrate your user DB.' });
});

router.post('/', (req: Request, res: Response) => {
  res.status(501).json({ message: 'User creation not implemented. Integrate your user DB.' });
});

export default router;
