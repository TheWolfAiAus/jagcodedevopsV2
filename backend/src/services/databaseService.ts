import {Client, Databases, ID, Query} from 'appwrite';
import {User, UserRegistration} from '../models/User';
import CryptoUtils from './cryptoUtils';

// Appwrite Collection IDs from your setup
export const COLLECTIONS = {
    USERS: '68a3b34a00375e270b15',
    PORTFOLIO: '68a3b3e2000dcc682c12',
    TRANSACTIONS: '68a3b41400346ff40705',
    ACTIVITY: '68a3b43e001c44090ac6',
    SETTINGS: '68a3b463003bb9695087'
} as const;

export class DatabaseService {
    private client: Client;
    private databases: Databases;
    private databaseId: string;

    constructor() {
        this.client = new Client();
        this.databases = new Databases(this.client);
        this.databaseId = process.env.APPWRITE_DATABASE_ID || '68a3b34a00375e270b14';

        // Initialize Appwrite client
        this.client
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID || '68a36f6c002bfc1e6057')
            .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_JAGCODE_API || '');
    }

    // User Management
    async registerUser(userData: UserRegistration): Promise<User> {
        try {
            // Hash password
            const passwordHash = CryptoUtils.hashAPIKey(userData.password);

            const user: Omit<User, 'id'> = {
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

            const response = await this.databases.createDocument(
                this.databaseId,
                COLLECTIONS.USERS,
                ID.unique(),
                user
            );

            console.log(`✅ User registered: ${userData.username} (ID: ${response.$id})`);
            return { ...user, id: response.$id };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                COLLECTIONS.USERS,
                [Query.equal('email', email)]
            );

            if (response.documents.length === 0) {
                return null;
            }

            const doc = response.documents[0];
            return {
                id: doc.$id,
                ...doc
            } as User;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            return null;
        }
    }

    async updateUserStats(userId: string, stats: Partial<User['stats']>): Promise<void> {
        try {
            const currentUser = await this.databases.getDocument(
                this.databaseId,
                COLLECTIONS.USERS,
                userId
            );

            const updatedStats = {
                ...currentUser.stats,
                ...stats
            };

            await this.databases.updateDocument(
                this.databaseId,
                COLLECTIONS.USERS,
                userId,
                {
                    stats: updatedStats,
                    updated_at: new Date(),
                    last_active: new Date()
                }
            );

            console.log(`📊 Updated stats for user ${userId}`);
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }

    // Portfolio Management
    async registerPortfolioItem(userId: string, portfolioData: {
        asset_type: 'crypto' | 'nft' | 'token';
        symbol: string;
        name: string;
        amount: number;
        value_usd: number;
        wallet_address: string;
        contract_address?: string;
        token_id?: string;
    }): Promise<string> {
        try {
            const portfolioItem = {
                user_id: userId,
                ...portfolioData,
                created_at: new Date(),
                updated_at: new Date()
            };

            const response = await this.databases.createDocument(
                this.databaseId,
                COLLECTIONS.PORTFOLIO,
                ID.unique(),
                portfolioItem
            );

            console.log(`💼 Portfolio item registered: ${portfolioData.symbol} for user ${userId}`);
            return response.$id;
        } catch (error) {
            console.error('Error registering portfolio item:', error);
            throw error;
        }
    }

    // Transaction Registration
    async registerTransaction(userId: string, transactionData: {
        type: 'buy' | 'sell' | 'mine' | 'stake' | 'swap' | 'nft_mint' | 'nft_trade';
        asset_symbol: string;
        amount: number;
        price_usd: number;
        total_value: number;
        fee: number;
        wallet_address: string;
        transaction_hash?: string;
        exchange?: string;
        notes?: string;
    }): Promise<string> {
        try {
            const transaction = {
                user_id: userId,
                ...transactionData,
                profit_loss: transactionData.type === 'sell' ? 
                    transactionData.total_value - (transactionData.amount * transactionData.price_usd) : 0,
                created_at: new Date(),
                status: 'completed'
            };

            const response = await this.databases.createDocument(
                this.databaseId,
                COLLECTIONS.TRANSACTIONS,
                ID.unique(),
                transaction
            );

            // Update user stats
            if (transactionData.type === 'sell' && transaction.profit_loss > 0) {
                await this.updateUserStats(userId, {
                    total_profits: transaction.profit_loss,
                    successful_trades: 1
                });
            }

            console.log(`💰 Transaction registered: ${transactionData.type} ${transactionData.amount} ${transactionData.asset_symbol}`);
            return response.$id;
        } catch (error) {
            console.error('Error registering transaction:', error);
            throw error;
        }
    }

    // Activity Logging
    async logActivity(userId: string, activityData: {
        type: 'login' | 'mining_start' | 'mining_stop' | 'nft_found' | 'trade_executed' | 'profit_withdrawal' | 'system_alert';
        description: string;
        metadata?: any;
    }): Promise<string> {
        try {
            const activity = {
                user_id: userId,
                ...activityData,
                timestamp: new Date(),
                ip_address: '', // You can capture this from request
                user_agent: ''  // You can capture this from request
            };

            const response = await this.databases.createDocument(
                this.databaseId,
                COLLECTIONS.ACTIVITY,
                ID.unique(),
                activity
            );

            console.log(`📝 Activity logged: ${activityData.type} for user ${userId}`);
            return response.$id;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    // Settings Management
    async updateUserSettings(userId: string, settings: {
        auto_mining?: boolean;
        nft_hunting?: boolean;
        profit_threshold?: number;
        notification_settings?: {
            email?: boolean;
            push?: boolean;
            sms?: boolean;
        };
        trading_settings?: {
            max_trade_amount?: number;
            risk_level?: 'low' | 'medium' | 'high';
            auto_trade?: boolean;
        };
    }): Promise<string> {
        try {
            const settingsData = {
                user_id: userId,
                ...settings,
                updated_at: new Date()
            };

            // Try to get existing settings first
            const existingSettings = await this.databases.listDocuments(
                this.databaseId,
                COLLECTIONS.SETTINGS,
                [Query.equal('user_id', userId)]
            );

            let response;
            if (existingSettings.documents.length > 0) {
                // Update existing settings
                response = await this.databases.updateDocument(
                    this.databaseId,
                    COLLECTIONS.SETTINGS,
                    existingSettings.documents[0].$id,
                    settingsData
                );
            } else {
                // Create new settings
                response = await this.databases.createDocument(
                    this.databaseId,
                    COLLECTIONS.SETTINGS,
                    ID.unique(),
                    {
                        ...settingsData,
                        created_at: new Date()
                    }
                );
            }

            console.log(`⚙️ Settings updated for user ${userId}`);
            return response.$id;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    // Mining Session Registration
    async registerMiningSession(userId: string, sessionData: {
        currency: string;
        hash_rate: string;
        duration_minutes: number;
        earnings: number;
        power_consumption: string;
        pool?: string;
    }): Promise<string> {
        try {
            // Log as activity
            await this.logActivity(userId, {
                type: 'mining_start',
                description: `Started mining ${sessionData.currency} at ${sessionData.hash_rate}`,
                metadata: sessionData
            });

            // Register as transaction if there are earnings
            if (sessionData.earnings > 0) {
                await this.registerTransaction(userId, {
                    type: 'mine',
                    asset_symbol: sessionData.currency,
                    amount: sessionData.earnings,
                    price_usd: 1, // You'd get actual price from an API
                    total_value: sessionData.earnings,
                    fee: 0,
                    wallet_address: 'mining_pool',
                    notes: `Mining session: ${sessionData.duration_minutes}min at ${sessionData.hash_rate}`
                });
            }

            // Update user stats
            await this.updateUserStats(userId, {
                mining_sessions: 1,
                total_profits: sessionData.earnings
            });

            console.log(`⛏️ Mining session registered for user ${userId}: ${sessionData.earnings} ${sessionData.currency}`);
            return 'mining_session_logged';
        } catch (error) {
            console.error('Error registering mining session:', error);
            throw error;
        }
    }

    // NFT Opportunity Registration
    async registerNFTOpportunity(userId: string, opportunityData: {
        contract_address: string;
        token_id?: string;
        collection_name: string;
        floor_price: number;
        estimated_profit: number;
        opportunity_type: 'undervalued' | 'trending' | 'mint' | 'arbitrage';
        marketplace: string;
        confidence_score: number;
    }): Promise<string> {
        try {
            // Log as activity
            await this.logActivity(userId, {
                type: 'nft_found',
                description: `Found NFT opportunity: ${opportunityData.collection_name} - Estimated profit: ${opportunityData.estimated_profit}`,
                metadata: opportunityData
            });

            // Update user stats
            await this.updateUserStats(userId, {
                nft_opportunities_found: 1
            });

            console.log(`🎨 NFT opportunity registered for user ${userId}: ${opportunityData.collection_name}`);
            return 'nft_opportunity_logged';
        } catch (error) {
            console.error('Error registering NFT opportunity:', error);
            throw error;
        }
    }

    // Get user dashboard data
    async getUserDashboard(userId: string): Promise<any> {
        try {
            const [user, portfolio, recentTransactions, recentActivity, settings] = await Promise.all([
                this.databases.getDocument(this.databaseId, COLLECTIONS.USERS, userId),
                this.databases.listDocuments(this.databaseId, COLLECTIONS.PORTFOLIO, [
                    Query.equal('user_id', userId),
                    Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, COLLECTIONS.TRANSACTIONS, [
                    Query.equal('user_id', userId),
                    Query.orderDesc('created_at'),
                    Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, COLLECTIONS.ACTIVITY, [
                    Query.equal('user_id', userId),
                    Query.orderDesc('timestamp'),
                    Query.limit(10)
                ]),
                this.databases.listDocuments(this.databaseId, COLLECTIONS.SETTINGS, [
                    Query.equal('user_id', userId),
                    Query.limit(1)
                ])
            ]);

            return {
                user: { id: user.$id, ...user },
                portfolio: portfolio.documents,
                recent_transactions: recentTransactions.documents,
                recent_activity: recentActivity.documents,
                settings: settings.documents[0] || null,
                summary: {
                    total_portfolio_value: portfolio.documents.reduce((sum: number, item: any) => sum + item.value_usd, 0),
                    total_profits: user.stats?.total_profits || 0,
                    active_mining: user.preferences?.auto_mining || false,
                    nft_hunting: user.preferences?.nft_hunting || false
                }
            };
        } catch (error) {
            console.error('Error fetching user dashboard:', error);
            throw error;
        }
    }
}

export default new DatabaseService();