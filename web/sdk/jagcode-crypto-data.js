/**
 * JagCode Crypto Data Manager
 * Comprehensive crypto data aggregation from 18+ APIs
 */

class JagCodeCryptoData {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.rateLimits = new Map();
    this.listeners = {};
    this.intervals = new Map();
  }

  /**
   * Initialize crypto data manager
   */
  async init() {
    console.log('📊 Initializing crypto data manager...');
    
    // Set up rate limiting
    this.setupRateLimiting();
    
    // Initialize price streams
    this.startPriceStreams();
    
    console.log('✅ Crypto data manager initialized');
    return this;
  }

  /**
   * Set up rate limiting for different APIs
   */
  setupRateLimiting() {
    const limits = {
      coingecko: { requests: 50, window: 60000 }, // 50/minute free tier
      coinmarketcap: { requests: 333, window: 86400000 }, // 333/day free tier
      binance: { requests: 1200, window: 60000 }, // 1200/minute
      coinbase: { requests: 10, window: 1000 }, // 10/second
      kraken: { requests: 1, window: 1000 }, // 1/second
      cryptocompare: { requests: 100, window: 1000 }, // 100/second
      messari: { requests: 20, window: 60000 }, // 20/minute
      coinapi: { requests: 100, window: 86400000 }, // 100/day free
      alphavantage: { requests: 5, window: 60000 }, // 5/minute free
      nomics: { requests: 1, window: 1000 }, // 1/second
      coincap: { requests: 200, window: 60000 }, // No official limit
      kaiko: { requests: 100, window: 60000 }, // Depends on plan
      dune: { requests: 10, window: 60000 }, // 10/minute free
      moralis: { requests: 25, window: 1000 } // 25/second
    };

    Object.entries(limits).forEach(([api, limit]) => {
      this.rateLimits.set(api, {
        ...limit,
        requests: 0,
        resetTime: Date.now() + limit.window
      });
    });
  }

  /**
   * Check if API request is within rate limit
   */
  checkRateLimit(apiName) {
    const limit = this.rateLimits.get(apiName);
    if (!limit) return true;

    const now = Date.now();
    
    // Reset counter if window has passed
    if (now >= limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = now + limit.window;
    }

    // Check if under limit
    if (limit.requests >= limit.requests) {
      console.warn(`Rate limit exceeded for ${apiName}`);
      return false;
    }

    limit.requests++;
    return true;
  }

  /**
   * Make API request with caching and rate limiting
   */
  async apiRequest(apiName, endpoint, params = {}, cacheTime = 60000) {
    // Check cache first
    const cacheKey = `${apiName}:${endpoint}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    // Check rate limit
    if (!this.checkRateLimit(apiName)) {
      throw new Error(`Rate limit exceeded for ${apiName}`);
    }

    try {
      const api = this.config.getAPI(apiName);
      if (!api) {
        throw new Error(`API ${apiName} not configured`);
      }

      // Build URL with params
      let url = endpoint;
      if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }

      const data = await api.fetch(url);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
      
    } catch (error) {
      console.error(`API request failed for ${apiName}:`, error);
      throw error;
    }
  }

  /**
   * Get cryptocurrency prices from multiple sources
   */
  async getPrices(symbols = ['bitcoin', 'ethereum'], vs_currency = 'usd') {
    const results = {};
    
    try {
      // Primary: CoinGecko (free, reliable)
      const coinGeckoData = await this.apiRequest('coingecko', '/simple/price', {
        ids: symbols.join(','),
        vs_currencies: vs_currency,
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      });
      
      results.coingecko = coinGeckoData;
      
    } catch (error) {
      console.warn('CoinGecko price fetch failed:', error);
    }

    try {
      // Secondary: CoinCap (free backup)
      const coinCapData = await this.apiRequest('coincap', '/assets', {
        ids: symbols.join(',')
      });
      
      results.coincap = coinCapData;
      
    } catch (error) {
      console.warn('CoinCap price fetch failed:', error);
    }

    // Aggregate and return best data
    return this.aggregatePriceData(results, symbols);
  }

  /**
   * Get market data from multiple exchanges
   */
  async getMarketData(symbol = 'BTCUSDT') {
    const results = {};

    try {
      // Binance market data
      const binanceData = await this.apiRequest('binance', '/ticker/24hr', {
        symbol: symbol
      });
      results.binance = binanceData;
    } catch (error) {
      console.warn('Binance market data failed:', error);
    }

    try {
      // Coinbase market data
      const coinbaseSymbol = symbol.replace('USDT', '-USD');
      const coinbaseData = await this.apiRequest('coinbase', `/products/${coinbaseSymbol}/ticker`);
      results.coinbase = coinbaseData;
    } catch (error) {
      console.warn('Coinbase market data failed:', error);
    }

    try {
      // Kraken market data
      const krakenSymbol = symbol.replace('USDT', 'USD');
      const krakenData = await this.apiRequest('kraken', '/public/Ticker', {
        pair: krakenSymbol
      });
      results.kraken = krakenData;
    } catch (error) {
      console.warn('Kraken market data failed:', error);
    }

    return results;
  }

  /**
   * Get historical price data
   */
  async getHistoricalData(symbol, days = 30, interval = 'daily') {
    try {
      // CryptoCompare for historical data
      const data = await this.apiRequest('cryptocompare', '/v2/histoday', {
        fsym: symbol.toUpperCase(),
        tsym: 'USD',
        limit: days
      });

      return this.formatHistoricalData(data);
      
    } catch (error) {
      console.error('Historical data fetch failed:', error);
      
      // Fallback to CoinGecko
      try {
        const fallbackData = await this.apiRequest('coingecko', `/coins/${symbol}/market_chart`, {
          vs_currency: 'usd',
          days: days
        });
        
        return this.formatCoinGeckoHistorical(fallbackData);
        
      } catch (fallbackError) {
        console.error('Fallback historical data failed:', fallbackError);
        throw new Error('Failed to fetch historical data from all sources');
      }
    }
  }

  /**
   * Get trending cryptocurrencies
   */
  async getTrending() {
    const results = {};

    try {
      // CoinGecko trending
      const trendingData = await this.apiRequest('coingecko', '/search/trending');
      results.trending = trendingData.coins;
    } catch (error) {
      console.warn('Trending data failed:', error);
    }

    try {
      // CoinMarketCap latest listings
      if (this.config.get('apis.coinmarketcap.key')) {
        const cmcData = await this.apiRequest('coinmarketcap', '/cryptocurrency/listings/latest', {
          start: 1,
          limit: 10,
          sort: 'percent_change_24h'
        });
        results.gainers = cmcData.data;
      }
    } catch (error) {
      console.warn('CoinMarketCap trending failed:', error);
    }

    return results;
  }

  /**
   * Get Fear & Greed Index
   */
  async getFearGreedIndex() {
    try {
      const data = await this.apiRequest('feargreed', '/fng/', {}, 3600000); // Cache for 1 hour
      return data.data[0];
    } catch (error) {
      console.error('Fear & Greed Index failed:', error);
      return null;
    }
  }

  /**
   * Get crypto news from multiple sources
   */
  async getNews(limit = 20) {
    const results = [];

    try {
      // CryptoCompare news
      const ccNews = await this.apiRequest('cryptocompare', '/v2/news/', {
        limit: limit,
        sortOrder: 'latest'
      });
      
      results.push(...ccNews.Data.map(article => ({
        ...article,
        source: 'CryptoCompare'
      })));
      
    } catch (error) {
      console.warn('CryptoCompare news failed:', error);
    }

    try {
      // Messari news
      if (this.config.get('apis.messari.key')) {
        const messariNews = await this.apiRequest('messari', '/news', {
          limit: limit
        });
        
        results.push(...messariNews.data.map(article => ({
          ...article,
          source: 'Messari'
        })));
      }
    } catch (error) {
      console.warn('Messari news failed:', error);
    }

    // Sort by publication date
    return results.sort((a, b) => new Date(b.published_on || b.published_at) - new Date(a.published_on || a.published_at));
  }

  /**
   * Get DeFi protocol data
   */
  async getDeFiData() {
    const results = {};

    try {
      // DeFiPulse data
      if (this.config.get('apis.defipulse.key')) {
        const defiData = await this.apiRequest('defipulse', '/defipulse/api/GetProjects');
        results.protocols = defiData;
      }
    } catch (error) {
      console.warn('DeFiPulse data failed:', error);
    }

    try {
      // The Graph Protocol queries for Uniswap data
      const uniswapQuery = `
        {
          uniswapDayDatas(first: 7, orderBy: date, orderDirection: desc) {
            date
            volumeUSD
            tvlUSD
          }
        }
      `;
      
      const uniswapData = await this.queryTheGraph('uniswap/uniswap-v3', uniswapQuery);
      results.uniswap = uniswapData;
      
    } catch (error) {
      console.warn('Uniswap data failed:', error);
    }

    return results;
  }

  /**
   * Get on-chain data from Moralis
   */
  async getOnChainData(address) {
    if (!this.config.get('apis.moralis.key')) {
      throw new Error('Moralis API key not configured');
    }

    const results = {};

    try {
      // Get token balances
      const balances = await this.apiRequest('moralis', `/${address}/erc20`, {
        chain: 'eth'
      });
      results.tokenBalances = balances;
      
    } catch (error) {
      console.warn('Moralis token balances failed:', error);
    }

    try {
      // Get NFTs
      const nfts = await this.apiRequest('moralis', `/${address}/nft`, {
        chain: 'eth',
        format: 'decimal'
      });
      results.nfts = nfts;
      
    } catch (error) {
      console.warn('Moralis NFTs failed:', error);
    }

    try {
      // Get transaction history
      const transactions = await this.apiRequest('moralis', `/${address}`, {
        chain: 'eth',
        limit: 10
      });
      results.transactions = transactions;
      
    } catch (error) {
      console.warn('Moralis transactions failed:', error);
    }

    return results;
  }

  /**
   * Query The Graph Protocol
   */
  async queryTheGraph(subgraph, query) {
    const api = this.config.getAPI('thegraph');
    const url = `${api.config.baseUrl}/${subgraph}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL query failed: ${data.errors[0].message}`);
    }

    return data.data;
  }

  /**
   * Get technical indicators
   */
  async getTechnicalIndicators(symbol = 'BTC', indicator = 'RSI') {
    if (!this.config.get('apis.alphavantage.key')) {
      console.warn('Alpha Vantage API key not configured for technical indicators');
      return null;
    }

    try {
      const data = await this.apiRequest('alphavantage', '', {
        function: indicator,
        symbol: `${symbol}USD`,
        interval: 'daily',
        time_period: 14,
        series_type: 'close',
        apikey: this.config.get('apis.alphavantage.key')
      });

      return data;
      
    } catch (error) {
      console.error('Technical indicators failed:', error);
      return null;
    }
  }

  /**
   * Start real-time price streams
   */
  startPriceStreams() {
    // Update popular coins every 30 seconds
    const priceInterval = setInterval(async () => {
      try {
        const prices = await this.getPrices(['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']);
        this.emit('pricesUpdated', prices);
      } catch (error) {
        console.warn('Price stream update failed:', error);
      }
    }, 30000);

    this.intervals.set('prices', priceInterval);

    // Update Fear & Greed Index every hour
    const fgInterval = setInterval(async () => {
      try {
        const fgIndex = await this.getFearGreedIndex();
        if (fgIndex) {
          this.emit('fearGreedUpdated', fgIndex);
        }
      } catch (error) {
        console.warn('Fear & Greed update failed:', error);
      }
    }, 3600000);

    this.intervals.set('feargreed', fgInterval);
  }

  /**
   * Stop price streams
   */
  stopPriceStreams() {
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`Stopped ${name} stream`);
    });
    this.intervals.clear();
  }

  /**
   * Aggregate price data from multiple sources
   */
  aggregatePriceData(sources, symbols) {
    const aggregated = {};

    symbols.forEach(symbol => {
      const prices = [];
      const volumes = [];
      const marketCaps = [];
      const changes24h = [];

      Object.entries(sources).forEach(([source, data]) => {
        if (data && data[symbol]) {
          const coinData = data[symbol];
          if (coinData.usd || coinData.priceUsd) {
            prices.push(parseFloat(coinData.usd || coinData.priceUsd));
          }
          if (coinData.usd_24h_vol || coinData.volumeUsd24Hr) {
            volumes.push(parseFloat(coinData.usd_24h_vol || coinData.volumeUsd24Hr));
          }
          if (coinData.usd_market_cap || coinData.marketCapUsd) {
            marketCaps.push(parseFloat(coinData.usd_market_cap || coinData.marketCapUsd));
          }
          if (coinData.usd_24h_change || coinData.changePercent24Hr) {
            changes24h.push(parseFloat(coinData.usd_24h_change || coinData.changePercent24Hr));
          }
        }
      });

      if (prices.length > 0) {
        aggregated[symbol] = {
          price: this.calculateMedian(prices),
          volume24h: volumes.length > 0 ? this.calculateMedian(volumes) : null,
          marketCap: marketCaps.length > 0 ? this.calculateMedian(marketCaps) : null,
          change24h: changes24h.length > 0 ? this.calculateMedian(changes24h) : null,
          sources: Object.keys(sources),
          timestamp: Date.now()
        };
      }
    });

    return aggregated;
  }

  /**
   * Calculate median value
   */
  calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Format historical data
   */
  formatHistoricalData(data) {
    if (!data.Data || !data.Data.Data) return [];
    
    return data.Data.Data.map(point => ({
      timestamp: point.time * 1000,
      date: new Date(point.time * 1000),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volumeto
    }));
  }

  /**
   * Format CoinGecko historical data
   */
  formatCoinGeckoHistorical(data) {
    if (!data.prices) return [];
    
    return data.prices.map((point, index) => ({
      timestamp: point[0],
      date: new Date(point[0]),
      close: point[1],
      volume: data.total_volumes[index] ? data.total_volumes[index][1] : 0
    }));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
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
        console.error(`Error in crypto data event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopPriceStreams();
    this.clearCache();
    this.listeners = {};
    console.log('Crypto data manager destroyed');
  }
}

// Export for global use
window.JagCodeCryptoData = JagCodeCryptoData;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JagCodeCryptoData;
}
