import { Client, Databases, Users, Storage } from 'node-appwrite';

// Appwrite Function Entry Point
export default async ({ req, res, log, error }: any) => {
  // Initialize Appwrite client with function context
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
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
  } catch (err: any) {
    error(`Function error: ${err.message}`);
    return res.json({ error: 'Internal server error' }, 500);
  }
};

// Crypto price handler
async function handleCryptoPrices(req: any, res: any, { databases, log, error }: any) {
  try {
    // Fetch from CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
    const data = await response.json();

    // Store in Appwrite database
    await databases.createDocument(
      'jagcode_main',
      'crypto_data',
      'unique()',
      {
        bitcoin_price: (data as any).bitcoin?.usd || 0,
        ethereum_price: (data as any).ethereum?.usd || 0,
        solana_price: (data as any).solana?.usd || 0,
        last_updated: new Date().toISOString()
      }
    );

    return res.json(data);
  } catch (err: any) {
    error(`Crypto prices error: ${err.message}`);
    return res.json({ error: 'Failed to fetch crypto prices' }, 500);
  }
}

// NFT search handler
async function handleNFTSearch(req: any, res: any, { databases, log, error }: any) {
  try {
    const { query: searchQuery } = req.query;
    
    // Search OpenSea API
    const response = await fetch(`https://api.opensea.io/api/v1/assets?search=${searchQuery}&limit=20`, {
      headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY || ''
      }
    });
    
    const data = await response.json();
    
    log(`NFT search for "${searchQuery}" returned ${(data as any).assets?.length || 0} results`);
    
    return res.json(data);
  } catch (err: any) {
    error(`NFT search error: ${err.message}`);
    return res.json({ error: 'Failed to search NFTs' }, 500);
  }
}

// Wallet balance handler
async function handleWalletBalance(req: any, res: any, { databases, log, error }: any) {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.json({ error: 'Wallet address required' }, 400);
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
  } catch (err: any) {
    error(`Wallet balance error: ${err.message}`);
    return res.json({ error: 'Failed to fetch wallet balance' }, 500);
  }
}

// User profile handler
async function handleUserProfile(req: any, res: any, { databases, users, log, error }: any) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.json({ error: 'User ID required' }, 400);
    }

    // Get user from Appwrite
    const user = await users.get(userId);
    
    // Get user profile from database
    const profile = await databases.getDocument(
      'jagcode_main',
      'users',
      userId
    );

    return res.json({
      ...user,
      profile
    });
  } catch (err: any) {
    error(`User profile error: ${err.message}`);
    return res.json({ error: 'Failed to fetch user profile' }, 500);
  }
}

// Helper functions
async function fetchEthBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`);
    const data = await response.json();
    return parseFloat((data as any).result || '0') / 1e18; // Convert from wei to ETH
  } catch {
    return 0;
  }
}

async function fetchBtcBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
    const data = await response.json();
    return ((data as any).balance || 0) / 1e8; // Convert from satoshi to BTC
  } catch {
    return 0;
  }
}
