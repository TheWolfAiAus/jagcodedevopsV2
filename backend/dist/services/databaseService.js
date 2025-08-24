"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.COLLECTIONS = void 0;
const appwrite_1 = require("appwrite");
const cryptoUtils_1 = __importDefault(require("./cryptoUtils"));
exports.COLLECTIONS = {
    USERS: '68a3b34a00375e270b15',
    PORTFOLIO: '68a3b3e2000dcc682c12',
    TRANSACTIONS: '68a3b41400346ff40705',
    ACTIVITY: '68a3b43e001c44090ac6',
    SETTINGS: '68a3b463003bb9695087'
};
class DatabaseService {
    constructor() {
        this.client = new appwrite_1.Client();
        this.databases = new appwrite_1.Databases(this.client);
        this.databaseId = process.env.APPWRITE_DATABASE_ID || '68a3b34a00375e270b14';
        this.client
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057')
            .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_JAGCODE_API || '');
    }
    async registerUser(userData) {
        try {
            const passwordHash = cryptoUtils_1.default.hashAPIKey(userData.password);
            const user = {
                email: userData.email,
                username: userData.username,
                password_hash: passwordHash,
                api_keys: {},
                wallet_addresses: userData.wallet_address ? [userData.wallet_address] : [],
                preferences: {
                    auto_mining: false,
                    nft_hunting: true,
                    profit_threshold: 0.01,
                    notification_settings: {
                        email: true,
                        push: true,
                        sms: false
                    }
                },
                stats: {
                    total_profits: 0,
                    nft_opportunities_found: 0,
                    successful_trades: 0,
                    mining_sessions: 0
                },
                created_at: new Date(),
                updated_at: new Date(),
                last_active: new Date(),
                is_active: true
            };
            const response = await this.databases.createDocument(this.databaseId, exports.COLLECTIONS.USERS, appwrite_1.ID.unique(), user);
            console.log(`✅ User registered: ${userData.username} (ID: ${response.$id})`);
            return { ...user, id: response.$id };
        }
        catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            const response = await this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.USERS, [appwrite_1.Query.equal('email', email)]);
            if (response.documents.length === 0) {
                return null;
            }
            const doc = response.documents[0];
            return {
                id: doc.$id,
                ...doc
            };
        }
        catch (error) {
            console.error('Error fetching user by email:', error);
            return null;
        }
    }
    async updateUserStats(userId, stats) {
        try {
            const currentUser = await this.databases.getDocument(this.databaseId, exports.COLLECTIONS.USERS, userId);
            const updatedStats = {
                ...currentUser.stats,
                ...stats
            };
            await this.databases.updateDocument(this.databaseId, exports.COLLECTIONS.USERS, userId, {
                stats: updatedStats,
                updated_at: new Date(),
                last_active: new Date()
            });
            console.log(`📊 Updated stats for user ${userId}`);
        }
        catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }
    async registerPortfolioItem(userId, portfolioData) {
        try {
            const portfolioItem = {
                user_id: userId,
                ...portfolioData,
                created_at: new Date(),
                updated_at: new Date()
            };
            const response = await this.databases.createDocument(this.databaseId, exports.COLLECTIONS.PORTFOLIO, appwrite_1.ID.unique(), portfolioItem);
            console.log(`💼 Portfolio item registered: ${portfolioData.symbol} for user ${userId}`);
            return response.$id;
        }
        catch (error) {
            console.error('Error registering portfolio item:', error);
            throw error;
        }
    }
    async registerTransaction(userId, transactionData) {
        try {
            const transaction = {
                user_id: userId,
                ...transactionData,
                profit_loss: transactionData.type === 'sell' ?
                    transactionData.total_value - (transactionData.amount * transactionData.price_usd) : 0,
                created_at: new Date(),
                status: 'completed'
            };
            const response = await this.databases.createDocument(this.databaseId, exports.COLLECTIONS.TRANSACTIONS, appwrite_1.ID.unique(), transaction);
            if (transactionData.type === 'sell' && transaction.profit_loss > 0) {
                await this.updateUserStats(userId, {
                    total_profits: transaction.profit_loss,
                    successful_trades: 1
                });
            }
            console.log(`💰 Transaction registered: ${transactionData.type} ${transactionData.amount} ${transactionData.asset_symbol}`);
            return response.$id;
        }
        catch (error) {
            console.error('Error registering transaction:', error);
            throw error;
        }
    }
    async logActivity(userId, activityData) {
        try {
            const activity = {
                user_id: userId,
                ...activityData,
                timestamp: new Date(),
                ip_address: '',
                user_agent: ''
            };
            const response = await this.databases.createDocument(this.databaseId, exports.COLLECTIONS.ACTIVITY, appwrite_1.ID.unique(), activity);
            console.log(`📝 Activity logged: ${activityData.type} for user ${userId}`);
            return response.$id;
        }
        catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }
    async updateUserSettings(userId, settings) {
        try {
            const settingsData = {
                user_id: userId,
                ...settings,
                updated_at: new Date()
            };
            const existingSettings = await this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.SETTINGS, [appwrite_1.Query.equal('user_id', userId)]);
            let response;
            if (existingSettings.documents.length > 0) {
                response = await this.databases.updateDocument(this.databaseId, exports.COLLECTIONS.SETTINGS, existingSettings.documents[0].$id, settingsData);
            }
            else {
                response = await this.databases.createDocument(this.databaseId, exports.COLLECTIONS.SETTINGS, appwrite_1.ID.unique(), {
                    ...settingsData,
                    created_at: new Date()
                });
            }
            console.log(`⚙️ Settings updated for user ${userId}`);
            return response.$id;
        }
        catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
    async registerMiningSession(userId, sessionData) {
        try {
            await this.logActivity(userId, {
                type: 'mining_start',
                description: `Started mining ${sessionData.currency} at ${sessionData.hash_rate}`,
                metadata: sessionData
            });
            if (sessionData.earnings > 0) {
                await this.registerTransaction(userId, {
                    type: 'mine',
                    asset_symbol: sessionData.currency,
                    amount: sessionData.earnings,
                    price_usd: 1,
                    total_value: sessionData.earnings,
                    fee: 0,
                    wallet_address: 'mining_pool',
                    notes: `Mining session: ${sessionData.duration_minutes}min at ${sessionData.hash_rate}`
                });
            }
            await this.updateUserStats(userId, {
                mining_sessions: 1,
                total_profits: sessionData.earnings
            });
            console.log(`⛏️ Mining session registered for user ${userId}: ${sessionData.earnings} ${sessionData.currency}`);
            return 'mining_session_logged';
        }
        catch (error) {
            console.error('Error registering mining session:', error);
            throw error;
        }
    }
    async registerNFTOpportunity(userId, opportunityData) {
        try {
            await this.logActivity(userId, {
                type: 'nft_found',
                description: `Found NFT opportunity: ${opportunityData.collection_name} - Estimated profit: ${opportunityData.estimated_profit}`,
                metadata: opportunityData
            });
            await this.updateUserStats(userId, {
                nft_opportunities_found: 1
            });
            console.log(`🎨 NFT opportunity registered for user ${userId}: ${opportunityData.collection_name}`);
            return 'nft_opportunity_logged';
        }
        catch (error) {
            console.error('Error registering NFT opportunity:', error);
            throw error;
        }
    }
    async getUserDashboard(userId) {
        try {
            const [user, portfolio, recentTransactions, recentActivity, settings] = await Promise.all([
                this.databases.getDocument(this.databaseId, exports.COLLECTIONS.USERS, userId),
                this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.PORTFOLIO, [
                    appwrite_1.Query.equal('user_id', userId),
                    appwrite_1.Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.TRANSACTIONS, [
                    appwrite_1.Query.equal('user_id', userId),
                    appwrite_1.Query.orderDesc('created_at'),
                    appwrite_1.Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.ACTIVITY, [
                    appwrite_1.Query.equal('user_id', userId),
                    appwrite_1.Query.orderDesc('timestamp'),
                    appwrite_1.Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, exports.COLLECTIONS.SETTINGS, [
                    appwrite_1.Query.equal('user_id', userId),
                    appwrite_1.Query.limit(1)
                ])
            ]);
            return {
                user: { id: user.$id, ...user },
                portfolio: portfolio.documents,
                recent_transactions: recentTransactions.documents,
                recent_activity: recentActivity.documents,
                settings: settings.documents[0] || null,
                summary: {
                    total_portfolio_value: portfolio.documents.reduce((sum, item) => sum + item.value_usd, 0),
                    total_profits: user.stats?.total_profits || 0,
                    active_mining: user.preferences?.auto_mining || false,
                    nft_hunting: user.preferences?.nft_hunting || false
                }
            };
        }
        catch (error) {
            console.error('Error fetching user dashboard:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.default = new DatabaseService();
//# sourceMappingURL=databaseService.js.map