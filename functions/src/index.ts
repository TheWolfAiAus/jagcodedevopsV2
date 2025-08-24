import { Client, Databases, Users, Storage } from 'node-appwrite';

// TypeScript interfaces for better type safety
interface AppwriteContext {
  req: {
    path: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body: any;
  };
  res: {
    json: (data: any, status?: number) => any;
  };
  log: (message: string) => void;
  error: (message: string) => void;
}

interface CoinGeckoResponse {
  bitcoin?: { usd: number };
  ethereum?: { usd: number };
  solana?: { usd: number };
}

interface OpenSeaResponse {
  assets?: Array<any>;
}

interface EtherscanResponse {
  result?: string;
}

interface BlockCypherResponse {
  balance?: number;
}

// Appwrite Function Entry Point
export default async ({ req, res, log, error }: AppwriteContext) => {
  // Initialize Appwrite client with function context
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || '68a36f6c002bfc1e6057')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);
  const users = new Users(client);
  const storage = new Storage(client);

  try {
    const { path, method, headers, query, body } = req;
    
    log(`Received ${method} request to ${path}`);

    // Route handler
    switch (path) {
      case '/health':
        return res.json({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      case '/api/crypto/prices':
        return await handleCryptoPrices(req, res, { databases, log, error });

      case '/api/nft/search':
        return await handleNFTSearch(req, res, { databases, log, error });

      case '/api/wallet/balance':
        return await handleWalletBalance(req, res, { databases, log, error });

      case '/api/user/profile':
        return await handleUserProfile(req, res, { databases, users, log, error });

      default:
        return res.json({ error: 'Route not found' }, 404);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error(`Function error: ${errorMessage}`);
    return res.json({ error: 'Internal server error' }, 500);
  }
};

// Crypto price handler
async function handleCryptoPrices(
  req: AppwriteContext['req'], 
  res: AppwriteContext['res'], 
  { databases, log, error }: { databases: Databases; log: (msg: string) => void; error: (msg: string) => void }
) {
  try {
    // Fetch from CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json() as CoinGeckoResponse;

    // Store in Appwrite database
    await databases.createDocument(
      '68a3b34a00375e270b14',
      '68a3b3e2000dcc682c12',
      'unique()',
      {
        bitcoin_price: data.bitcoin?.usd || 0,
        ethereum_price: data.ethereum?.usd || 0,
        solana_price: data.solana?.usd || 0,
        last_updated: new Date().toISOString()
      }
    );

    return res.json(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error(`Crypto prices error: ${errorMessage}`);
    return res.json({ error: 'Failed to fetch crypto prices' }, 500);
  }
}

// NFT search handler
async function handleNFTSearch(
  req: AppwriteContext['req'], 
  res: AppwriteContext['res'], 
  { databases, log, error }: { databases: Databases; log: (msg: string) => void; error: (msg: string) => void }
) {
  try {
    const { query: searchQuery } = req.query;
    
    if (!searchQuery) {
      return res.json({ error: 'Search query is required' }, 400);
    }
    
    // Search OpenSea API with proper URL encoding
    const encodedQuery = encodeURIComponent(searchQuery);
    const response = await fetch(`https://api.opensea.io/api/v1/assets?search=${encodedQuery}&limit=20`, {
      headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }
    
    const data = await response.json() as OpenSeaResponse;
    
    log(`NFT search for "${searchQuery}" returned ${data.assets?.length || 0} results`);
    
    return res.json(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error(`NFT search error: ${errorMessage}`);
    return res.json({ error: 'Failed to search NFTs' }, 500);
  }
}

// Wallet balance handler
async function handleWalletBalance(
  req: AppwriteContext['req'], 
  res: AppwriteContext['res'], 
  { databases, log, error }: { databases: Databases; log: (msg: string) => void; error: (msg: string) => void }
) {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.json({ error: 'Valid wallet address required' }, 400);
    }

    // Validate address format (basic validation)
    if (address.length < 26 || address.length > 62) {
      return res.json({ error: 'Invalid wallet address format' }, 400);
    }

    // Fetch from multiple APIs
    const [ethBalance, btcBalance] = await Promise.all([
      fetchEthBalance(address),
      fetchBtcBalance(address)
    ]);

    const walletData = {
      address,
      eth_balance: ethBalance,
      btc_balance: btcBalance,
      total_usd: 0, // Calculate based on current prices
      last_updated: new Date().toISOString()
    };

    return res.json(walletData);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error(`Wallet balance error: ${errorMessage}`);
    return res.json({ error: 'Failed to fetch wallet balance' }, 500);
  }
}

// User profile handler
async function handleUserProfile(
  req: AppwriteContext['req'], 
  res: AppwriteContext['res'], 
  { databases, users, log, error }: { databases: Databases; users: Users; log: (msg: string) => void; error: (msg: string) => void }
) {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.json({ error: 'Valid User ID required' }, 400);
    }

    // Validate userId format (basic validation)
    if (userId.length < 20 || userId.length > 36) {
      return res.json({ error: 'Invalid User ID format' }, 400);
    }

    // Get user from Appwrite
    const user = await users.get(userId);
    
    // Get user profile from database
    const profile = await databases.getDocument(
      '68a3b34a00375e270b14',
      '68a3b34a00375e270b15',
      userId
    );

    return res.json({
      ...user,
      profile
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error(`User profile error: ${errorMessage}`);
    return res.json({ error: 'Failed to fetch user profile' }, 500);
  }
}

// Helper functions
async function fetchEthBalance(address: string): Promise<number> {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
      throw new Error('Etherscan API key not configured');
    }
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status}`);
    }
    
    const data = await response.json() as EtherscanResponse;
    return parseFloat(data.result || '0') / 1e18; // Convert from wei to ETH
  } catch {
    return 0;
  }
}

async function fetchBtcBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
    
    if (!response.ok) {
      throw new Error(`BlockCypher API error: ${response.status}`);
    }
    
    const data = await response.json() as BlockCypherResponse;
    return (data.balance || 0) / 1e8; // Convert from satoshi to BTC
  } catch {
    return 0;
  }
}
