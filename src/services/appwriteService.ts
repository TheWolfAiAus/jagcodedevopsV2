import {ID, Query} from 'appwrite';
import {
    account,
    AppwriteActivity,
    appwriteConfig,
    AppwritePortfolio,
    AppwriteSettings,
    AppwriteTransaction,
    AppwriteUser,
    databases,
    functions
} from '@/lib/appwrite';

export class AppwriteService {
  // Authentication methods
  static async createUser(email: string, password: string, name: string) {
    try {
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      // Create user profile in database
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        newAccount.$id,
        {
          name,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      return newAccount;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      const currentAccount = await account.get();
      if (!currentAccount) return null;

      const userDocument = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        currentAccount.$id
      );

      return {
        $id: userDocument.$id,
        name: userDocument.name,
        email: userDocument.email,
        walletAddress: userDocument.walletAddress,
        portfolioValue: userDocument.portfolioValue,
        createdAt: userDocument.createdAt,
        updatedAt: userDocument.updatedAt,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async signOut() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Portfolio management
  static async getPortfolio(userId: string): Promise<AppwritePortfolio | null> {
    try {
      const portfolios = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.portfolioCollectionId,
        [Query.equal('userId', userId)]
      );

      if (portfolios.documents.length === 0) return null;

      const portfolio = portfolios.documents[0];
      return {
        $id: portfolio.$id,
        userId: portfolio.userId,
        totalValue: portfolio.totalValue,
        assets: portfolio.assets,
        lastUpdated: portfolio.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      throw error;
    }
  }

  static async updatePortfolio(userId: string, portfolioData: Partial<AppwritePortfolio>) {
    try {
      const existingPortfolios = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.portfolioCollectionId,
        [Query.equal('userId', userId)]
      );

      const updateData = {
        ...portfolioData,
        lastUpdated: new Date().toISOString(),
      };

      if (existingPortfolios.documents.length === 0) {
        // Create new portfolio
        return await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.portfolioCollectionId,
          ID.unique(),
          {
            userId,
            ...updateData,
          }
        );
      } else {
        // Update existing portfolio
        return await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.portfolioCollectionId,
          existingPortfolios.documents[0].$id,
          updateData
        );
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  // Transaction management
  static async getTransactions(userId: string, limit = 50): Promise<AppwriteTransaction[]> {
    try {
      const transactions = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionCollectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );

      return transactions.documents.map(doc => ({
        $id: doc.$id,
        userId: doc.userId,
        type: doc.type,
        amount: doc.amount,
        symbol: doc.symbol,
        network: doc.network,
        hash: doc.hash,
        status: doc.status,
        timestamp: doc.timestamp,
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async addTransaction(userId: string, transactionData: Omit<AppwriteTransaction, '$id' | 'userId'>) {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionCollectionId,
        ID.unique(),
        {
          userId,
          ...transactionData,
        }
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Sync with existing backend
  static async syncWithSupabase(userId: string) {
    try {
      if (!appwriteConfig.syncFunctionId) {
        console.warn('Sync function ID not configured');
        return;
      }

      const execution = await functions.createExecution(
        appwriteConfig.syncFunctionId,
        JSON.stringify({ userId }),
        false
      );

      return execution;
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      throw error;
    }
  }

  // Activity management
  static async getActivities(userId: string, limit = 20): Promise<AppwriteActivity[]> {
    try {
      const activities = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.activityCollectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );

      return activities.documents.map(doc => ({
        $id: doc.$id,
        userId: doc.userId,
        type: doc.type,
        description: doc.description,
        metadata: doc.metadata,
        timestamp: doc.timestamp,
        platform: doc.platform,
      }));
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }

  static async addActivity(userId: string, activityData: Omit<AppwriteActivity, '$id' | 'userId'>) {
    try {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.activityCollectionId,
        ID.unique(),
        {
          userId,
          ...activityData,
        }
      );
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  // Settings management
  static async getUserSettings(userId: string): Promise<AppwriteSettings | null> {
    try {
      const settings = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.settingsCollectionId,
        [Query.equal('userId', userId)]
      );

      if (settings.documents.length === 0) return null;

      const setting = settings.documents[0];
      return {
        $id: setting.$id,
        userId: setting.userId,
        theme: setting.theme,
        notifications: setting.notifications,
        privacy: setting.privacy,
        currency: setting.currency,
        language: setting.language,
        updatedAt: setting.updatedAt,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  static async updateUserSettings(userId: string, settingsData: Partial<AppwriteSettings>) {
    try {
      const existingSettings = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.settingsCollectionId,
        [Query.equal('userId', userId)]
      );

      const updateData = {
        ...settingsData,
        updatedAt: new Date().toISOString(),
      };

      if (existingSettings.documents.length === 0) {
        // Create new settings
        return await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.settingsCollectionId,
          ID.unique(),
          {
            userId,
            theme: 'auto',
            notifications: {
              push: true,
              email: true,
              transactions: true,
              portfolio: true,
            },
            privacy: {
              showPortfolio: true,
              showTransactions: true,
            },
            currency: 'USD',
            language: 'en',
            ...updateData,
          }
        );
      } else {
        // Update existing settings
        return await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.settingsCollectionId,
          existingSettings.documents[0].$id,
          updateData
        );
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Wallet integration
  static async linkWallet(userId: string, walletAddress: string) {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        {
          walletAddress,
          updatedAt: new Date().toISOString(),
        }
      );

      // Log activity
      await this.addActivity(userId, {
        type: 'wallet_connect',
        description: `Wallet connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        metadata: { walletAddress },
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    }
  }
}
