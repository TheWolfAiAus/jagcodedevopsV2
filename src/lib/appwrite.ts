import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Appwrite configuration
export const appwriteConfig = {
  url: process.env.EXPO_PUBLIC_APPWRITE_URL || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '',
  // Collection IDs
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
  portfolioCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID || 'portfolios',
  transactionCollectionId: process.env.EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID || 'transactions',
  activityCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ACTIVITY_COLLECTION_ID || 'activity',
  settingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || 'settings',
  // Storage
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || 'main-storage',
  // Functions
  backupFunctionId: process.env.EXPO_PUBLIC_APPWRITE_BACKUP_FUNCTION_ID || 'backup-data',
  notifyFunctionId: process.env.EXPO_PUBLIC_APPWRITE_NOTIFY_FUNCTION_ID || 'send-notifications',
  // Real-time settings
  enableRealtime: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
  realtimeHeartbeat: parseInt(process.env.EXPO_PUBLIC_REALTIME_HEARTBEAT || '30000'),
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.url)
  .setProject(appwriteConfig.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Export client for direct use if needed
export default client;

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
