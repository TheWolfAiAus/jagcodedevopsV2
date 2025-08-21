export interface PriceAlert {
    id: string | number;
    token_symbol: string;
    comparison_operator: string;
    price_target: number;
    is_active: boolean;
    created_at: string;
    last_triggered: string | null;
}
