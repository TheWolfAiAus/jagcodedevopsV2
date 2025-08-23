export interface User {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    api_keys: {
        appwrite_key?: string;
        jagcode_dev_key?: string;
        jagcode_server_key?: string;
    };
    wallet_addresses: string[];
    preferences: {
        auto_mining: boolean;
        nft_hunting: boolean;
        profit_threshold: number;
        notification_settings: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    };
    stats: {
        total_profits: number;
        nft_opportunities_found: number;
        successful_trades: number;
        mining_sessions: number;
    };
    created_at: Date;
    updated_at: Date;
    last_active: Date;
    is_active: boolean;
}
export interface UserRegistration {
    email: string;
    username: string;
    password: string;
    wallet_address?: string;
}
//# sourceMappingURL=User.d.ts.map