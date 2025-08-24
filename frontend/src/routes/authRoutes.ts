import express, {Request, Response} from 'express';

const router = express.Router();

// NOTE: Authentication should be implemented using a secure store (DB) and JWTs/sessions.
// The original file contained hardcoded users; per your instruction to avoid mock data, this endpoint returns 501 until you integrate your auth provider.
router.post('/login', (req: Request, res: Response) => {
  res.status(501).json({ message: 'Authentication not implemented. Please integrate your auth provider or database.' });
});

export default router;
