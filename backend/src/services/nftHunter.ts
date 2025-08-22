import databaseService from './databaseService';

export class NFTHunter {
    private running = false;
    private currentUserId: string | null = null;

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async start(): Promise<void> {
        this.running = true;
        console.log('🎨 NFT Hunter service started');
        
        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'nft_found',
                description: 'NFT Hunter service started - Scanning for opportunities'
            });
        }
    }

    async stop(): Promise<void> {
        this.running = false;
        console.log('🎨 NFT Hunter service stopped');
    }

    async getTopOpportunities(limit: number = 10): Promise<any[]> {
        const opportunities = [
            {
                contract_address: '0x1234...abcd',
                name: 'Sample NFT Collection',
                floor_price: 0.05,
                estimated_profit: 0.02,
                opportunity_type: 'undervalued',
                confidence_score: 8.5,
                marketplace: 'OpenSea'
            },
            {
                contract_address: '0x5678...efgh',
                name: 'Trending Art Collection',
                floor_price: 0.12,
                estimated_profit: 0.08,
                opportunity_type: 'trending',
                confidence_score: 9.2,
                marketplace: 'LooksRare'
            }
        ].slice(0, limit);

        // Auto-register opportunities to database if user is set
        if (this.currentUserId && opportunities.length > 0) {
            for (const opportunity of opportunities) {
                try {
                    await databaseService.registerNFTOpportunity(this.currentUserId, {
                        contract_address: opportunity.contract_address,
                        collection_name: opportunity.name,
                        floor_price: opportunity.floor_price,
                        estimated_profit: opportunity.estimated_profit,
                        opportunity_type: opportunity.opportunity_type as any,
                        marketplace: opportunity.marketplace,
                        confidence_score: opportunity.confidence_score
                    });
                } catch (error) {
                    console.error('Failed to register NFT opportunity:', error);
                }
            }
        }

        return opportunities;
    }

    isRunning(): boolean {
        return this.running;
    }
}