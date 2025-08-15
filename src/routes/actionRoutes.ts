import express, { Request, Response } from 'express';

const router = express.Router();

// Endpoints for actions - left unimplemented until you wire the action controller
router.get('/list', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Action listing not implemented. Wire your actionController.' });
});

router.post('/trigger', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Action trigger not implemented. Wire your actionController.' });
});

router.get('/:actionName/status', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Action status not implemented.' });
});

router.post('/:actionName/toggle', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Action toggle not implemented.' });
});

export default router;
