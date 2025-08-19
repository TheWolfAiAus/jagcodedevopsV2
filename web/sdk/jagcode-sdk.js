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
   * Real-time features with enhanced error handling and connection management
   */
  realtime = {
    isConnected: false,
    subscriptions: new Map(),
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: null,
    lastActivity: Date.now(),

    /**
     * Initialize real-time connection with retry logic
     */
    connect: () => {
      if (!this.appwrite) {
        console.error('SDK not initialized');
        return Promise.reject(new Error('SDK not initialized'));
      }

      return new Promise((resolve, reject) => {
        try {
          this.realtime.isConnected = true;
          this.realtime.lastActivity = Date.now();
          this.realtime.reconnectAttempts = 0;
          
          // Start heartbeat monitoring
          this.realtime.startHeartbeat();
          
          this.emit('realtime:connected');
          resolve();
        } catch (error) {
          console.error('Failed to establish real-time connection:', error);
          this.emit('realtime:error', { error, type: 'connection' });
          reject(error);
        }
      });
    },

    /**
     * Disconnect from real-time updates
     */
    disconnect: () => {
      this.realtime.isConnected = false;
      this.realtime.stopHeartbeat();
      
      // Unsubscribe from all active subscriptions
      this.realtime.subscriptions.forEach((unsubscribe, key) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`Error unsubscribing from ${key}:`, error);
        }
      });
      
      this.realtime.subscriptions.clear();
      this.emit('realtime:disconnected');
    },

    /**
     * Start heartbeat monitoring
     */
    startHeartbeat: () => {
      if (this.realtime.heartbeatInterval) {
        clearInterval(this.realtime.heartbeatInterval);
      }
      
      this.realtime.heartbeatInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - this.realtime.lastActivity;
        
        // If no activity for 30 seconds, try to reconnect
        if (timeSinceLastActivity > 30000 && this.realtime.isConnected) {
          console.warn('Real-time connection seems inactive, attempting reconnect...');
          this.realtime.reconnect();
        }
      }, 10000); // Check every 10 seconds
    },

    /**
     * Stop heartbeat monitoring
     */
    stopHeartbeat: () => {
      if (this.realtime.heartbeatInterval) {
        clearInterval(this.realtime.heartbeatInterval);
        this.realtime.heartbeatInterval = null;
      }
    },

    /**
     * Reconnect with exponential backoff
     */
    reconnect: async () => {
      if (this.realtime.reconnectAttempts >= this.realtime.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('realtime:error', { 
          error: new Error('Max reconnection attempts reached'), 
          type: 'reconnect_failed' 
        });
        return;
      }

      this.realtime.reconnectAttempts++;
      const delay = this.realtime.reconnectDelay * Math.pow(2, this.realtime.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect (${this.realtime.reconnectAttempts}/${this.realtime.maxReconnectAttempts}) in ${delay}ms...`);
      this.emit('realtime:reconnecting', { attempt: this.realtime.reconnectAttempts, delay });
      
      setTimeout(async () => {
        try {
          await this.realtime.connect();
          console.log('Successfully reconnected to real-time updates');
        } catch (error) {
          console.error('Reconnection failed:', error);
          this.realtime.reconnect(); // Try again
        }
      }, delay);
    },

    /**
     * Subscribe to real-time updates with enhanced error handling
     */
    subscribe: (channels, callback) => {
      if (!this.appwrite) {
        console.error('SDK not initialized');
        return null;
      }

      if (!this.realtime.isConnected) {
        console.warn('Real-time not connected, attempting to connect...');
        this.realtime.connect();
      }

      try {
        const channelKey = Array.isArray(channels) ? channels.join(',') : channels;
        
        const unsubscribe = this.appwrite.subscribe(channels, (response) => {
          try {
            this.realtime.lastActivity = Date.now();
            callback(response);
            this.emit('realtime:message', { channels, response });
          } catch (error) {
            console.error('Error in realtime callback:', error);
            this.emit('realtime:error', { error, type: 'callback', channels });
          }
        });

        this.realtime.subscriptions.set(channelKey, unsubscribe);
        this.emit('realtime:subscribed', { channels });
        
        return () => {
          try {
            unsubscribe();
            this.realtime.subscriptions.delete(channelKey);
            this.emit('realtime:unsubscribed', { channels });
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        };
      } catch (error) {
        console.error('Failed to subscribe to real-time updates:', error);
        this.emit('realtime:error', { error, type: 'subscribe', channels });
        return null;
      }
    },

    /**
     * Subscribe to user-specific updates with enhanced reliability
     */
    subscribeToUser: (userId, callbacks = {}) => {
      if (!this.appwrite) {
        console.error('SDK not initialized');
        return null;
      }

      if (!userId) {
        console.error('User ID is required for user-specific subscriptions');
        return null;
      }

      const subscriptions = [];
      const userSubscriptionKey = `user-${userId}`;

      // Enhanced callback wrapper with error handling
      const wrapCallback = (callbackName, originalCallback) => {
        return (response) => {
          try {
            if (response.payload && response.payload.userId === userId) {
              console.log(`📡 Real-time update: ${callbackName}`);
              originalCallback(response.payload);
            }
          } catch (error) {
            console.error(`Error in ${callbackName} callback:`, error);
            this.emit('realtime:error', { error, type: 'user_callback', callbackName });
          }
        };
      };

      // Subscribe to portfolio updates
      if (callbacks.onPortfolioUpdate) {
        const portfolioChannels = [
          `databases.${this.config.databaseId}.collections.portfolios.documents`
        ];
        const portfolioUnsub = this.realtime.subscribe(
          portfolioChannels,
          wrapCallback('onPortfolioUpdate', callbacks.onPortfolioUpdate)
        );
        if (portfolioUnsub) subscriptions.push(portfolioUnsub);
      }

      // Subscribe to transaction updates
      if (callbacks.onTransactionUpdate) {
        const transactionChannels = [
          `databases.${this.config.databaseId}.collections.transactions.documents`
        ];
        const transactionUnsub = this.realtime.subscribe(
          transactionChannels,
          wrapCallback('onTransactionUpdate', callbacks.onTransactionUpdate)
        );
        if (transactionUnsub) subscriptions.push(transactionUnsub);
      }

      // Subscribe to activity updates
      if (callbacks.onActivityUpdate) {
        const activityChannels = [
          `databases.${this.config.databaseId}.collections.activity.documents`
        ];
        const activityUnsub = this.realtime.subscribe(
          activityChannels,
          wrapCallback('onActivityUpdate', callbacks.onActivityUpdate)
        );
        if (activityUnsub) subscriptions.push(activityUnsub);
      }

      // Subscribe to user profile updates
      if (callbacks.onUserUpdate) {
        const userChannels = [
          `databases.${this.config.databaseId}.collections.users.documents`
        ];
        const userUnsub = this.realtime.subscribe(
          userChannels,
          wrapCallback('onUserUpdate', callbacks.onUserUpdate)
        );
        if (userUnsub) subscriptions.push(userUnsub);
      }

      // Connection status callbacks
      if (callbacks.onConnect) {
        this.on('realtime:connected', callbacks.onConnect);
      }
      
      if (callbacks.onDisconnect) {
        this.on('realtime:disconnected', callbacks.onDisconnect);
      }
      
      if (callbacks.onError) {
        this.on('realtime:error', callbacks.onError);
      }

      console.log(`✅ Subscribed to real-time updates for user ${userId}`);
      this.emit('realtime:user_subscribed', { userId, subscriptionCount: subscriptions.length });

      // Return cleanup function
      return () => {
        console.log(`🧹 Cleaning up real-time subscriptions for user ${userId}`);
        subscriptions.forEach(unsub => {
          try {
            unsub();
          } catch (error) {
            console.error('Error unsubscribing from user updates:', error);
          }
        });

        // Remove event listeners
        if (callbacks.onConnect) this.off('realtime:connected', callbacks.onConnect);
        if (callbacks.onDisconnect) this.off('realtime:disconnected', callbacks.onDisconnect);
        if (callbacks.onError) this.off('realtime:error', callbacks.onError);
        
        this.emit('realtime:user_unsubscribed', { userId });
      };
    },

    /**
     * Get connection status
     */
    getStatus: () => {
      return {
        isConnected: this.realtime.isConnected,
        subscriptionCount: this.realtime.subscriptions.size,
        reconnectAttempts: this.realtime.reconnectAttempts,
        lastActivity: this.realtime.lastActivity
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
