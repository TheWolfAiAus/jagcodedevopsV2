import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/list', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Mini-app listing not implemented.' });
});

export default router;
