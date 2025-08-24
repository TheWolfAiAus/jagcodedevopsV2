/**
 * JagCode Wallet Manager
 * Advanced multi-chain wallet integration system
 */

class JagCodeWalletManager {
  constructor(config) {
    this.config = config;
    this.wallets = new Map();
    this.activeWallet = null;
    this.web3 = null;
    this.listeners = {};
    this.supportedChains = {
      1: { name: 'Ethereum', symbol: 'ETH', rpc: 'https://mainnet.infura.io/v3/' },
      56: { name: 'BNB Smart Chain', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org/' },
      137: { name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com/' },
      250: { name: 'Fantom', symbol: 'FTM', rpc: 'https://rpc.ftm.tools/' },
      43114: { name: 'Avalanche', symbol: 'AVAX', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
      42161: { name: 'Arbitrum', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc' },
      10: { name: 'Optimism', symbol: 'ETH', rpc: 'https://mainnet.optimism.io' }
    };
  }

  /**
   * Initialize wallet manager
   */
  async init() {
    console.log('🔗 Initializing wallet manager...');
    
    // Load Web3 if not available
    if (!window.Web3 && !window.web3) {
      console.warn('Web3 not found, some features may be limited');
    } else {
      this.web3 = window.Web3 || window.web3;
    }

    // Detect available wallets
    await this.detectWallets();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Try to restore previous connection
    await this.restoreConnection();
    
    console.log('✅ Wallet manager initialized');
    return this;
  }

  /**
   * Detect available wallet providers
   */
  async detectWallets() {
    const detected = {};

    // MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      detected.metamask = {
        name: 'MetaMask',
        provider: window.ethereum,
        type: 'injected',
        icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
        installed: true
      };
    }

    // Coinbase Wallet
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      detected.coinbase = {
        name: 'Coinbase Wallet',
        provider: window.ethereum,
        type: 'injected',
        icon: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
        installed: true
      };
    }

    // Trust Wallet
    if (window.ethereum && window.ethereum.isTrust) {
      detected.trust = {
        name: 'Trust Wallet',
        provider: window.ethereum,
        type: 'injected',
        icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.png',
        installed: true
      };
    }

    // Phantom (Solana)
    if (window.solana && window.solana.isPhantom) {
      detected.phantom = {
        name: 'Phantom',
        provider: window.solana,
        type: 'solana',
        icon: 'https://phantom.app/img/logo.png',
        installed: true
      };
    }

    // WalletConnect (always available)
    detected.walletconnect = {
      name: 'WalletConnect',
      provider: null, // Will be initialized on connect
      type: 'walletconnect',
      icon: 'https://walletconnect.org/walletconnect-logo.svg',
      installed: true
    };

    // Store detected wallets
    Object.entries(detected).forEach(([key, wallet]) => {
      this.wallets.set(key, wallet);
    });

    console.log('🔍 Detected wallets:', Array.from(this.wallets.keys()));
    this.emit('walletsDetected', { wallets: Array.from(this.wallets.keys()) });
  }

  /**
   * Connect to a specific wallet
   */
  async connect(walletType, options = {}) {
    try {
      console.log(`🔗 Connecting to ${walletType}...`);
      
      const wallet = this.wallets.get(walletType);
      if (!wallet) {
        throw new Error(`Wallet ${walletType} not found or not installed`);
      }

      let accounts = [];
      let chainId = null;

      switch (walletType) {
        case 'metamask':
        case 'coinbase':
        case 'trust':
          accounts = await this.connectEthereum(wallet.provider);
          chainId = await this.getChainId(wallet.provider);
          break;
          
        case 'walletconnect':
          const wcResult = await this.connectWalletConnect(options);
          accounts = wcResult.accounts;
          chainId = wcResult.chainId;
          wallet.provider = wcResult.provider;
          break;
          
        case 'phantom':
          accounts = await this.connectSolana(wallet.provider);
          chainId = 'solana';
          break;
          
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      // Store active connection
      this.activeWallet = {
        type: walletType,
        provider: wallet.provider,
        accounts,
        chainId,
        address: accounts[0],
        name: wallet.name
      };

      // Save to localStorage for restoration
      localStorage.setItem('jagcode_active_wallet', JSON.stringify({
        type: walletType,
        address: accounts[0],
        chainId
      }));

      console.log(`✅ Connected to ${walletType}:`, accounts[0]);
      this.emit('walletConnected', this.activeWallet);
      
      return this.activeWallet;
      
    } catch (error) {
      console.error(`❌ Failed to connect to ${walletType}:`, error);
      this.emit('walletError', { error, walletType });
      throw error;
    }
  }

  /**
   * Connect to Ethereum-compatible wallet
   */
  async connectEthereum(provider) {
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts;
  }

  /**
   * Connect to WalletConnect
   */
  async connectWalletConnect(options = {}) {
    if (!window.WalletConnectProvider) {
      throw new Error('WalletConnect not available');
    }

    const provider = new window.WalletConnectProvider({
      rpc: this.config?.wallets?.metamask?.rpcUrls || {
        1: 'https://mainnet.infura.io/v3/',
        56: 'https://bsc-dataseed.binance.org/',
        137: 'https://polygon-rpc.com/'
      },
      chainId: options.chainId || 1,
      ...options
    });

    await provider.enable();
    
    return {
      provider,
      accounts: provider.accounts,
      chainId: provider.chainId
    };
  }

  /**
   * Connect to Solana wallet (Phantom)
   */
  async connectSolana(provider) {
    const response = await provider.connect();
    return [response.publicKey.toString()];
  }

  /**
   * Disconnect current wallet
   */
  async disconnect() {
    if (!this.activeWallet) {
      return;
    }

    try {
      const walletType = this.activeWallet.type;
      
      // Wallet-specific disconnect logic
      if (walletType === 'walletconnect' && this.activeWallet.provider) {
        await this.activeWallet.provider.disconnect();
      } else if (walletType === 'phantom' && this.activeWallet.provider) {
        await this.activeWallet.provider.disconnect();
      }

      // Clear active wallet
      this.activeWallet = null;
      
      // Clear localStorage
      localStorage.removeItem('jagcode_active_wallet');
      
      console.log('✅ Wallet disconnected');
      this.emit('walletDisconnected');
      
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      this.emit('walletError', { error, type: 'disconnect' });
    }
  }

  /**
   * Switch to a different chain
   */
  async switchChain(chainId) {
    if (!this.activeWallet || !this.activeWallet.provider) {
      throw new Error('No active wallet connection');
    }

    try {
      if (this.activeWallet.type === 'phantom') {
        throw new Error('Chain switching not supported for Solana wallets');
      }

      const hexChainId = '0x' + chainId.toString(16);
      
      await this.activeWallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });

      this.activeWallet.chainId = chainId;
      this.emit('chainChanged', { chainId });
      
      console.log(`✅ Switched to chain ${chainId}`);
      
    } catch (error) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        await this.addChain(chainId);
      } else {
        console.error('❌ Failed to switch chain:', error);
        throw error;
      }
    }
  }

  /**
   * Add a new chain to the wallet
   */
  async addChain(chainId) {
    const chainConfig = this.supportedChains[chainId];
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
      await this.activeWallet.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x' + chainId.toString(16),
          chainName: chainConfig.name,
          nativeCurrency: {
            name: chainConfig.symbol,
            symbol: chainConfig.symbol,
            decimals: 18
          },
          rpcUrls: [chainConfig.rpc],
          blockExplorerUrls: ['https://etherscan.io'] // This should be chain-specific
        }]
      });

      console.log(`✅ Added chain ${chainConfig.name}`);
      
    } catch (error) {
      console.error('❌ Failed to add chain:', error);
      throw error;
    }
  }

  /**
   * Get current chain ID
   */
  async getChainId(provider = null) {
    const currentProvider = provider || this.activeWallet?.provider;
    if (!currentProvider) return null;

    try {
      const chainId = await currentProvider.request({
        method: 'eth_chainId'
      });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address = null, chainId = null) {
    const targetAddress = address || this.activeWallet?.address;
    const targetChainId = chainId || this.activeWallet?.chainId;
    
    if (!targetAddress) {
      throw new Error('No address specified');
    }

    try {
      if (targetChainId === 'solana') {
        return await this.getSolanaBalance(targetAddress);
      } else {
        return await this.getEthereumBalance(targetAddress);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get Ethereum balance
   */
  async getEthereumBalance(address) {
    if (!this.activeWallet?.provider) {
      throw new Error('No provider available');
    }

    const balance = await this.activeWallet.provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });

    return {
      wei: balance,
      ether: parseInt(balance, 16) / Math.pow(10, 18),
      formatted: this.formatBalance(parseInt(balance, 16) / Math.pow(10, 18))
    };
  }

  /**
   * Get Solana balance
   */
  async getSolanaBalance(address) {
    // This would require Solana Web3.js library
    // For now, return placeholder
    return {
      lamports: 0,
      sol: 0,
      formatted: '0.00 SOL'
    };
  }

  /**
   * Send transaction
   */
  async sendTransaction(transaction) {
    if (!this.activeWallet || !this.activeWallet.provider) {
      throw new Error('No active wallet connection');
    }

    try {
      if (this.activeWallet.chainId === 'solana') {
        return await this.sendSolanaTransaction(transaction);
      } else {
        return await this.sendEthereumTransaction(transaction);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      this.emit('transactionError', { error, transaction });
      throw error;
    }
  }

  /**
   * Send Ethereum transaction
   */
  async sendEthereumTransaction(transaction) {
    const txHash = await this.activeWallet.provider.request({
      method: 'eth_sendTransaction',
      params: [transaction]
    });

    this.emit('transactionSent', { hash: txHash, transaction });
    return txHash;
  }

  /**
   * Send Solana transaction
   */
  async sendSolanaTransaction(transaction) {
    // Implementation would depend on Solana Web3.js
    throw new Error('Solana transactions not yet implemented');
  }

  /**
   * Sign message
   */
  async signMessage(message) {
    if (!this.activeWallet || !this.activeWallet.provider) {
      throw new Error('No active wallet connection');
    }

    try {
      if (this.activeWallet.chainId === 'solana') {
        return await this.signSolanaMessage(message);
      } else {
        return await this.signEthereumMessage(message);
      }
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  /**
   * Sign Ethereum message
   */
  async signEthereumMessage(message) {
    const signature = await this.activeWallet.provider.request({
      method: 'personal_sign',
      params: [message, this.activeWallet.address]
    });

    return signature;
  }

  /**
   * Sign Solana message
   */
  async signSolanaMessage(message) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.activeWallet.provider.signMessage(encodedMessage, 'utf8');
    return signedMessage.signature;
  }

  /**
   * Set up event listeners for wallet events
   */
  setupEventListeners() {
    // Ethereum wallet events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else if (this.activeWallet) {
          this.activeWallet.accounts = accounts;
          this.activeWallet.address = accounts[0];
          this.emit('accountsChanged', { accounts });
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        if (this.activeWallet) {
          this.activeWallet.chainId = parseInt(chainId, 16);
          this.emit('chainChanged', { chainId: this.activeWallet.chainId });
        }
      });

      window.ethereum.on('disconnect', () => {
        this.disconnect();
      });
    }
  }

  /**
   * Restore previous wallet connection
   */
  async restoreConnection() {
    try {
      const saved = localStorage.getItem('jagcode_active_wallet');
      if (!saved) return;

      const { type, address, chainId } = JSON.parse(saved);
      
      // Attempt to reconnect
      const wallet = this.wallets.get(type);
      if (wallet && wallet.installed) {
        // Check if wallet is still connected
        if (type === 'metamask' || type === 'coinbase' || type === 'trust') {
          const accounts = await wallet.provider.request({ method: 'eth_accounts' });
          if (accounts.includes(address)) {
            await this.connect(type);
            console.log('🔄 Wallet connection restored');
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore wallet connection:', error);
      localStorage.removeItem('jagcode_active_wallet');
    }
  }

  /**
   * Format balance for display
   */
  formatBalance(balance, decimals = 4) {
    if (balance === 0) return '0.00';
    if (balance < 0.0001) return '< 0.0001';
    return balance.toFixed(decimals);
  }

  /**
   * Get wallet info
   */
  getWalletInfo() {
    return {
      activeWallet: this.activeWallet,
      availableWallets: Array.from(this.wallets.values()),
      supportedChains: this.supportedChains
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
        console.error(`Error in wallet event listener for ${event}:`, error);
      }
    });
  }
}

// Export for global use
window.JagCodeWalletManager = JagCodeWalletManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JagCodeWalletManager;
}
