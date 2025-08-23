import {Request, Response, Router} from 'express';
import {AppwriteService} from '../services/appwriteService';

const router = Router();

// Middleware to handle CORS for Webflow domains
router.use((req, res, next) => {
  const allowedOrigins = [
    'https://jagecodedevops.webflow.io',
    'https://www.jagcodedevops.xyz',
    'https://jagcodedevops.xyz',
    'http://localhost:3000', // For development
  ];
  
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Appwrite-Project, X-Appwrite-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'webflow-integration',
    timestamp: new Date().toISOString(),
    domains: {
      webflow: 'jagecodedevops.webflow.io',
      production: 'jagcodedevops.xyz'
    }
  });
});

// User authentication endpoints
router.post('/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    const user = await AppwriteService.createUser(email, password, name);
    res.status(201).json({ 
      success: true, 
      user: {
        id: user.$id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create user',
      code: error.code || 'SIGNUP_FAILED'
    });
  }
});

router.post('/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const session = await AppwriteService.signIn(email, password);
    res.json({ 
      success: true, 
      session: {
        userId: session.userId,
        expire: session.expire
      }
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(401).json({ 
      error: error.message || 'Failed to sign in',
      code: error.code || 'SIGNIN_FAILED'
    });
  }
});

router.post('/auth/signout', async (req: Request, res: Response) => {
  try {
    await AppwriteService.signOut();
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error: any) {
    console.error('Signout error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to sign out',
      code: error.code || 'SIGNOUT_FAILED'
    });
  }
});

router.get('/auth/user', async (req: Request, res: Response) => {
  try {
    const user = await AppwriteService.getCurrentUser();
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(401).json({ 
      error: error.message || 'Failed to get user',
      code: error.code || 'USER_NOT_FOUND'
    });
  }
});

// Portfolio endpoints
router.get('/portfolio/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolio = await AppwriteService.getPortfolio(userId);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    res.json({ success: true, portfolio });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get portfolio',
      code: error.code || 'PORTFOLIO_ERROR'
    });
  }
});

router.put('/portfolio/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolioData = req.body;
    
    const updatedPortfolio = await AppwriteService.updatePortfolio(userId, portfolioData);
    res.json({ success: true, portfolio: updatedPortfolio });
  } catch (error: any) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update portfolio',
      code: error.code || 'PORTFOLIO_UPDATE_ERROR'
    });
  }
});

// Transaction endpoints
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await AppwriteService.getTransactions(userId, limit);
    res.json({ success: true, transactions, count: transactions.length });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get transactions',
      code: error.code || 'TRANSACTIONS_ERROR'
    });
  }
});

router.post('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const transactionData = req.body;
    
    const transaction = await AppwriteService.addTransaction(userId, transactionData);
    res.status(201).json({ success: true, transaction });
  } catch (error: any) {
    console.error('Add transaction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to add transaction',
      code: error.code || 'TRANSACTION_ADD_ERROR'
    });
  }
});

// Wallet integration
router.post('/wallet/link/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    await AppwriteService.linkWallet(userId, walletAddress);
    res.json({ success: true, message: 'Wallet linked successfully' });
  } catch (error: any) {
    console.error('Link wallet error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to link wallet',
      code: error.code || 'WALLET_LINK_ERROR'
    });
  }
});

// Sync with existing backend
router.post('/sync/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const execution = await AppwriteService.syncWithSupabase(userId);
    
    res.json({ 
      success: true, 
      message: 'Sync initiated',
      executionId: execution?.$id 
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to sync data',
      code: error.code || 'SYNC_ERROR'
    });
  }
});

export default router;
