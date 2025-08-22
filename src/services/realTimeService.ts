import {RealtimeResponseEvent} from 'appwrite';
import client, {AppwriteActivity, appwriteConfig, AppwritePortfolio, AppwriteTransaction} from '@/lib/appwrite';

export interface RealtimeCallbacks {
  onPortfolioUpdate?: (portfolio: AppwritePortfolio) => void;
  onTransactionUpdate?: (transaction: AppwriteTransaction) => void;
  onActivityUpdate?: (activity: AppwriteActivity) => void;
  onUserUpdate?: (user: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class RealTimeService {
  private subscriptions: Map<string, () => void> = new Map();
  private callbacks: RealtimeCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(callbacks: RealtimeCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Initialize real-time subscriptions for a user
   */
  async initialize(userId: string): Promise<void> {
    try {
      if (!appwriteConfig.enableRealtime) {
        console.log('Real-time is disabled');
        return;
      }

      // Clean up existing subscriptions
      await this.cleanup();

      // Subscribe to user's portfolio updates
      await this.subscribeToPortfolio(userId);

      // Subscribe to user's transaction updates
      await this.subscribeToTransactions(userId);

      // Subscribe to user's activity updates
      await this.subscribeToActivity(userId);

      // Subscribe to user profile updates
      await this.subscribeToUser(userId);

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();

      console.log('Real-time service initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize real-time service:', error);
      this.callbacks.onError?.(error as Error);
      this.handleReconnect(userId);
    }
  }

  /**
   * Subscribe to portfolio updates
   */
  private async subscribeToPortfolio(userId: string): Promise<void> {
    const subscriptionKey = `portfolio_${userId}`;
    
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.portfolioCollectionId}.documents`,
      (response: RealtimeResponseEvent<AppwritePortfolio>) => {
        try {
          const portfolio = response.payload;
          
          // Only process if it's for this user
          if (portfolio.userId === userId) {
            console.log('Portfolio update received:', portfolio);
            this.callbacks.onPortfolioUpdate?.(portfolio);
            
            // Log activity
            this.logActivity(userId, 'portfolio_update', `Portfolio updated: $${portfolio.totalValue?.toLocaleString()}`, {
              totalValue: portfolio.totalValue,
              assetCount: portfolio.assets?.length || 0,
            });
          }
        } catch (error) {
          console.error('Error processing portfolio update:', error);
          this.callbacks.onError?.(error as Error);
        }
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
  }

  /**
   * Subscribe to transaction updates
   */
  private async subscribeToTransactions(userId: string): Promise<void> {
    const subscriptionKey = `transactions_${userId}`;
    
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.transactionCollectionId}.documents`,
      (response: RealtimeResponseEvent<AppwriteTransaction>) => {
        try {
          const transaction = response.payload;
          
          // Only process if it's for this user
          if (transaction.userId === userId) {
            console.log('Transaction update received:', transaction);
            this.callbacks.onTransactionUpdate?.(transaction);
            
            // Log activity based on transaction status
            let description = `${transaction.type.toUpperCase()}: ${transaction.amount} ${transaction.symbol}`;
            if (transaction.status === 'confirmed') {
              description += ' ✅ Confirmed';
            } else if (transaction.status === 'failed') {
              description += ' ❌ Failed';
            } else {
              description += ' ⏳ Pending';
            }
            
            this.logActivity(userId, 'transaction', description, {
              transactionId: transaction.$id,
              type: transaction.type,
              amount: transaction.amount,
              symbol: transaction.symbol,
              status: transaction.status,
            });
          }
        } catch (error) {
          console.error('Error processing transaction update:', error);
          this.callbacks.onError?.(error as Error);
        }
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
  }

  /**
   * Subscribe to activity updates
   */
  private async subscribeToActivity(userId: string): Promise<void> {
    const subscriptionKey = `activity_${userId}`;
    
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.activityCollectionId}.documents`,
      (response: RealtimeResponseEvent<AppwriteActivity>) => {
        try {
          const activity = response.payload;
          
          // Only process if it's for this user
          if (activity.userId === userId) {
            console.log('Activity update received:', activity);
            this.callbacks.onActivityUpdate?.(activity);
          }
        } catch (error) {
          console.error('Error processing activity update:', error);
          this.callbacks.onError?.(error as Error);
        }
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
  }

  /**
   * Subscribe to user profile updates
   */
  private async subscribeToUser(userId: string): Promise<void> {
    const subscriptionKey = `user_${userId}`;
    
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.userCollectionId}.documents.${userId}`,
      (response: RealtimeResponseEvent<any>) => {
        try {
          const user = response.payload;
          console.log('User profile update received:', user);
          this.callbacks.onUserUpdate?.(user);
          
          this.logActivity(userId, 'setting_change', 'Profile updated', {
            changes: Object.keys(user),
          });
        } catch (error) {
          console.error('Error processing user update:', error);
          this.callbacks.onError?.(error as Error);
        }
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);
  }

  /**
   * Log user activity
   */
  private async logActivity(
    userId: string, 
    type: AppwriteActivity['type'], 
    description: string, 
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Don't log activity updates to avoid infinite loops
      if (type === 'login' || type === 'setting_change') {
        const { databases } = await import('@/lib/appwrite');
        const { ID } = await import('appwrite');
        
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.activityCollectionId,
          ID.unique(),
          {
            userId,
            type,
            description,
            metadata,
            timestamp: new Date().toISOString(),
            platform: 'mobile', // You can detect this dynamically
          }
        );
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't propagate activity logging errors
    }
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect(userId: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.callbacks.onError?.(new Error('Failed to maintain real-time connection'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.initialize(userId);
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.handleReconnect(userId);
      }
    }, delay);
  }

  /**
   * Update callbacks
   */
  updateCallbacks(newCallbacks: Partial<RealtimeCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }

  /**
   * Check if service is connected
   */
  isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get active subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Clean up all subscriptions
   */
  async cleanup(): Promise<void> {
    try {
      // Unsubscribe from all active subscriptions
      for (const [key, unsubscribe] of this.subscriptions) {
        try {
          unsubscribe();
          console.log(`Unsubscribed from ${key}`);
        } catch (error) {
          console.error(`Failed to unsubscribe from ${key}:`, error);
        }
      }

      this.subscriptions.clear();
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
      
      console.log('Real-time service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Pause subscriptions (e.g., when app goes to background)
   */
  async pause(): Promise<void> {
    console.log('Pausing real-time subscriptions');
    await this.cleanup();
  }

  /**
   * Resume subscriptions (e.g., when app comes to foreground)
   */
  async resume(userId: string): Promise<void> {
    console.log('Resuming real-time subscriptions');
    await this.initialize(userId);
  }
}

// Singleton instance
let realtimeServiceInstance: RealTimeService | null = null;

export const getRealTimeService = (callbacks?: RealtimeCallbacks): RealTimeService => {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealTimeService(callbacks);
  } else if (callbacks) {
    realtimeServiceInstance.updateCallbacks(callbacks);
  }
  
  return realtimeServiceInstance;
};

export const cleanupRealTimeService = async (): Promise<void> => {
  if (realtimeServiceInstance) {
    await realtimeServiceInstance.cleanup();
    realtimeServiceInstance = null;
  }
};
