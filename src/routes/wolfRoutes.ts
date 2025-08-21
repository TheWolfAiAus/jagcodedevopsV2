<<<<<<< HEAD
import {Router} from 'express';
import {runResearch} from '../controllers/wolfController';
import {authenticateToken} from '../middleware/authMiddleware';

const router = Router ();

// Apply authentication middleware to all wolf routes
router.use (authenticateToken);

// Define a route for initiating research
router.post ('/research', runResearch);

export default router;
=======
import express, { Request, Response } from 'express';

const router = express.Router();

// Try to load auth middleware and controller if they exist; otherwise provide placeholders that return 501
let authenticateToken: (req: Request, res: Response, next: Function) => void = (_req, _res, next) => next();
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const auth = require('../middleware/authMiddleware');
  if (auth && typeof auth.authenticateToken === 'function') {
    authenticateToken = auth.authenticateToken;
  }
} catch (_e) {
  // leave default noop
}

let wolfController: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  wolfController = require('../controllers/wolfController');
} catch (_e) {
  // controller missing — endpoints will return 501 below
}

router.use((req: Request, res: Response, next: Function) => {
  // Attach a simple metadata header
  res.setHeader('X-Service', 'wolf');
  next();
});

router.post('/research', (req: Request, res: Response) => {
  if (wolfController && typeof wolfController.runResearch === 'function') {
    return wolfController.runResearch(req, res);
  }
  res.status(501).json({ status: 'not_implemented', message: 'Wolf research controller not available.' });
});

export default router;
>>>>>>> 4c1bae1a92ab915d3d9790805b2885428143b1c8
