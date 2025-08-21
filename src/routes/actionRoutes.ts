<<<<<<< HEAD
import {Router} from 'express';
import {getActionStatus, listActions, toggleAction, triggerAction} from '../controllers/actionController';
import {authenticateToken} from '../middleware/authMiddleware';

const router = Router ();

// Apply authentication middleware to all action routes
router.use (authenticateToken);

// Define routes for action management
router.get ('/list', listActions);
router.post ('/trigger', triggerAction);
router.get ('/:actionName/status', getActionStatus);
router.post ('/:actionName/toggle', toggleAction);

export default router;
=======
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
>>>>>>> 4c1bae1a92ab915d3d9790805b2885428143b1c8
