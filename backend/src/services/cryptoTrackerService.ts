import {EventEmitter} from 'events';
import databaseService from './databaseService';

interface CryptoPriceData {
    symbol: string;
    name: string;
    currentPrice: number;
    priceChangePercent24h: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    totalSupply?: number;
    ath: number;
    athPercent: number;
    lastUpdated: Date;
}

interface PriceAlert {
    id: string;
    userId: string;
    symbol: string;
    alertType: 'above' | 'below' | 'percent_change';
    targetValue: number;
    currentValue: number;
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}

interface MarketTrend {
    symbol: string;
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 1-10
    indicators: string[];
    prediction: string;
    confidence: number; // 0-100
}

export class CryptoTrackerService extends EventEmitter {
    private prices: Map<string, CryptoPriceData> = new Map();
    private alerts: Map<string, PriceAlert> = new Map();
    private isRunning = false;
    private currentUserId: string | null = null;
    private updateInterval?: NodeJS.Timeout;
    private alertInterval?: NodeJS.Timeout;

    private readonly trackedCoins = [
        'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
        'polkadot', 'chainlink', 'litecoin', 'bitcoin-cash', 'stellar',
        'uniswap', 'aave', 'compound-coin', 'maker', 'sushiswap-token'
    ];

    constructor() {
        super();
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async start(): Promise<void> {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('📊 Starting crypto tracker service...');

        // Initial price fetch
        await this.fetchAllPrices();

        // Set up regular price updates every 30 seconds
        this.updateInterval = setInterval(async () => {
            await this.fetchAllPrices();
        }, 30000);

        // Set up alert checking every 10 seconds
        this.alertInterval = setInterval(async () => {
            await this.checkPriceAlerts();
        }, 10000);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto tracker service started'
            });
        }

        this.emit('trackerStarted');
    }

    async stop(): Promise<void> {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }

        if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = undefined;
        }

        console.log('📊 Crypto tracker service stopped');

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Crypto tracker service stopped'
            });
        }

        this.emit('trackerStopped');
    }

    private async fetchAllPrices(): Promise<void> {
        try {
            const coinIds = this.trackedCoins.join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
            );

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }

            const data = await response.json();

            for (const coin of data) {
                const priceData: CryptoPriceData = {
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    currentPrice: coin.current_price,
                    priceChangePercent24h: coin.price_change_percentage_24h || 0,
                    priceChange24h: coin.price_change_24h || 0,
                    marketCap: coin.market_cap || 0,
                    volume24h: coin.total_volume || 0,
                    circulatingSupply: coin.circulating_supply || 0,
                    totalSupply: coin.total_supply,
                    ath: coin.ath || coin.current_price,
                    athPercent: coin.ath_change_percentage || 0,
                    lastUpdated: new Date()
                };

                this.prices.set(coin.symbol.toUpperCase(), priceData);
                
                // Emit price update event
                this.emit('priceUpdated', priceData);
            }

            console.log(`📊 Updated prices for ${data.length} cryptocurrencies`);
        } catch (error) {
            console.error('Error fetching crypto prices:', error);
            this.emit('fetchError', error);
        }
    }

    async getPriceData(symbol?: string): Promise<CryptoPriceData | CryptoPriceData[]> {
        if (symbol) {
            const data = this.prices.get(symbol.toUpperCase());
            if (!data) {
                throw new Error(`Price data not available for ${symbol}`);
            }
            return data;
        }

        return Array.from(this.prices.values());
    }

    async addPriceAlert(userId: string, symbol: string, alertType: 'above' | 'below' | 'percent_change', targetValue: number): Promise<string> {
        const alertId = `${userId}_${symbol}_${Date.now()}`;
        const currentData = this.prices.get(symbol.toUpperCase());
        
        if (!currentData) {
            throw new Error(`Cannot create alert for unsupported coin: ${symbol}`);
        }

        const alert: PriceAlert = {
            id: alertId,
            userId,
            symbol: symbol.toUpperCase(),
            alertType,
            targetValue,
            currentValue: currentData.currentPrice,
            isActive: true,
            createdAt: new Date()
        };

        this.alerts.set(alertId, alert);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'price_alert_created',
                description: `Created ${alertType} price alert for ${symbol.toUpperCase()}`,
                metadata: {
                    symbol: symbol.toUpperCase(),
                    alert_type: alertType,
                    target_value: targetValue,
                    current_price: currentData.currentPrice
                }
            });
        }

        console.log(`🔔 Created price alert for ${symbol.toUpperCase()}: ${alertType} $${targetValue}`);
        return alertId;
    }

    async removePriceAlert(alertId: string): Promise<boolean> {
        const alert = this.alerts.get(alertId);
        if (!alert) return false;

        this.alerts.delete(alertId);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'price_alert_removed',
                description: `Removed price alert for ${alert.symbol}`,
                metadata: {
                    alert_id: alertId,
                    symbol: alert.symbol
                }
            });
        }

        console.log(`🔔 Removed price alert for ${alert.symbol}`);
        return true;
    }

    getUserAlerts(userId: string): PriceAlert[] {
        return Array.from(this.alerts.values()).filter(alert => alert.userId === userId);
    }

    private async checkPriceAlerts(): Promise<void> {
        for (const alert of this.alerts.values()) {
            if (!alert.isActive) continue;

            const currentData = this.prices.get(alert.symbol);
            if (!currentData) continue;

            let shouldTrigger = false;

            switch (alert.alertType) {
                case 'above':
                    shouldTrigger = currentData.currentPrice >= alert.targetValue;
                    break;
                case 'below':
                    shouldTrigger = currentData.currentPrice <= alert.targetValue;
                    break;
                case 'percent_change':
                    shouldTrigger = Math.abs(currentData.priceChangePercent24h) >= alert.targetValue;
                    break;
            }

            if (shouldTrigger) {
                await this.triggerAlert(alert, currentData);
            }
        }
    }

    private async triggerAlert(alert: PriceAlert, currentData: CryptoPriceData): Promise<void> {
        alert.isActive = false;
        alert.triggeredAt = new Date();

        console.log(`🚨 PRICE ALERT TRIGGERED: ${alert.symbol} ${alert.alertType} $${alert.targetValue}`);
        console.log(`📊 Current price: $${currentData.currentPrice}`);

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'price_alert_triggered',
                description: `Price alert triggered for ${alert.symbol}`,
                metadata: {
                    alert_id: alert.id,
                    symbol: alert.symbol,
                    alert_type: alert.alertType,
                    target_value: alert.targetValue,
                    current_price: currentData.currentPrice,
                    price_change_24h: currentData.priceChangePercent24h
                }
            });
        }

        this.emit('alertTriggered', { alert, currentData });
    }

    async getMarketTrends(): Promise<MarketTrend[]> {
        const trends: MarketTrend[] = [];

        for (const [symbol, data] of this.prices.entries()) {
            const trend = this.analyzeTrend(data);
            trends.push(trend);
        }

        return trends.sort((a, b) => b.confidence - a.confidence);
    }

    private analyzeTrend(data: CryptoPriceData): MarketTrend {
        const indicators: string[] = [];
        let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        let strength = 5;
        let confidence = 50;

        // Price change analysis
        if (data.priceChangePercent24h > 5) {
            trend = 'bullish';
            strength += 2;
            confidence += 20;
            indicators.push('Strong 24h gain');
        } else if (data.priceChangePercent24h < -5) {
            trend = 'bearish';
            strength += 2;
            confidence += 20;
            indicators.push('Strong 24h decline');
        } else if (data.priceChangePercent24h > 0) {
            trend = 'bullish';
            strength += 1;
            confidence += 10;
            indicators.push('Positive 24h movement');
        } else if (data.priceChangePercent24h < 0) {
            trend = 'bearish';
            strength += 1;
            confidence += 10;
            indicators.push('Negative 24h movement');
        }

        // ATH analysis
        if (data.athPercent > -10) {
            indicators.push('Near all-time high');
            confidence += 15;
        } else if (data.athPercent < -50) {
            indicators.push('Significant discount from ATH');
            if (trend === 'bullish') strength += 1;
        }

        // Volume analysis
        if (data.volume24h > data.marketCap * 0.1) {
            indicators.push('High trading volume');
            confidence += 10;
        }

        const prediction = this.generatePrediction(trend, strength, data);

        return {
            symbol: data.symbol,
            trend,
            strength: Math.min(10, Math.max(1, strength)),
            indicators,
            prediction,
            confidence: Math.min(100, Math.max(0, confidence))
        };
    }

    private generatePrediction(trend: 'bullish' | 'bearish' | 'neutral', strength: number, data: CryptoPriceData): string {
        const coinName = data.name;
        const priceChange = data.priceChangePercent24h;

        if (trend === 'bullish') {
            if (strength > 7) {
                return `${coinName} shows strong bullish momentum with ${priceChange.toFixed(2)}% gains. Potential for continued upward movement.`;
            } else {
                return `${coinName} displays moderate bullish signals. Watch for sustained volume and price action.`;
            }
        } else if (trend === 'bearish') {
            if (strength > 7) {
                return `${coinName} shows strong bearish pressure with ${priceChange.toFixed(2)}% decline. Potential for further downside.`;
            } else {
                return `${coinName} shows bearish signals. Monitor support levels and market sentiment.`;
            }
        } else {
            return `${coinName} is consolidating with neutral momentum. Wait for clearer directional signals.`;
        }
    }

    async getTopMovers(): Promise<{ gainers: CryptoPriceData[], losers: CryptoPriceData[] }> {
        const allPrices = Array.from(this.prices.values());
        
        const gainers = allPrices
            .filter(p => p.priceChangePercent24h > 0)
            .sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h)
            .slice(0, 5);

        const losers = allPrices
            .filter(p => p.priceChangePercent24h < 0)
            .sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h)
            .slice(0, 5);

        return { gainers, losers };
    }

    getTrackedCoins(): string[] {
        return Array.from(this.prices.keys());
    }

    isServiceRunning(): boolean {
        return this.isRunning;
    }
}

export default new CryptoTrackerService();