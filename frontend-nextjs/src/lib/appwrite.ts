import { Client, Account, Databases, Storage, Functions } from 'appwrite';

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
    try {
      const response = await account.create('unique()', email, password, name);
      
      // Create user profile in database
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        response.$id,
        {
          email,
          name,
          profileImage: '',
          bio: '',
          portfolioValue: 0,
          isVerified: false,
          createdAt: new Date().toISOString()
        }
      );
      
      return response;
    } catch (error) {
      console.error('Account creation error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      return await account.createEmailSession(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
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
        [databases.queries.equal('userId', userId)]
      );
    } catch (error) {
      console.error('Get user portfolio error:', error);
      throw error;
    }
  },

  async createPriceAlert(userId: string, symbol: string, targetPrice: number, condition: string) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PRICE_ALERTS,
        'unique()',
        {
          userId,
          symbol,
          targetPrice,
          condition,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Create price alert error:', error);
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