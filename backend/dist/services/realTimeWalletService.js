"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeWalletService = void 0;
const events_1 = require("events");
const ethers_1 = require("ethers");
const web3_1 = __importDefault(require("web3"));
const databaseService_1 = __importDefault(require("./databaseService"));
class RealTimeWalletService extends events_1.EventEmitter {
    constructor() {
        super();
        this.monitoringWallets = new Map();
        this.currentUserId = null;
        this.isRunning = false;
        this.updateInterval = 10000;
        this.priceCache = new Map();
        this.tokenContracts = {
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            USDC: '0xA0b86a33E6E1DCC1D5E9A8c5E3e4c3c5d5F6D7E8',
            WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
        };
        const rpcUrls = [
            'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
            'https://mainnet.infura.io/v3/your-project-id',
            'https://eth-mainnet.public.blastapi.io',
            'https://ethereum.publicnode.com'
        ];
        this.web3 = new web3_1.default(rpcUrls[2]);
        this.ethersProvider = new ethers_1.ethers.JsonRpcProvider(rpcUrls[2]);
        this.startPriceUpdateService();
    }
    setCurrentUser(userId) {
        this.currentUserId = userId;
    }
    async startMonitoring() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log('🔄 Real-time wallet monitoring started');
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Real-time wallet monitoring service started'
            });
        }
        this.emit('monitoringStarted');
    }
    async stopMonitoring() {
        this.isRunning = false;
        for (const [address, interval] of this.monitoringWallets.entries()) {
            clearInterval(interval);
            console.log(`⏹️ Stopped monitoring wallet: ${address}`);
        }
        this.monitoringWallets.clear();
        console.log('⏹️ Real-time wallet monitoring stopped');
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Real-time wallet monitoring service stopped'
            });
        }
        this.emit('monitoringStopped');
    }
    async addWalletToMonitor(address) {
        if (!ethers_1.ethers.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }
        if (this.monitoringWallets.has(address)) {
            console.log(`⚠️ Wallet ${address} is already being monitored`);
            return;
        }
        await this.fetchWalletData(address);
        const interval = setInterval(async () => {
            try {
                await this.fetchWalletData(address);
            }
            catch (error) {
                console.error(`Error monitoring wallet ${address}:`, error);
                this.emit('walletError', { address, error });
            }
        }, this.updateInterval);
        this.monitoringWallets.set(address, interval);
        console.log(`📊 Started monitoring wallet: ${address}`);
        if (this.currentUserId) {
            await databaseService_1.default.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Added wallet ${address} to real-time monitoring`,
                metadata: { wallet_address: address }
            });
        }
        this.emit('walletAdded', { address });
    }
    async removeWalletFromMonitor(address) {
        const interval = this.monitoringWallets.get(address);
        if (interval) {
            clearInterval(interval);
            this.monitoringWallets.delete(address);
            console.log(`❌ Removed wallet from monitoring: ${address}`);
            if (this.currentUserId) {
                await databaseService_1.default.logActivity(this.currentUserId, {
                    type: 'system_alert',
                    description: `Removed wallet ${address} from monitoring`,
                    metadata: { wallet_address: address }
                });
            }
            this.emit('walletRemoved', { address });
        }
    }
    async fetchWalletData(address) {
        try {
            const [ethBalance, tokenBalances, recentTransactions] = await Promise.all([
                this.getETHBalance(address),
                this.getTokenBalances(address),
                this.getRecentTransactions(address, 10)
            ]);
            const totalValueUSD = ethBalance.balanceUSD +
                tokenBalances.reduce((sum, token) => sum + token.valueUSD, 0);
            const walletData = {
                address,
                ethBalance,
                tokenBalances,
                transactions: recentTransactions,
                totalValueUSD,
                lastUpdated: new Date()
            };
            this.emit('walletDataUpdated', walletData);
            if (this.currentUserId) {
                await this.updateDatabasePortfolio(walletData);
            }
            return walletData;
        }
        catch (error) {
            console.error(`Error fetching wallet data for ${address}:`, error);
            throw error;
        }
    }
    async getETHBalance(address) {
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
    async getTokenBalances(address) {
        const balances = [];
        for (const [symbol, contractAddress] of Object.entries(this.tokenContracts)) {
            try {
                const balance = await this.getERC20Balance(address, contractAddress);
                if (parseFloat(balance.balance) > 0) {
                    balances.push(balance);
                }
            }
            catch (error) {
                console.warn(`Failed to get ${symbol} balance:`, error);
            }
        }
        return balances;
    }
    async getERC20Balance(walletAddress, contractAddress) {
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
            symbol: symbol,
            name: name,
            balance: formattedBalance,
            decimals: Number(decimals),
            valueUSD
        };
    }
    async getRecentTransactions(address, count = 10) {
        try {
            const latestBlock = await this.web3.eth.getBlockNumber();
            const transactions = [];
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
                            if (transactions.length >= count)
                                break;
                        }
                    }
                }
            }
            return transactions.slice(0, count);
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }
    async getTokenPrice(tokenId) {
        const cacheKey = tokenId.toLowerCase();
        const cached = this.priceCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) {
            return cached.price;
        }
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
            const data = await response.json();
            const price = data[tokenId]?.usd || 0;
            this.priceCache.set(cacheKey, { price, timestamp: Date.now() });
            return price;
        }
        catch (error) {
            console.error(`Error fetching price for ${tokenId}:`, error);
            return cached?.price || 0;
        }
    }
    startPriceUpdateService() {
        setInterval(async () => {
            const tokens = ['ethereum', 'tether', 'usd-coin', 'chainlink', 'uniswap'];
            for (const token of tokens) {
                try {
                    await this.getTokenPrice(token);
                }
                catch (error) {
                    console.error(`Error updating price for ${token}:`, error);
                }
            }
        }, 300000);
    }
    async updateDatabasePortfolio(walletData) {
        if (!this.currentUserId)
            return;
        try {
            if (parseFloat(walletData.ethBalance.balance) > 0) {
                await databaseService_1.default.registerPortfolioItem(this.currentUserId, {
                    asset_type: 'crypto',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    amount: parseFloat(walletData.ethBalance.balance),
                    value_usd: walletData.ethBalance.balanceUSD,
                    wallet_address: walletData.address
                });
            }
            for (const token of walletData.tokenBalances) {
                if (parseFloat(token.balance) > 0) {
                    await databaseService_1.default.registerPortfolioItem(this.currentUserId, {
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
            for (const tx of walletData.transactions) {
                if (parseFloat(tx.value) > 0) {
                    await databaseService_1.default.registerTransaction(this.currentUserId, {
                        type: tx.type === 'sent' ? 'sell' : 'buy',
                        asset_symbol: 'ETH',
                        amount: parseFloat(tx.value),
                        price_usd: tx.valueUSD / parseFloat(tx.value) || 0,
                        total_value: tx.valueUSD,
                        fee: 0,
                        wallet_address: walletData.address,
                        transaction_hash: tx.hash,
                        notes: `Real-time wallet transaction - ${tx.type}`
                    });
                }
            }
        }
        catch (error) {
            console.error('Error updating database portfolio:', error);
        }
    }
    async getWalletSnapshot(address) {
        return this.fetchWalletData(address);
    }
    getMonitoredWallets() {
        return Array.from(this.monitoringWallets.keys());
    }
    setUpdateInterval(intervalMs) {
        if (intervalMs < 5000) {
            throw new Error('Update interval cannot be less than 5 seconds to avoid rate limiting');
        }
        this.updateInterval = intervalMs;
        console.log(`⏱️ Update interval set to ${intervalMs}ms`);
    }
    async detectLargeTransactions(address, thresholdUSD = 10000) {
        const walletData = await this.fetchWalletData(address);
        return walletData.transactions.filter(tx => tx.valueUSD >= thresholdUSD);
    }
    async getPortfolioSummary(addresses) {
        const summary = {
            totalValue: 0,
            assetBreakdown: {},
            lastUpdated: new Date()
        };
        for (const address of addresses) {
            try {
                const walletData = await this.fetchWalletData(address);
                summary.totalValue += walletData.totalValueUSD;
                if (!summary.assetBreakdown.ETH) {
                    summary.assetBreakdown.ETH = { amount: 0, valueUSD: 0 };
                }
                summary.assetBreakdown.ETH.amount += parseFloat(walletData.ethBalance.balance);
                summary.assetBreakdown.ETH.valueUSD += walletData.ethBalance.balanceUSD;
                for (const token of walletData.tokenBalances) {
                    if (!summary.assetBreakdown[token.symbol]) {
                        summary.assetBreakdown[token.symbol] = { amount: 0, valueUSD: 0 };
                    }
                    summary.assetBreakdown[token.symbol].amount += parseFloat(token.balance);
                    summary.assetBreakdown[token.symbol].valueUSD += token.valueUSD;
                }
            }
            catch (error) {
                console.error(`Error processing wallet ${address}:`, error);
            }
        }
        return summary;
    }
}
exports.RealTimeWalletService = RealTimeWalletService;
exports.default = new RealTimeWalletService();
//# sourceMappingURL=realTimeWalletService.js.map