import { User, UserRegistration } from '../models/User';
export declare const COLLECTIONS: {
    readonly USERS: "68a3b34a00375e270b15";
    readonly PORTFOLIO: "68a3b3e2000dcc682c12";
    readonly TRANSACTIONS: "68a3b41400346ff40705";
    readonly ACTIVITY: "68a3b43e001c44090ac6";
    readonly SETTINGS: "68a3b463003bb9695087";
};
export declare class DatabaseService {
    private client;
    private databases;
    private databaseId;
    constructor();
    registerUser(userData: UserRegistration): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUserStats(userId: string, stats: Partial<User['stats']>): Promise<void>;
    registerPortfolioItem(userId: string, portfolioData: {
        asset_type: 'crypto' | 'nft' | 'token';
        symbol: string;
        name: string;
        amount: number;
        value_usd: number;
        wallet_address: string;
        contract_address?: string;
        token_id?: string;
    }): Promise<string>;
    registerTransaction(userId: string, transactionData: {
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
    }): Promise<string>;
    logActivity(userId: string, activityData: {
        type: 'login' | 'mining_start' | 'mining_stop' | 'nft_found' | 'trade_executed' | 'profit_withdrawal' | 'system_alert';
        description: string;
        metadata?: any;
    }): Promise<string>;
    updateUserSettings(userId: string, settings: {
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
    }): Promise<string>;
    registerMiningSession(userId: string, sessionData: {
        currency: string;
        hash_rate: string;
        duration_minutes: number;
        earnings: number;
        power_consumption: string;
        pool?: string;
    }): Promise<string>;
    registerNFTOpportunity(userId: string, opportunityData: {
        contract_address: string;
        token_id?: string;
        collection_name: string;
        floor_price: number;
        estimated_profit: number;
        opportunity_type: 'undervalued' | 'trending' | 'mint' | 'arbitrage';
        marketplace: string;
        confidence_score: number;
    }): Promise<string>;
    getUserDashboard(userId: string): Promise<any>;
}
declare const _default: DatabaseService;
export default _default;
//# sourceMappingURL=databaseService.d.ts.map