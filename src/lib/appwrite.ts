import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Appwrite configuration with fallbacks and validation
const getEnvVar = (key: string, fallback: string = ''): string => {
  // Check both EXPO_PUBLIC_ and regular env vars
  const expoKey = `EXPO_PUBLIC_${key}`;
  const regularKey = key;
  
  const value = process.env[expoKey] || 
                process.env[regularKey] || 
                process.env[`APPWRITE_${key}`] || 
                fallback;
  
  return value;
};

export const appwriteConfig = {
  url: getEnvVar('APPWRITE_URL', 'https://cloud.appwrite.io/v1'),
  projectId: getEnvVar('PROJECT_ID', '68a36f6c002bfc1e6057'), // Use the ID from .env
  databaseId: getEnvVar('DATABASE_ID', 'main-database'),
  // Collection IDs - use the ones from .env
  userCollectionId: getEnvVar('USER_COLLECTION_ID', '68a3b34a00375e270b15'),
  portfolioCollectionId: getEnvVar('PORTFOLIO_COLLECTION_ID', '68a3b3e2000dcc682c12'),
  transactionCollectionId: getEnvVar('TRANSACTION_COLLECTION_ID', '68a3b41400346ff40705'),
  activityCollectionId: getEnvVar('ACTIVITY_COLLECTION_ID', '68a3b43e001c44090ac6'),
  settingsCollectionId: getEnvVar('SETTINGS_COLLECTION_ID', '68a3b463003bb9695087'),
  // Storage
  storageId: getEnvVar('STORAGE_ID', 'main-storage'),
  storageBucket: getEnvVar('STORAGE_BUCKET', '68a3b5b80038da178baf'),
  // Functions
  backupFunctionId: getEnvVar('BACKUP_FUNCTION_ID', 'backup-data'),
  notifyFunctionId: getEnvVar('NOTIFY_FUNCTION_ID', 'send-notifications'),
  syncFunctionId: getEnvVar('SYNC_FUNCTION_ID', 'sync-data'),
  // Real-time settings
  enableRealtime: getEnvVar('ENABLE_REALTIME', 'true') === 'true',
  realtimeHeartbeat: parseInt(getEnvVar('REALTIME_HEARTBEAT', '30000')),
};

// Validate configuration
const validateConfig = () => {
  const required = ['url', 'projectId'];
  const missing = required.filter(key => !appwriteConfig[key as keyof typeof appwriteConfig]);
  
  if (missing.length > 0) {
    console.warn('Appwrite config missing required fields:', missing);
    console.warn('Current config:', {
      url: appwriteConfig.url,
      projectId: appwriteConfig.projectId,
      hasProjectId: !!appwriteConfig.projectId
    });
  }
  
  return missing.length === 0;
};

// Initialize Appwrite client with error handling
let client: Client;
let isConfigValid = false;

try {
  isConfigValid = validateConfig();
  
  if (isConfigValid) {
    client = new Client()
      .setEndpoint(appwriteConfig.url)
      .setProject(appwriteConfig.projectId);
    
    console.log('✅ Appwrite client initialized successfully');
  } else {
    // Create a dummy client to prevent import errors
    client = new Client();
    console.warn('⚠️ Appwrite client initialized with invalid config');
  }
} catch (error) {
  console.error('❌ Failed to initialize Appwrite client:', error);
  client = new Client(); // Fallback to prevent import errors
}

// Initialize services with safe fallbacks
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Export client and config validation status
export { isConfigValid };
export default client;

// Helper function to check if Appwrite is properly configured
export const isAppwriteReady = (): boolean => {
  return isConfigValid && !!appwriteConfig.projectId && !!appwriteConfig.url;
};

// Types for Appwrite integration
export interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  walletAddress?: string;
  portfolioValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppwritePortfolio {
  $id: string;
  userId: string;
  totalValue: number;
  assets: Array<{
    symbol: string;
    amount: number;
    valueUsd: number;
    network: string;
  }>;
  lastUpdated: string;
}

export interface AppwriteTransaction {
  $id: string;
  userId: string;
  type: 'send' | 'receive' | 'swap' | 'mine';
  amount: number;
  symbol: string;
  network: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface AppwriteActivity {
  $id: string;
  userId: string;
  type: 'login' | 'transaction' | 'portfolio_update' | 'wallet_connect' | 'setting_change';
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  platform: 'mobile' | 'web';
}

export interface AppwriteSettings {
  $id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    transactions: boolean;
    portfolio: boolean;
  };
  privacy: {
    showPortfolio: boolean;
    showTransactions: boolean;
  };
  currency: string;
  language: string;
  updatedAt: string;
}
