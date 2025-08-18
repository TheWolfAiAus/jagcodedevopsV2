/**
 * JagCode SDK for Webflow Integration
 * Provides authentication, database operations, and blockchain functionality
 * Compatible with: jagecodedevops.webflow.io, jagcodedevops.xyz
 */

class JagCodeSDK {
  constructor() {
    this.appwrite = null;
    this.account = null;
    this.databases = null;
    this.config = {};
    this.user = null;
    this.initialized = false;
  }

  /**
   * Initialize the SDK with configuration
   * @param {Object} config - Configuration object
   */
  async init(config = {}) {
    try {
      // Load Appwrite SDK if not already loaded
      if (!window.Appwrite) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/appwrite@16.0.2/dist/iife/sdk.js');
      }

      this.config = {
        endpoint: config.endpoint || 'https://cloud.appwrite.io/v1',
        projectId: config.projectId || '',
        databaseId: config.databaseId || '',
        ...config
      };

      // Initialize Appwrite client
      this.appwrite = new Appwrite.Client()
        .setEndpoint(this.config.endpoint)
        .setProject(this.config.projectId);

      this.account = new Appwrite.Account(this.appwrite);
      this.databases = new Appwrite.Databases(this.appwrite);

      // Check if user is already authenticated
      try {
        this.user = await this.account.get();
      } catch (error) {
        // User not authenticated, which is fine
        this.user = null;
      }

      this.initialized = true;
      this.emit('ready', { user: this.user });

      return this;
    } catch (error) {
      console.error('JagCode SDK initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load external script
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Authentication methods
   */
  auth = {
    /**
     * Sign up a new user
     */
    signUp: async (email, password, name) => {
      try {
        const user = await this.account.create(Appwrite.ID.unique(), email, password, name);
        
        // Create user profile in database
        await this.databases.createDocument(
          this.config.databaseId,
          'users',
          user.$id,
          {
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );

        this.user = user;
        this.emit('auth:signup', { user });
        return user;
      } catch (error) {
        this.emit('auth:error', { error, type: 'signup' });
        throw error;
      }
    },

    /**
     * Sign in existing user
     */
    signIn: async (email, password) => {
      try {
        const session = await this.account.createEmailPasswordSession(email, password);
        this.user = await this.account.get();
        this.emit('auth:signin', { user: this.user, session });
        return { user: this.user, session };
      } catch (error) {
        this.emit('auth:error', { error, type: 'signin' });
        throw error;
      }
    },

    /**
     * Sign out current user
     */
    signOut: async () => {
      try {
        await this.account.deleteSession('current');
        this.user = null;
        this.emit('auth:signout');
        return true;
      } catch (error) {
        this.emit('auth:error', { error, type: 'signout' });
        throw error;
      }
    },

    /**
     * Get current user
     */
    getCurrentUser: () => {
      return this.user;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
      return !!this.user;
    }
  };

  /**
   * Database operations
   */
  db = {
    /**
     * Create a document
     */
    create: async (collectionId, data, documentId = null) => {
      try {
        const id = documentId || Appwrite.ID.unique();
        const document = await this.databases.createDocument(
          this.config.databaseId,
          collectionId,
          id,
          data
        );
        this.emit('db:create', { document, collectionId });
        return document;
      } catch (error) {
        this.emit('db:error', { error, operation: 'create', collectionId });
        throw error;
      }
    },

    /**
     * Get a document by ID
     */
    get: async (collectionId, documentId) => {
      try {
        const document = await this.databases.getDocument(
          this.config.databaseId,
          collectionId,
          documentId
        );
        this.emit('db:get', { document, collectionId });
        return document;
      } catch (error) {
        this.emit('db:error', { error, operation: 'get', collectionId });
        throw error;
      }
    },

    /**
     * List documents with optional queries
     */
    list: async (collectionId, queries = []) => {
      try {
        const documents = await this.databases.listDocuments(
          this.config.databaseId,
          collectionId,
          queries
        );
        this.emit('db:list', { documents, collectionId });
        return documents;
      } catch (error) {
        this.emit('db:error', { error, operation: 'list', collectionId });
        throw error;
      }
    },

    /**
     * Update a document
     */
    update: async (collectionId, documentId, data) => {
      try {
        const document = await this.databases.updateDocument(
          this.config.databaseId,
          collectionId,
          documentId,
          data
        );
        this.emit('db:update', { document, collectionId });
        return document;
      } catch (error) {
        this.emit('db:error', { error, operation: 'update', collectionId });
        throw error;
      }
    },

    /**
     * Delete a document
     */
    delete: async (collectionId, documentId) => {
      try {
        await this.databases.deleteDocument(
          this.config.databaseId,
          collectionId,
          documentId
        );
        this.emit('db:delete', { documentId, collectionId });
        return true;
      } catch (error) {
        this.emit('db:error', { error, operation: 'delete', collectionId });
        throw error;
      }
    }
  };

  /**
   * Portfolio management
   */
  portfolio = {
    /**
     * Get user portfolio
     */
    get: async (userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const portfolios = await this.db.list('portfolios', [
          Appwrite.Query.equal('userId', targetUserId)
        ]);

        return portfolios.documents.length > 0 ? portfolios.documents[0] : null;
      } catch (error) {
        console.error('Error getting portfolio:', error);
        throw error;
      }
    },

    /**
     * Update portfolio
     */
    update: async (portfolioData, userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const existing = await this.portfolio.get(targetUserId);
        const data = {
          ...portfolioData,
          userId: targetUserId,
          lastUpdated: new Date().toISOString()
        };

        if (existing) {
          return await this.db.update('portfolios', existing.$id, data);
        } else {
          return await this.db.create('portfolios', data);
        }
      } catch (error) {
        console.error('Error updating portfolio:', error);
        throw error;
      }
    }
  };

  /**
   * Transaction management
   */
  transactions = {
    /**
     * Get user transactions
     */
    list: async (userId = null, limit = 50) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const transactions = await this.db.list('transactions', [
          Appwrite.Query.equal('userId', targetUserId),
          Appwrite.Query.orderDesc('timestamp'),
          Appwrite.Query.limit(limit)
        ]);

        return transactions.documents;
      } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
      }
    },

    /**
     * Add new transaction
     */
    add: async (transactionData, userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const data = {
          ...transactionData,
          userId: targetUserId,
          timestamp: new Date().toISOString()
        };

        return await this.db.create('transactions', data);
      } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }
    }
  };

  /**
   * Real-time features
   */
  realtime = {
    /**
     * Subscribe to real-time updates
     */
    subscribe: (callback) => {
      if (!this.appwrite) {
        console.error('SDK not initialized');
        return;
      }

      // Subscribe to database changes
      const unsubscribe = this.appwrite.subscribe(
        `databases.${this.config.databaseId}.collections`,
        (response) => {
          try {
            callback(response);
          } catch (error) {
            console.error('Error in realtime callback:', error);
          }
        }
      );

      this.emit('realtime:connected');
      return unsubscribe;
    },

    /**
     * Subscribe to user-specific updates
     */
    subscribeToUser: (userId, callbacks = {}) => {
      if (!this.appwrite) {
        console.error('SDK not initialized');
        return;
      }

      const subscriptions = [];

      // Subscribe to portfolio updates
      if (callbacks.onPortfolioUpdate) {
        const portfolioUnsub = this.appwrite.subscribe(
          `databases.${this.config.databaseId}.collections.portfolios.documents`,
          (response) => {
            if (response.payload.userId === userId) {
              callbacks.onPortfolioUpdate(response.payload);
            }
          }
        );
        subscriptions.push(portfolioUnsub);
      }

      // Subscribe to transaction updates
      if (callbacks.onTransactionUpdate) {
        const transactionUnsub = this.appwrite.subscribe(
          `databases.${this.config.databaseId}.collections.transactions.documents`,
          (response) => {
            if (response.payload.userId === userId) {
              callbacks.onTransactionUpdate(response.payload);
            }
          }
        );
        subscriptions.push(transactionUnsub);
      }

      // Subscribe to activity updates
      if (callbacks.onActivityUpdate) {
        const activityUnsub = this.appwrite.subscribe(
          `databases.${this.config.databaseId}.collections.activity.documents`,
          (response) => {
            if (response.payload.userId === userId) {
              callbacks.onActivityUpdate(response.payload);
            }
          }
        );
        subscriptions.push(activityUnsub);
      }

      return () => {
        subscriptions.forEach(unsub => {
          try {
            unsub();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        });
      };
    }
  };

  /**
   * Activity management
   */
  activity = {
    /**
     * Get user activities
     */
    list: async (userId = null, limit = 20) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const activities = await this.db.list('activity', [
          Appwrite.Query.equal('userId', targetUserId),
          Appwrite.Query.orderDesc('timestamp'),
          Appwrite.Query.limit(limit)
        ]);

        return activities.documents;
      } catch (error) {
        console.error('Error getting activities:', error);
        throw error;
      }
    },

    /**
     * Add new activity
     */
    add: async (activityData, userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const data = {
          ...activityData,
          userId: targetUserId,
          timestamp: new Date().toISOString(),
          platform: 'web'
        };

        return await this.db.create('activity', data);
      } catch (error) {
        console.error('Error adding activity:', error);
        throw error;
      }
    }
  };

  /**
   * Settings management
   */
  settings = {
    /**
     * Get user settings
     */
    get: async (userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const settings = await this.db.list('settings', [
          Appwrite.Query.equal('userId', targetUserId)
        ]);

        return settings.documents.length > 0 ? settings.documents[0] : null;
      } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
      }
    },

    /**
     * Update user settings
     */
    update: async (settingsData, userId = null) => {
      const targetUserId = userId || this.user?.$id;
      if (!targetUserId) throw new Error('User not authenticated');

      try {
        const existing = await this.settings.get(targetUserId);
        const data = {
          ...settingsData,
          userId: targetUserId,
          updatedAt: new Date().toISOString()
        };

        if (existing) {
          return await this.db.update('settings', existing.$id, data);
        } else {
          return await this.db.create('settings', {
            ...data,
            theme: 'auto',
            notifications: {
              push: true,
              email: true,
              transactions: true,
              portfolio: true
            },
            privacy: {
              showPortfolio: true,
              showTransactions: true
            },
            currency: 'USD',
            language: 'en'
          });
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    }
  };

  /**
   * Event system
   */
  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Utility methods
   */
  utils = {
    /**
     * Format currency
     */
    formatCurrency: (amount, currency = 'USD', decimals = 2) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(amount);
    },

    /**
     * Format date
     */
    formatDate: (date, options = {}) => {
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
        .format(new Date(date));
    },

    /**
     * Debounce function
     */
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };
}

// Export SDK for global use
window.JagCodeSDK = JagCodeSDK;

// Auto-initialize if config is available
if (window.JAGCODE_CONFIG) {
  window.jagcode = new JagCodeSDK();
  window.jagcode.init(window.JAGCODE_CONFIG);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JagCodeSDK;
}
