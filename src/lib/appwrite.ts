import {Account, Client, Databases, Functions, Storage} from 'appwrite';

// Appwrite configuration
export const appwriteConfig = {
  url: process.env.EXPO_PUBLIC_APPWRITE_URL || 'https://syd.cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68a3b34a00375e270b14',
  // Collection IDs
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || '68a3b34a00375e270b15',
  portfolioCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID || '68a3b3e2000dcc682c12',
  transactionCollectionId: process.env.EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID || '68a3b41400346ff40705',
  activityCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ACTIVITY_COLLECTION_ID || '68a3b43e001c44090ac6',
  settingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || '68a3b463003bb9695087',
  // Storage
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || '68a3b463003bb9695088',
  // Functions
  syncFunctionId: process.env.EXPO_PUBLIC_APPWRITE_SYNC_FUNCTION_ID || '68a3b463003bb9695089',
  backupFunctionId: process.env.EXPO_PUBLIC_APPWRITE_BACKUP_FUNCTION_ID || '68a3b463003bb9695090',
  notifyFunctionId: process.env.EXPO_PUBLIC_APPWRITE_NOTIFY_FUNCTION_ID || '68a3b463003bb9695091',
  // Real-time settings
  enableRealtime: process.env.EXPO_PUBLIC_ENABLE_REALTIME !== 'false',
  realtimeHeartbeat: parseInt(process.env.EXPO_PUBLIC_REALTIME_HEARTBEAT || '10000'),
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
