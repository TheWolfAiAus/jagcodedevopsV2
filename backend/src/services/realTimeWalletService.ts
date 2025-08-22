import {EventEmitter} from 'events';
import {ethers} from 'ethers';
import Web3 from 'web3';
import databaseService from './databaseService';

interface WalletBalance {
    address: string;
    balance: string;
    balanceUSD: number;
    currency: string;
    lastUpdated: Date;
}

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    valueUSD: number;
    gas: string;
    gasPrice: string;
    gasUsed?: string;
    timestamp: Date;
    blockNumber: number;
    status: 'pending' | 'confirmed' | 'failed';
    type: 'sent' | 'received';
}

interface TokenBalance {
    contractAddress: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    valueUSD: number;
}

interface WalletData {
    address: string;
    ethBalance: WalletBalance;
    tokenBalances: TokenBalance[];
    transactions: Transaction[];
    totalValueUSD: number;
    lastUpdated: Date;
}

export class RealTimeWalletService extends EventEmitter {
    private web3: Web3;
    private ethersProvider: ethers.JsonRpcProvider;
    private monitoringWallets: Map<string, NodeJS.Timeout> = new Map();
    private currentUserId: string | null = null;
    private isRunning = false;
    private updateInterval = 10000; // 10 seconds
    private priceCache: Map<string, { price: number, timestamp: number }> = new Map();

    // Popular token contracts
    private readonly tokenContracts = {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        USDC: '0xA0b86a33E6E1DCC1D5E9A8c5E3e4c3c5d5F6D7E8',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
    };

    constructor() {
        super();
        
        // Initialize Web3 with multiple RPC endpoints for reliability
        const rpcUrls = [
            'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
            'https://mainnet.infura.io/v3/your-project-id',
            'https://eth-mainnet.public.blastapi.io',
            'https://ethereum.publicnode.com'
        ];

        this.web3 = new Web3(rpcUrls[2]); // Using public endpoint
        this.ethersProvider = new ethers.JsonRpcProvider(rpcUrls[2]);
        
        this.startPriceUpdateService();
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async startMonitoring(): Promise<void> {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🔄 Real-time wallet monitoring started');
        
        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Real-time wallet monitoring service started'
            });
        }
        
        this.emit('monitoringStarted');
    }

    async stopMonitoring(): Promise<void> {
        this.isRunning = false;
        
        // Clear all monitoring intervals
        for (const [address, interval] of this.monitoringWallets.entries()) {
            clearInterval(interval);
            console.log(`⏹️ Stopped monitoring wallet: ${address}`);
        }
        
        this.monitoringWallets.clear();
        console.log('⏹️ Real-time wallet monitoring stopped');
        
        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Real-time wallet monitoring service stopped'
            });
        }
        
        this.emit('monitoringStopped');
    }

    async addWalletToMonitor(address: string): Promise<void> {
        if (!ethers.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        if (this.monitoringWallets.has(address)) {
            console.log(`⚠️ Wallet ${address} is already being monitored`);
            return;
        }

        // Initial data fetch
        await this.fetchWalletData(address);
        
        // Set up real-time monitoring
        const interval = setInterval(async () => {
            try {
                await this.fetchWalletData(address);
            } catch (error) {
                console.error(`Error monitoring wallet ${address}:`, error);
                this.emit('walletError', { address, error });
            }
        }, this.updateInterval);

        this.monitoringWallets.set(address, interval);
        console.log(`📊 Started monitoring wallet: ${address}`);
        
        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Added wallet ${address} to real-time monitoring`,
                metadata: { wallet_address: address }
            });
        }

        this.emit('walletAdded', { address });
    }

    async removeWalletFromMonitor(address: string): Promise<void> {
        const interval = this.monitoringWallets.get(address);
        if (interval) {
            clearInterval(interval);
            this.monitoringWallets.delete(address);
            console.log(`❌ Removed wallet from monitoring: ${address}`);
            
            if (this.currentUserId) {
                await databaseService.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: `Removed wallet ${address} from monitoring`,
                    metadata: { wallet_address: address }
                });
            }
            
            this.emit('walletRemoved', { address });
        }
    }

    private async fetchWalletData(address: string): Promise<WalletData> {
        try {
            const [ethBalance, tokenBalances, recentTransactions] = await Promise.all([
                this.getETHBalance(address),
                this.getTokenBalances(address),
                this.getRecentTransactions(address, 10)
            ]);

            const totalValueUSD = ethBalance.balanceUSD + 
                tokenBalances.reduce((sum, token) => sum + token.valueUSD, 0);

            const walletData: WalletData = {
                address,
                ethBalance,
                tokenBalances,
                transactions: recentTransactions,
                totalValueUSD,
                lastUpdated: new Date()
            };

            // Emit real-time update
            this.emit('walletDataUpdated', walletData);

            // Register portfolio updates in database
            if (this.currentUserId) {
                await this.updateDatabasePortfolio(walletData);
            }

            return walletData;
        } catch (error) {
            console.error(`Error fetching wallet data for ${address}:`, error);
            throw error;
        }
    }

    private async getETHBalance(address: string): Promise<WalletBalance> {
        const balanceWei = await this.web3.eth.getBalance(address);
        const balanceETH = this.web3.utils.fromWei(balanceWei, 'ether');
        const ethPrice = await this.getTokenPrice('ethereum');
        const balanceUSD = parseFloat(balanceETH) * ethPrice;

        return {
            address,
            balance: balanceETH,
            balanceUSD,
            currency: 'ETH',
            lastUpdated: new Date()
        };
    }

    private async getTokenBalances(address: string): Promise<TokenBalance[]> {
        const balances: TokenBalance[] = [];

        for (const [symbol, contractAddress] of Object.entries(this.tokenContracts)) {
            try {
                const balance = await this.getERC20Balance(address, contractAddress);
                if (parseFloat(balance.balance) > 0) {
                    balances.push(balance);
                }
            } catch (error) {
                console.warn(`Failed to get ${symbol} balance:`, error);
            }
        }

        return balances;
    }

    private async getERC20Balance(walletAddress: string, contractAddress: string): Promise<TokenBalance> {
        const minABI = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "decimals",
                outputs: [{ name: "", type: "uint8" }],
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "symbol",
                outputs: [{ name: "", type: "string" }],
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "name",
                outputs: [{ name: "", type: "string" }],
                type: "function"
            }
        ];

        const contract = new this.web3.eth.Contract(minABI, contractAddress);
        
        const [balance, decimals, symbol, name] = await Promise.all([
            contract.methods.balanceOf(walletAddress).call(),
            contract.methods.decimals().call(),
            contract.methods.symbol().call(),
            contract.methods.name().call()
        ]);

        const formattedBalance = (Number(balance) / Math.pow(10, Number(decimals))).toString();
        const tokenPrice = await this.getTokenPrice(symbol.toLowerCase());
        const valueUSD = parseFloat(formattedBalance) * tokenPrice;

        return {
            contractAddress,
            symbol: symbol as string,
            name: name as string,
            balance: formattedBalance,
            decimals: Number(decimals),
            valueUSD
        };
    }

    private async getRecentTransactions(address: string, count: number = 10): Promise<Transaction[]> {
        try {
            // In production, you'd use Etherscan API or similar
            // This is a simplified version
            const latestBlock = await this.web3.eth.getBlockNumber();
            const transactions: Transaction[] = [];

            // Check last 100 blocks for transactions
            for (let i = 0; i < 100 && transactions.length < count; i++) {
                const blockNumber = Number(latestBlock) - i;
                const block = await this.web3.eth.getBlock(blockNumber, true);
                
                if (block && block.transactions) {
                    for (const tx of block.transactions) {
                        if (typeof tx === 'object' && (tx.to === address || tx.from === address)) {
                            const ethPrice = await this.getTokenPrice('ethereum');
                            const valueETH = this.web3.utils.fromWei(tx.value || '0', 'ether');
                            const valueUSD = parseFloat(valueETH) * ethPrice;

                            transactions.push({
                                hash: tx.hash || '',
                                from: tx.from || '',
                                to: tx.to || '',
                                value: valueETH,
                                valueUSD,
                                gas: tx.gas?.toString() || '0',
                                gasPrice: tx.gasPrice?.toString() || '0',
                                timestamp: new Date(Number(block.timestamp) * 1000),
                                blockNumber: Number(blockNumber),
                                status: 'confirmed',
                                type: tx.from === address ? 'sent' : 'received'
                            });

                            if (transactions.length >= count) break;
                        }
                    }
                }
            }

            return transactions.slice(0, count);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }

    private async getTokenPrice(tokenId: string): Promise<number> {
        const cacheKey = tokenId.toLowerCase();
        const cached = this.priceCache.get(cacheKey);
        
        // Return cached price if less than 5 minutes old
        if (cached && Date.now() - cached.timestamp < 300000) {
            return cached.price;
        }

        try {
            // Using CoinGecko API (free tier)
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
            );
            const data = await response.json();
            const price = data[tokenId]?.usd || 0;
            
            this.priceCache.set(cacheKey, { price, timestamp: Date.now() });
            return price;
        } catch (error) {
            console.error(`Error fetching price for ${tokenId}:`, error);
            return cached?.price || 0;
        }
    }

    private startPriceUpdateService(): void {
        // Update all cached prices every 5 minutes
        setInterval(async () => {
            const tokens = ['ethereum', 'tether', 'usd-coin', 'chainlink', 'uniswap'];
            
            for (const token of tokens) {
                try {
                    await this.getTokenPrice(token);
                } catch (error) {
                    console.error(`Error updating price for ${token}:`, error);
                }
            }
        }, 300000); // 5 minutes
    }

    private async updateDatabasePortfolio(walletData: WalletData): Promise<void> {
        if (!this.currentUserId) return;

        try {
            // Register ETH holding
            if (parseFloat(walletData.ethBalance.balance) > 0) {
                await databaseService.registerPortfolioItem(this.currentUserId, {
                    asset_type: 'crypto',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    amount: parseFloat(walletData.ethBalance.balance),
                    value_usd: walletData.ethBalance.balanceUSD,
                    wallet_address: walletData.address
                });
            }

            // Register token holdings
            for (const token of walletData.tokenBalances) {
                if (parseFloat(token.balance) > 0) {
                    await databaseService.registerPortfolioItem(this.currentUserId, {
                        asset_type: 'crypto',
                        symbol: token.symbol,
                        name: token.name,
                        amount: parseFloat(token.balance),
                        value_usd: token.valueUSD,
                        wallet_address: walletData.address,
                        contract_address: token.contractAddress
                    });
                }
            }

            // Register recent transactions
            for (const tx of walletData.transactions) {
                if (parseFloat(tx.value) > 0) {
                    await databaseService.registerTransaction(this.currentUserId, {
                        type: tx.type === 'sent' ? 'sell' : 'buy',
                        asset_symbol: 'ETH',
                        amount: parseFloat(tx.value),
                        price_usd: tx.valueUSD / parseFloat(tx.value) || 0,
                        total_value: tx.valueUSD,
                        fee: 0, // Calculate from gas if needed
                        wallet_address: walletData.address,
                        transaction_hash: tx.hash,
                        notes: `Real-time wallet transaction - ${tx.type}`
                    });
                }
            }
        } catch (error) {
            console.error('Error updating database portfolio:', error);
        }
    }

    // Public methods for getting current data
    async getWalletSnapshot(address: string): Promise<WalletData> {
        return this.fetchWalletData(address);
    }

    getMonitoredWallets(): string[] {
        return Array.from(this.monitoringWallets.keys());
    }

    setUpdateInterval(intervalMs: number): void {
        if (intervalMs < 5000) {
            throw new Error('Update interval cannot be less than 5 seconds to avoid rate limiting');
        }
        this.updateInterval = intervalMs;
        console.log(`⏱️ Update interval set to ${intervalMs}ms`);
    }

    async detectLargeTransactions(address: string, thresholdUSD: number = 10000): Promise<Transaction[]> {
        const walletData = await this.fetchWalletData(address);
        return walletData.transactions.filter(tx => tx.valueUSD >= thresholdUSD);
    }

    async getPortfolioSummary(addresses: string[]): Promise<{
        totalValue: number;
        assetBreakdown: { [symbol: string]: { amount: number; valueUSD: number } };
        lastUpdated: Date;
    }> {
        const summary = {
            totalValue: 0,
            assetBreakdown: {} as { [symbol: string]: { amount: number; valueUSD: number } },
            lastUpdated: new Date()
        };

        for (const address of addresses) {
            try {
                const walletData = await this.fetchWalletData(address);
                summary.totalValue += walletData.totalValueUSD;

                // Add ETH
                if (!summary.assetBreakdown.ETH) {
                    summary.assetBreakdown.ETH = { amount: 0, valueUSD: 0 };
                }
                summary.assetBreakdown.ETH.amount += parseFloat(walletData.ethBalance.balance);
                summary.assetBreakdown.ETH.valueUSD += walletData.ethBalance.balanceUSD;

                // Add tokens
                for (const token of walletData.tokenBalances) {
                    if (!summary.assetBreakdown[token.symbol]) {
                        summary.assetBreakdown[token.symbol] = { amount: 0, valueUSD: 0 };
                    }
                    summary.assetBreakdown[token.symbol].amount += parseFloat(token.balance);
                    summary.assetBreakdown[token.symbol].valueUSD += token.valueUSD;
                }
            } catch (error) {
                console.error(`Error processing wallet ${address}:`, error);
            }
        }

        return summary;
    }
}

export default new RealTimeWalletService();