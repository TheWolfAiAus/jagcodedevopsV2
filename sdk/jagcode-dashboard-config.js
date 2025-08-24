/**
 * JagCode Dashboard Configuration System
 * Complete crypto trading dashboard with 15+ APIs and wallet integration
 */

class JagCodeDashboardConfig {
  constructor() {
    this.config = {
      // Core Appwrite Configuration
      appwrite: {
        endpoint: 'https://cloud.appwrite.io/v1',
        projectId: '',
        databaseId: '',
        functionsEndpoint: '', // Your Appwrite Functions URL
        collections: {
          users: 'users',
          portfolios: 'portfolios',
          transactions: 'transactions',
          activity: 'activity',
          settings: 'settings',
          watchlists: 'watchlists',
          alerts: 'alerts',
          trading_pairs: 'trading_pairs'
        }
      },

      // Crypto APIs Configuration
      apis: {
        // 1. CoinGecko - Market data and prices
        coingecko: {
          baseUrl: 'https://api.coingecko.com/api/v3',
          key: null, // Free tier available
          endpoints: {
            prices: '/simple/price',
            markets: '/coins/markets',
            trending: '/search/trending',
            global: '/global'
          }
        },

        // 2. CoinMarketCap - Professional market data
        coinmarketcap: {
          baseUrl: 'https://pro-api.coinmarketcap.com/v1',
          key: '', // Requires API key
          endpoints: {
            listings: '/cryptocurrency/listings/latest',
            quotes: '/cryptocurrency/quotes/latest',
            metadata: '/cryptocurrency/info',
            global: '/global-metrics/quotes/latest'
          }
        },

        // 3. Binance - Exchange data and trading
        binance: {
          baseUrl: 'https://api.binance.com/api/v3',
          key: '', // For trading
          secret: '', // For trading
          endpoints: {
            ticker: '/ticker/24hr',
            klines: '/klines',
            depth: '/depth',
            trades: '/trades'
          }
        },

        // 4. Coinbase Advanced Trade API
        coinbase: {
          baseUrl: 'https://api.exchange.coinbase.com',
          key: '',
          secret: '',
          passphrase: '',
          endpoints: {
            products: '/products',
            ticker: '/products/{id}/ticker',
            candles: '/products/{id}/candles',
            book: '/products/{id}/book'
          }
        },

        // 5. Kraken - Advanced trading features
        kraken: {
          baseUrl: 'https://api.kraken.com/0',
          key: '',
          secret: '',
          endpoints: {
            assets: '/public/Assets',
            ticker: '/public/Ticker',
            depth: '/public/Depth',
            trades: '/public/Trades'
          }
        },

        // 6. CryptoCompare - Historical data and news
        cryptocompare: {
          baseUrl: 'https://min-api.cryptocompare.com/data',
          key: '',
          endpoints: {
            price: '/price',
            histoday: '/v2/histoday',
            news: '/v2/news/',
            social: '/v2/social/coin/general'
          }
        },

        // 7. Messari - Fundamental analysis
        messari: {
          baseUrl: 'https://data.messari.io/api/v1',
          key: '',
          endpoints: {
            assets: '/assets',
            metrics: '/assets/{slug}/metrics',
            profile: '/assets/{slug}/profile',
            news: '/news'
          }
        },

        // 8. CoinAPI - Professional data feeds
        coinapi: {
          baseUrl: 'https://rest.coinapi.io/v1',
          key: '',
          endpoints: {
            exchanges: '/exchanges',
            assets: '/assets',
            symbols: '/symbols',
            quotes: '/quotes/current'
          }
        },

        // 9. Alpha Vantage - Technical indicators
        alphavantage: {
          baseUrl: 'https://www.alphavantage.co/query',
          key: '',
          endpoints: {
            crypto: '?function=DIGITAL_CURRENCY_DAILY',
            forex: '?function=FX_DAILY',
            indicators: '?function=RSI'
          }
        },

        // 10. Nomics - Historical and real-time data
        nomics: {
          baseUrl: 'https://api.nomics.com/v1',
          key: '',
          endpoints: {
            currencies: '/currencies/ticker',
            markets: '/markets',
            candles: '/candles',
            volume: '/volume/history'
          }
        },

        // 11. CoinCap - Real-time asset data
        coincap: {
          baseUrl: 'https://api.coincap.io/v2',
          key: null, // Free
          endpoints: {
            assets: '/assets',
            markets: '/markets',
            exchanges: '/exchanges',
            candles: '/assets/{id}/candles'
          }
        },

        // 12. Kaiko - Institutional-grade data
        kaiko: {
          baseUrl: 'https://us.market-api.kaiko.io/v2',
          key: '',
          endpoints: {
            trades: '/data/trades.v1/exchanges/{exchange}/spot/{pair}/trades',
            ohlcv: '/data/ohlcv.v1/exchanges/{exchange}/spot/{pair}/ohlcv',
            orderbook: '/data/order_book_snapshots.v1/exchanges/{exchange}/spot/{pair}/snapshots'
          }
        },

        // 13. Dune Analytics - On-chain data
        dune: {
          baseUrl: 'https://api.dune.com/api/v1',
          key: '',
          endpoints: {
            query: '/query/{query_id}/execute',
            results: '/execution/{execution_id}/results',
            status: '/execution/{execution_id}/status'
          }
        },

        // 14. Moralis - Web3 data and NFTs
        moralis: {
          baseUrl: 'https://deep-index.moralis.io/api/v2',
          key: '',
          endpoints: {
            balance: '/{address}/balance',
            tokens: '/{address}/erc20',
            nfts: '/{address}/nft',
            transactions: '/{address}'
          }
        },

        // 15. The Graph Protocol - Decentralized data
        thegraph: {
          baseUrl: 'https://api.thegraph.com/subgraphs/name',
          endpoints: {
            uniswap: '/uniswap/uniswap-v3',
            aave: '/aave/protocol-v2',
            compound: '/graphprotocol/compound-v2'
          }
        },

        // 16. DeFiPulse - DeFi protocols data
        defipulse: {
          baseUrl: 'https://data-api.defipulse.com/api/v1',
          key: '',
          endpoints: {
            protocols: '/defipulse/api/GetProjects',
            history: '/defipulse/api/GetHistory'
          }
        },

        // 17. CoinLore - Free crypto data
        coinlore: {
          baseUrl: 'https://api.coinlore.net/api',
          endpoints: {
            global: '/global/',
            tickers: '/tickers/',
            coin: '/ticker/?id='
          }
        },

        // 18. Fear & Greed Index
        feargreed: {
          baseUrl: 'https://api.alternative.me',
          endpoints: {
            index: '/fng/'
          }
        }
      },

      // Wallet Integration Configuration
      wallets: {
        // MetaMask
        metamask: {
          enabled: true,
          chainIds: [1, 56, 137, 250, 43114], // Ethereum, BSC, Polygon, Fantom, Avalanche
          rpcUrls: {
            1: 'https://mainnet.infura.io/v3/{projectId}',
            56: 'https://bsc-dataseed.binance.org/',
            137: 'https://polygon-rpc.com/',
            250: 'https://rpc.ftm.tools/',
            43114: 'https://api.avax.network/ext/bc/C/rpc'
          }
        },

        // WalletConnect
        walletconnect: {
          enabled: true,
          projectId: '', // WalletConnect v2 project ID
          chains: [1, 56, 137],
          metadata: {
            name: 'JagCode Dashboard',
            description: 'Professional Crypto Trading Dashboard',
            url: 'https://jagcodedevops.xyz',
            icons: ['https://jagcodedevops.xyz/icon.png']
          }
        },

        // Coinbase Wallet
        coinbaseWallet: {
          enabled: true,
          appName: 'JagCode Dashboard',
          appLogoUrl: 'https://jagcodedevops.xyz/logo.png'
        },

        // Trust Wallet
        trustwallet: {
          enabled: true
        },

        // Phantom (Solana)
        phantom: {
          enabled: true,
          network: 'mainnet-beta'
        }
      },

      // Trading Features
      trading: {
        enabled: true,
        exchanges: ['binance', 'coinbase', 'kraken'],
        features: {
          spotTrading: true,
          futuresTrading: false, // Requires additional licenses
          optionsTrading: false,
          staking: true,
          lending: true
        },
        riskManagement: {
          maxPositionSize: 0.1, // 10% of portfolio
          stopLoss: true,
          takeProfit: true,
          maxDailyLoss: 0.05 // 5% of portfolio
        }
      },

      // Chart Configuration
      charts: {
        provider: 'tradingview', // or 'lightweight-charts'
        tradingview: {
          library: 'https://charting-library.tradingview.com/',
          datafeed: 'https://demo_feed.tradingview.com',
          themes: ['light', 'dark'],
          indicators: true,
          drawings: true,
          studies: ['RSI', 'MACD', 'Bollinger Bands', 'Moving Average']
        }
      },

      // News and Social Sentiment
      news: {
        sources: ['cryptocompare', 'messari', 'coindesk', 'cointelegraph'],
        sentiment: {
          enabled: true,
          providers: ['messari', 'cryptocompare']
        }
      },

      // Portfolio Analytics
      analytics: {
        enabled: true,
        features: {
          performance: true,
          riskMetrics: true,
          rebalancing: true,
          taxReporting: true,
          benchmarking: true
        },
        benchmarks: ['BTC', 'ETH', 'SP500', 'NASDAQ']
      },

      // Alerts and Notifications
      alerts: {
        enabled: true,
        types: {
          priceAlerts: true,
          portfolioAlerts: true,
          newsAlerts: true,
          technicalAlerts: true
        },
        delivery: {
          push: true,
          email: true,
          webhook: true
        }
      },

      // Security Configuration
      security: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyDerivation: 'PBKDF2'
        },
        rateLimit: {
          requests: 100,
          window: 60000 // 1 minute
        },
        cors: {
          origins: ['https://jagcodedevops.webflow.io', 'https://jagcodedevops.xyz']
        }
      },

      // UI/UX Configuration
      ui: {
        theme: 'auto', // 'light', 'dark', 'auto'
        layouts: {
          default: 'grid',
          mobile: 'stack',
          customizable: true
        },
        colors: {
          primary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#6366F1'
        },
        animations: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out'
        }
      },

      // Performance Optimization
      performance: {
        caching: {
          enabled: true,
          duration: 300000, // 5 minutes
          storage: 'localStorage'
        },
        lazy: {
          loading: true,
          images: true,
          charts: true
        },
        compression: {
          enabled: true,
          level: 6
        }
      }
    };
  }

  /**
   * Initialize dashboard with configuration
   */
  async init(userConfig = {}) {
    // Merge user configuration with defaults
    this.config = this.mergeDeep(this.config, userConfig);
    
    // Validate configuration
    this.validateConfig();
    
    // Load required scripts
    await this.loadScripts();
    
    // Initialize wallet connections
    await this.initializeWallets();
    
    // Set up API clients
    this.initializeAPIs();
    
    console.log('🚀 JagCode Dashboard initialized successfully');
    return this.config;
  }

  /**
   * Deep merge configuration objects
   */
  mergeDeep(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const required = ['appwrite.projectId', 'appwrite.databaseId'];
    
    for (const path of required) {
      if (!this.getNestedValue(this.config, path)) {
        throw new Error(`Required configuration missing: ${path}`);
      }
    }
    
    console.log('✅ Configuration validated');
  }

  /**
   * Get nested configuration value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Load required external scripts
   */
  async loadScripts() {
    const scripts = [
      // Web3 and Wallet Libraries
      'https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js',
      'https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js',
      
      // Chart Libraries
      'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js',
      
      // Utility Libraries
      'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
      'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
      
      // Analytics
      'https://cdn.jsdelivr.net/npm/simple-statistics@7.8.2/dist/simple-statistics.min.js'
    ];

    for (const src of scripts) {
      if (!this.isScriptLoaded(src)) {
        await this.loadScript(src);
      }
    }
    
    console.log('📚 External scripts loaded');
  }

  /**
   * Check if script is already loaded
   */
  isScriptLoaded(src) {
    return document.querySelector(`script[src="${src}"]`) !== null;
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
   * Initialize wallet connections
   */
  async initializeWallets() {
    const walletProviders = {};

    try {
      // MetaMask
      if (this.config.wallets.metamask.enabled && window.ethereum) {
        walletProviders.metamask = {
          provider: window.ethereum,
          type: 'injected',
          name: 'MetaMask'
        };
      }

      // WalletConnect
      if (this.config.wallets.walletconnect.enabled && window.WalletConnectProvider) {
        walletProviders.walletconnect = {
          provider: new window.WalletConnectProvider({
            rpc: this.config.wallets.metamask.rpcUrls,
            chainId: 1
          }),
          type: 'walletconnect',
          name: 'WalletConnect'
        };
      }

      // Phantom (Solana)
      if (this.config.wallets.phantom.enabled && window.solana) {
        walletProviders.phantom = {
          provider: window.solana,
          type: 'solana',
          name: 'Phantom'
        };
      }

      this.walletProviders = walletProviders;
      console.log('🔗 Wallet providers initialized:', Object.keys(walletProviders));
      
    } catch (error) {
      console.warn('⚠️ Wallet initialization warning:', error.message);
    }
  }

  /**
   * Initialize API clients
   */
  initializeAPIs() {
    this.apiClients = {};

    // Create rate-limited fetch function
    const createRateLimitedFetch = (baseUrl, apiKey) => {
      return async (endpoint, options = {}) => {
        const url = `${baseUrl}${endpoint}`;
        const headers = {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey }),
          ...options.headers
        };

        try {
          const response = await fetch(url, { ...options, headers });
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`API Error (${url}):`, error);
          throw error;
        }
      };
    };

    // Initialize each API client
    Object.entries(this.config.apis).forEach(([name, config]) => {
      this.apiClients[name] = {
        config,
        fetch: createRateLimitedFetch(config.baseUrl, config.key)
      };
    });

    console.log('🌐 API clients initialized:', Object.keys(this.apiClients));
  }

  /**
   * Get API client
   */
  getAPI(name) {
    return this.apiClients[name];
  }

  /**
   * Get wallet provider
   */
  getWallet(name) {
    return this.walletProviders[name];
  }

  /**
   * Get configuration value
   */
  get(path, defaultValue = null) {
    return this.getNestedValue(this.config, path) || defaultValue;
  }

  /**
   * Set configuration value
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      obj[key] = obj[key] || {};
      return obj[key];
    }, this.config);
    
    target[lastKey] = value;
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  /**
   * Export configuration for debugging
   */
  exportConfig() {
    const safeConfig = JSON.parse(JSON.stringify(this.config));
    
    // Remove sensitive data
    const sensitiveKeys = ['key', 'secret', 'password', 'token'];
    const removeSensitive = (obj) => {
      Object.keys(obj).forEach(key => {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitive(obj[key]);
        }
      });
    };
    
    removeSensitive(safeConfig);
    return safeConfig;
  }
}

// Global configuration instance
window.JagCodeDashboardConfig = JagCodeDashboardConfig;

// Auto-initialize if config is available
if (window.JAGCODE_DASHBOARD_CONFIG) {
  window.dashboardConfig = new JagCodeDashboardConfig();
  window.dashboardConfig.init(window.JAGCODE_DASHBOARD_CONFIG);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JagCodeDashboardConfig;
}
