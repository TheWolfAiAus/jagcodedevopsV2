/**
 * JagCode Advanced Features Integration
 * Integrates NFT Hunter, Automation, Mining, Asset Tracking, and Wolf AI
 */

class JagCodeAdvancedFeatures {
  constructor(config) {
    this.config = config;
    // Use Appwrite Functions endpoints instead of localhost backend
    this.apiBaseUrl = config.get('appwrite.functionsEndpoint', '');
    this.projectId = config.get('appwrite.projectId', '');
    this.listeners = {};
    this.updateIntervals = new Map();
    
    // Appwrite Functions headers
    this.headers = {
      'X-Appwrite-Project': this.projectId,
      'Content-Type': 'application/json'
    };
    
    // Feature states
    this.features = {
      nftHunter: { active: false, stats: null },
      cryptoMiner: { active: false, stats: null },
      automation: { active: false, stats: null },
      assetTracker: { active: false, stats: null },
      wolfAI: { active: false, stats: null }
    };
  }

  /**
   * Helper method to make API calls with Appwrite headers
   */
  async apiCall(endpoint, options = {}) {
    const defaultOptions = {
      headers: this.headers,
      ...options
    };
    
    if (options.headers) {
      defaultOptions.headers = { ...this.headers, ...options.headers };
    }
    
    return fetch(`${this.apiBaseUrl}${endpoint}`, defaultOptions);
  }

  /**
   * Initialize advanced features
   */
  async init() {
    console.log('🚀 Initializing JagCode Advanced Features...');
    
    // Check backend connectivity
    await this.checkBackendConnection();
    
    // Load initial states
    await this.loadAllFeatureStates();
    
    // Start monitoring intervals
    this.startMonitoring();
    
    console.log('✅ Advanced features initialized');
    return this;
  }

  /**
   * Check if backend is available
   */
  async checkBackendConnection() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/health`, {
        headers: this.headers
      });
      const data = await response.json();
      
      this.emit('backendStatus', { 
        connected: response.ok, 
        status: data.status,
        message: data.message 
      });
      
      return response.ok;
    } catch (error) {
      console.warn('Backend connection failed:', error);
      this.emit('backendStatus', { 
        connected: false, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Load all feature states
   */
  async loadAllFeatureStates() {
    await Promise.all([
      this.loadNFTHunterStatus(),
      this.loadCryptoMinerStatus(),
      this.loadAutomationStatus(),
      this.loadAssetTrackerStatus()
    ]);
  }

  /**
   * NFT Hunter Methods
   */
  async loadNFTHunterStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nft-hunter/status`, {
        headers: this.headers
      });
      const data = await response.json();
      
      this.features.nftHunter = {
        active: data.is_running || false,
        stats: data
      };
      
      this.emit('nftHunterStatus', this.features.nftHunter);
      return data;
    } catch (error) {
      console.error('Failed to load NFT Hunter status:', error);
      return null;
    }
  }

  async startNFTHunter() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nft-hunter/start`, {
        method: 'POST',
        headers: this.headers
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.nftHunter.active = true;
        this.emit('nftHunterStarted', data);
        await this.loadNFTHunterStatus();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to start NFT Hunter:', error);
      throw error;
    }
  }

  async stopNFTHunter() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nft-hunter/stop`, {
        method: 'POST',
        headers: this.headers
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.nftHunter.active = false;
        this.emit('nftHunterStopped', data);
        await this.loadNFTHunterStatus();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to stop NFT Hunter:', error);
      throw error;
    }
  }

  async getNFTOpportunities(limit = 20) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nft-hunter/opportunities?limit=${limit}`);
      const data = await response.json();
      
      this.emit('nftOpportunitiesUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get NFT opportunities:', error);
      throw error;
    }
  }

  async getTopNFTOpportunities(limit = 5) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nft-hunter/opportunities/top?limit=${limit}`);
      const data = await response.json();
      
      this.emit('topNFTOpportunitiesUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get top NFT opportunities:', error);
      throw error;
    }
  }

  /**
   * Crypto Miner Methods
   */
  async loadCryptoMinerStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/crypto-miner/status`);
      const data = await response.json();
      
      this.features.cryptoMiner = {
        active: data.is_running || false,
        stats: data
      };
      
      this.emit('cryptoMinerStatus', this.features.cryptoMiner);
      return data;
    } catch (error) {
      console.error('Failed to load Crypto Miner status:', error);
      return null;
    }
  }

  async startCryptoMiner() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/crypto-miner/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.cryptoMiner.active = true;
        this.emit('cryptoMinerStarted', data);
        await this.loadCryptoMinerStatus();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to start Crypto Miner:', error);
      throw error;
    }
  }

  async stopCryptoMiner() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/crypto-miner/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.cryptoMiner.active = false;
        this.emit('cryptoMinerStopped', data);
        await this.loadCryptoMinerStatus();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to stop Crypto Miner:', error);
      throw error;
    }
  }

  async startMiningCoin(coin) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/crypto-miner/start/${coin}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      this.emit('coinMiningStarted', { coin, data });
      await this.loadCryptoMinerStatus();
      return data;
    } catch (error) {
      console.error(`Failed to start mining ${coin}:`, error);
      throw error;
    }
  }

  /**
   * Automation Engine Methods
   */
  async loadAutomationStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/status`);
      const data = await response.json();
      
      this.features.automation = {
        active: data.status === 'active',
        stats: data
      };
      
      this.emit('automationStatus', this.features.automation);
      return data;
    } catch (error) {
      console.error('Failed to load Automation status:', error);
      return null;
    }
  }

  async startAllOperations() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.automation.active = true;
        this.emit('allOperationsStarted', data);
        
        // Update all feature states
        await this.loadAllFeatureStates();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to start all operations:', error);
      throw error;
    }
  }

  async stopAllOperations() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        this.features.automation.active = false;
        this.emit('allOperationsStopped', data);
        
        // Update all feature states
        await this.loadAllFeatureStates();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to stop all operations:', error);
      throw error;
    }
  }

  async emergencyStop() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/emergency-stop`, {
        method: 'POST'
      });
      const data = await response.json();
      
      this.emit('emergencyStop', data);
      
      // Update all feature states
      await this.loadAllFeatureStates();
      
      return data;
    } catch (error) {
      console.error('Emergency stop failed:', error);
      throw error;
    }
  }

  async getProfitReport() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/profit-report`);
      const data = await response.json();
      
      this.emit('profitReportUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get profit report:', error);
      throw error;
    }
  }

  async optimizeOperations() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/optimize`, {
        method: 'POST'
      });
      const data = await response.json();
      
      this.emit('optimizationStarted', data);
      return data;
    } catch (error) {
      console.error('Failed to start optimization:', error);
      throw error;
    }
  }

  async transferProfitsToExodus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/automation/transfer-profits`, {
        method: 'POST'
      });
      const data = await response.json();
      
      this.emit('profitTransferStarted', data);
      return data;
    } catch (error) {
      console.error('Failed to transfer profits:', error);
      throw error;
    }
  }

  /**
   * Asset Tracker Methods
   */
  async loadAssetTrackerStatus() {
    try {
      const [balances, portfolio, transactions] = await Promise.all([
        fetch(`${this.apiBaseUrl}/asset-tracker/balances`).then(r => r.json()),
        fetch(`${this.apiBaseUrl}/asset-tracker/portfolio`).then(r => r.json()),
        fetch(`${this.apiBaseUrl}/asset-tracker/transactions?limit=10`).then(r => r.json())
      ]);
      
      this.features.assetTracker = {
        active: true,
        stats: { balances, portfolio, transactions }
      };
      
      this.emit('assetTrackerStatus', this.features.assetTracker);
      return this.features.assetTracker.stats;
    } catch (error) {
      console.error('Failed to load Asset Tracker status:', error);
      return null;
    }
  }

  async getAssetBalances() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/asset-tracker/balances`);
      const data = await response.json();
      
      this.emit('assetBalancesUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get asset balances:', error);
      throw error;
    }
  }

  async getPortfolioOverview() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/asset-tracker/portfolio`);
      const data = await response.json();
      
      this.emit('portfolioOverviewUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get portfolio overview:', error);
      throw error;
    }
  }

  async getTransactionHistory(limit = 50) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/asset-tracker/transactions?limit=${limit}`);
      const data = await response.json();
      
      this.emit('transactionHistoryUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  /**
   * Wallet Manager Methods
   */
  async getWalletStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wallet-manager/status`);
      const data = await response.json();
      
      this.emit('walletStatusUpdated', data);
      return data;
    } catch (error) {
      console.error('Failed to get wallet status:', error);
      throw error;
    }
  }

  async sendTransaction(toAddress, amount, tokenSymbol = 'ETH', network = 'ethereum') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wallet-manager/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_address: toAddress,
          amount: amount,
          token_symbol: tokenSymbol,
          network: network
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.emit('transactionSent', data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Start monitoring intervals
   */
  startMonitoring() {
    // Update NFT opportunities every 30 seconds
    this.updateIntervals.set('nftOpportunities', setInterval(async () => {
      if (this.features.nftHunter.active) {
        try {
          await this.getTopNFTOpportunities(5);
        } catch (error) {
          console.warn('Failed to update NFT opportunities:', error);
        }
      }
    }, 30000));

    // Update mining status every 60 seconds
    this.updateIntervals.set('miningStatus', setInterval(async () => {
      if (this.features.cryptoMiner.active) {
        try {
          await this.loadCryptoMinerStatus();
        } catch (error) {
          console.warn('Failed to update mining status:', error);
        }
      }
    }, 60000));

    // Update asset tracker every 30 seconds
    this.updateIntervals.set('assetTracker', setInterval(async () => {
      try {
        await this.loadAssetTrackerStatus();
      } catch (error) {
        console.warn('Failed to update asset tracker:', error);
      }
    }, 30000));

    // Update automation status every 15 seconds
    this.updateIntervals.set('automationStatus', setInterval(async () => {
      try {
        await this.loadAutomationStatus();
      } catch (error) {
        console.warn('Failed to update automation status:', error);
      }
    }, 15000));
  }

  /**
   * Stop monitoring intervals
   */
  stopMonitoring() {
    this.updateIntervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`Stopped ${name} monitoring`);
    });
    this.updateIntervals.clear();
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      features: this.features,
      isAnyActive: Object.values(this.features).some(f => f.active),
      activeFeatures: Object.entries(this.features)
        .filter(([_, feature]) => feature.active)
        .map(([name, _]) => name),
      timestamp: Date.now()
    };
  }

  /**
   * Event system
   */
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
        console.error(`Error in advanced features event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopMonitoring();
    this.listeners = {};
    console.log('Advanced features destroyed');
  }
}

// Export for global use
window.JagCodeAdvancedFeatures = JagCodeAdvancedFeatures;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JagCodeAdvancedFeatures;
}
