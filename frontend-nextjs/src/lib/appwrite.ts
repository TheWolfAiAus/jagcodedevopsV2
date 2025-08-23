import { Client, Account, Databases, Storage, Functions, Query } from 'appwrite';

// Appwrite configuration with real endpoints
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database configuration
export const DATABASE_ID = 'jagcode_main';
export const COLLECTIONS = {
  USERS: 'users',
  CRYPTO_DATA: 'crypto_data',
  NFT_COLLECTION: 'nft_collection',
  USER_PORTFOLIOS: 'user_portfolios',
  PRICE_ALERTS: 'price_alerts',
  TRANSACTIONS: 'transactions'
};

// Storage buckets
export const BUCKETS = {
  PROFILE_IMAGES: 'profile_images',
  NFT_IMAGES: 'nft_images',
  DOCUMENTS: 'documents'
};

// Function IDs
export const FUNCTION_IDS = {
  BACKEND_API: 'backend-api',
  CRYPTO_TRACKER: 'crypto-tracker',
  DEFI_ANALYZER: 'defi-analyzer'
};

// Authentication service
export const authService = {
  async createAccount(email: string, password: string, name: string) {
    // Input validation
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    try {
      const response = await account.create('unique()', email, password, name);
      
      // Create user profile in database
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        response.$id,
        {
          email,
          name: name.trim(),
          profileImage: '',
          bio: '',
          portfolioValue: 0,
          isVerified: false,
          createdAt: new Date().toISOString()
        }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await account.deleteSessions();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }
};

// Database service
export const databaseService = {
  async getCryptoData() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.CRYPTO_DATA);
    } catch (error) {
      console.error('Get crypto data error:', error);
      throw error;
    }
  },

  async getUserPortfolio(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_PORTFOLIOS,
        [Query.equal('userId', userId)]
      );
    } catch (error) {
      console.error('Get user portfolio error:', error);
      throw error;
    }
  },

  async createPriceAlert(userId: string, symbol: string, targetPrice: number, condition: string) {
    // Input validation
    if (!userId || !symbol || !targetPrice || !condition) {
      throw new Error('All fields are required for price alert');
    }
    
    if (targetPrice <= 0) {
      throw new Error('Target price must be greater than 0');
    }
    
    if (!['above', 'below'].includes(condition.toLowerCase())) {
      throw new Error('Condition must be "above" or "below"');
    }
    
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PRICE_ALERTS,
        'unique()',
        {
          userId,
          symbol: symbol.toUpperCase().trim(),
          targetPrice,
          condition: condition.toLowerCase(),
          isActive: true,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      throw error;
    }
  }
};

// Functions service
export const functionsService = {
  async executeCryptoFunction(data: any) {
    try {
      return await functions.createExecution(
        FUNCTION_IDS.CRYPTO_TRACKER,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Execute crypto function error:', error);
      throw error;
    }
  },

  async executeBackendAPI(endpoint: string, data?: any) {
    try {
      return await functions.createExecution(
        FUNCTION_IDS.BACKEND_API,
        JSON.stringify({ endpoint, data })
      );
    } catch (error) {
      console.error('Execute backend API error:', error);
      throw error;
    }
  }
};

export default client;