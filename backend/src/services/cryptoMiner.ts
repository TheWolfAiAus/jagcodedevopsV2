import databaseService from './databaseService';

export class CryptoMiner {
    private running = false;
    private currentUserId: string | null = null;
    private miningStartTime: Date | null = null;

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    async start(): Promise<void> {
        this.running = true;
        this.miningStartTime = new Date();
        console.log('⛏️ Crypto Miner service started');
        
        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'mining_start',
                description: 'Crypto mining operations started',
                metadata: {
                    start_time: this.miningStartTime,
                    currencies: ['BTC', 'ETH']
                }
            });
        }
    }

    async stop(): Promise<void> {
        if (this.running && this.currentUserId && this.miningStartTime) {
            const endTime = new Date();
            const durationMinutes = Math.floor((endTime.getTime() - this.miningStartTime.getTime()) / 60000);
            
            // Register mining session
            await databaseService.registerMiningSession(this.currentUserId, {
                currency: 'BTC',
                hash_rate: '1.5 TH/s',
                duration_minutes: durationMinutes,
                earnings: durationMinutes * 0.0001, // Simple calculation
                power_consumption: '100W'
            });
        }

        this.running = false;
        this.miningStartTime = null;
        console.log('⛏️ Crypto Miner service stopped');
    }

    async getMiningStatus(): Promise<any> {
        return {
            is_running: this.running,
            operations: this.running ? [
                {
                    currency: 'BTC',
                    hash_rate: '1.5 TH/s',
                    earnings_total: 0.001,
                    power_consumption: '100W'
                }
            ] : []
        };
    }

    isRunning(): boolean {
        return this.running;
    }
}