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
