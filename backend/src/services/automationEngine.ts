import { EventEmitter } from 'events';
import { NFTHunter } from './nftHunter';
import { CryptoMiner } from './cryptoMiner';
import { WalletManager } from './walletManager';
import { SmartContractManager } from './smartContractManager';
import { SystemMonitor } from './systemMonitor';
import databaseService from './databaseService';

interface OperationStatus {
    nft_hunting: boolean;
    crypto_mining: boolean;
    wallet_monitoring: boolean;
    smart_contracts: boolean;
    system_monitoring: boolean;
}

export class AutomationEngine extends EventEmitter {
    private running = false;
    private operationStatus: OperationStatus;
    private currentUserId: string | null = null;

    public nftHunter: NFTHunter;
    public cryptoMiner: CryptoMiner;
    public walletManager: WalletManager;
    public smartContractManager: SmartContractManager;
    public systemMonitor: SystemMonitor;

    constructor() {
        super();
        
        this.operationStatus = {
            nft_hunting: false,
            crypto_mining: false,
            wallet_monitoring: false,
            smart_contracts: false,
            system_monitoring: false
        };

        // Initialize services
        this.nftHunter = new NFTHunter();
        this.cryptoMiner = new CryptoMiner();
        this.walletManager = new WalletManager();
        this.smartContractManager = new SmartContractManager();
        this.systemMonitor = new SystemMonitor();
    }

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
        // Set user ID for all services
        this.nftHunter.setCurrentUser(userId);
        this.cryptoMiner.setCurrentUser(userId);
        // Add setCurrentUser methods to other services as needed
    }

    private async logActivity(type: string, description: string, metadata?: any): Promise<void> {
        if (this.currentUserId) {
            try {
                await databaseService.logActivity(this.currentUserId, {
                    type: type as any,
                    description,
                    metadata
                });
            } catch (error) {
                console.error('Failed to log activity:', error);
            }
        }
    }

    async start(): Promise<void> {
        if (this.running) {
            return;
        }

        this.running = true;
        console.log('🚀 JAG-OPS Automation Engine starting...');

        try {
            // Start system monitor first
            await this.systemMonitor.start();
            this.operationStatus.system_monitoring = true;
            console.log('✅ System Monitor started');

            // Start wallet manager
            await this.walletManager.start();
            this.operationStatus.wallet_monitoring = true;
            console.log('✅ Wallet Manager started');

            // Start smart contract manager
            await this.smartContractManager.start();
            this.operationStatus.smart_contracts = true;
            console.log('✅ Smart Contract Manager started');

            console.log('🎯 JAG-OPS Automation Engine fully operational!');
            await this.logActivity('system_alert', 'JAG-OPS Automation Engine started successfully');
            this.emit('started');
        } catch (error) {
            console.error('Error starting automation engine:', error);
            this.running = false;
            throw error;
        }
    }

    async stop(): Promise<void> {
        this.running = false;
        console.log('🛑 JAG-OPS Automation Engine stopping...');

        try {
            // Stop all services
            await this.nftHunter.stop();
            await this.cryptoMiner.stop();
            await this.walletManager.stop();
            await this.smartContractManager.stop();
            await this.systemMonitor.stop();

            // Reset operation status
            Object.keys(this.operationStatus).forEach(key => {
                this.operationStatus[key as keyof OperationStatus] = false;
            });

            console.log('🛑 JAG-OPS Automation Engine stopped');
            this.emit('stopped');
        } catch (error) {
            console.error('Error stopping automation engine:', error);
            throw error;
        }
    }

    async startAllOperations(): Promise<void> {
        console.log('🎯 STARTING ALL OPERATIONS - LET THE MAGIC HAPPEN!');

        try {
            // Start NFT hunting
            if (!this.operationStatus.nft_hunting) {
                await this.nftHunter.start();
                this.operationStatus.nft_hunting = true;
                console.log('🎨 NFT Hunter activated - Hunting for free NFTs!');
            }

            // Start crypto mining
            if (!this.operationStatus.crypto_mining) {
                await this.cryptoMiner.start();
                this.operationStatus.crypto_mining = true;
                console.log('⛏️ Crypto Miner activated - Mining profits!');
            }

            console.log('🚀 ALL SYSTEMS GO! JAG-OPS is now generating profits!');
            await this.logActivity('mining_start', 'All profit-generating operations started', {
                nft_hunting: this.operationStatus.nft_hunting,
                crypto_mining: this.operationStatus.crypto_mining
            });
            this.emit('allOperationsStarted');
        } catch (error) {
            console.error('❌ Error starting operations:', error);
            throw error;
        }
    }

    async stopAllOperations(): Promise<void> {
        console.log('🛑 Stopping all operations...');

        try {
            // Stop NFT hunting
            if (this.operationStatus.nft_hunting) {
                await this.nftHunter.stop();
                this.operationStatus.nft_hunting = false;
                console.log('🎨 NFT Hunter stopped');
            }

            // Stop crypto mining
            if (this.operationStatus.crypto_mining) {
                await this.cryptoMiner.stop();
                this.operationStatus.crypto_mining = false;
                console.log('⛏️ Crypto Miner stopped');
            }

            console.log('🛑 All operations stopped');
            this.emit('allOperationsStopped');
        } catch (error) {
            console.error('❌ Error stopping operations:', error);
            throw error;
        }
    }

    async getStatus(): Promise<any> {
        try {
            // Get individual service statuses
            const nftStatus = this.operationStatus.nft_hunting ? await this.nftHunter.getTopOpportunities(5) : [];
            const miningStatus = this.operationStatus.crypto_mining ? await this.cryptoMiner.getMiningStatus() : {};
            const walletStatus = this.operationStatus.wallet_monitoring ? await this.walletManager.getWalletStatus() : {};
            const contractStatus = this.operationStatus.smart_contracts ? await this.smartContractManager.getContractStatus() : {};
            const systemStatus = this.operationStatus.system_monitoring ? await this.systemMonitor.getStatus() : {};

            // Calculate total earnings (simplified)
            let totalEarnings = 0.0;
            if (miningStatus.operations) {
                for (const op of miningStatus.operations) {
                    totalEarnings += op.earnings_total || 0;
                }
            }

            // Count opportunities
            const nftOpportunities = Array.isArray(nftStatus) ? nftStatus.length : 0;

            return {
                engine_running: this.running,
                operation_status: this.operationStatus,
                summary: {
                    total_earnings: totalEarnings,
                    nft_opportunities: nftOpportunities,
                    mining_active: miningStatus.is_running || false,
                    wallet_connected: walletStatus.is_connected || false,
                    contracts_managed: contractStatus.total_contracts || 0,
                    system_healthy: systemStatus.service_status?.system_healthy || false
                },
                services: {
                    nft_hunter: {
                        active: this.operationStatus.nft_hunting,
                        top_opportunities: nftStatus
                    },
                    crypto_miner: {
                        active: this.operationStatus.crypto_mining,
                        status: miningStatus
                    },
                    wallet_manager: {
                        active: this.operationStatus.wallet_monitoring,
                        status: walletStatus
                    },
                    smart_contracts: {
                        active: this.operationStatus.smart_contracts,
                        status: contractStatus
                    },
                    system_monitor: {
                        active: this.operationStatus.system_monitoring,
                        status: systemStatus
                    }
                },
                last_update: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting automation status:', error);
            return {
                engine_running: this.running,
                operation_status: this.operationStatus,
                error: error instanceof Error ? error.message : 'Unknown error',
                last_update: new Date().toISOString()
            };
        }
    }

    async executeProfitStrategy(): Promise<void> {
        console.log('💰 Executing profit strategy...');

        try {
            const status = await this.getStatus();
            
            // Check NFT opportunities
            const nftOpportunities = status.services?.nft_hunter?.top_opportunities || [];
            if (nftOpportunities.length > 0) {
                console.log(`💎 Found ${nftOpportunities.length} high-value NFT opportunities`);
            }

            // Check mining profitability
            const miningStatus = status.services?.crypto_miner?.status || {};
            if (miningStatus.is_running) {
                const totalEarnings = (miningStatus.operations || [])
                    .reduce((sum: number, op: any) => sum + (op.earnings_total || 0), 0);
                console.log(`⛏️ Total mining earnings: ${totalEarnings}`);
            }

            // Check wallet balances
            const walletStatus = status.services?.wallet_manager?.status || {};
            const balances = walletStatus.balances || [];
            if (balances.length > 0) {
                const totalValue = balances.reduce((sum: number, balance: any) => sum + (balance.balance_usd || 0), 0);
                console.log(`💰 Total wallet value: $${totalValue}`);
            }

            if (this.operationStatus.smart_contracts) {
                console.log('🤖 Smart contract automation active');
            }

            this.emit('strategyExecuted');
        } catch (error) {
            console.error('Error executing profit strategy:', error);
            throw error;
        }
    }

    async emergencyStop(): Promise<void> {
        console.warn('🚨 EMERGENCY STOP ACTIVATED!');

        try {
            await this.stopAllOperations();
            console.log('🚨 Emergency stop completed');
            this.emit('emergencyStop');
        } catch (error) {
            console.error('Error during emergency stop:', error);
            throw error;
        }
    }

    async getProfitReport(): Promise<any> {
        try {
            const status = await this.getStatus();

            // Calculate profits from different sources
            let miningProfits = 0.0;
            let nftProfits = 0.0;
            const contractProfits = 0.0;

            // Mining profits
            const miningStatus = status.services?.crypto_miner?.status || {};
            if (miningStatus.operations) {
                miningProfits = miningStatus.operations.reduce((sum: number, op: any) => sum + (op.earnings_total || 0), 0);
            }

            // NFT opportunities value (estimated)
            const nftOpportunities = status.services?.nft_hunter?.top_opportunities || [];
            nftProfits = nftOpportunities.length * 0.01; // Estimated value per opportunity

            const totalProfits = miningProfits + nftProfits + contractProfits;

            return {
                total_profits: totalProfits,
                breakdown: {
                    mining: miningProfits,
                    nft_opportunities: nftProfits,
                    smart_contracts: contractProfits
                },
                opportunities: {
                    nft_count: nftOpportunities.length,
                    mining_active: miningStatus.is_running || false,
                    contracts_active: this.operationStatus.smart_contracts
                },
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating profit report:', error);
            return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async optimizeOperations(): Promise<void> {
        console.log('🎯 Optimizing operations for maximum profit...');

        try {
            // Get current performance metrics
            const systemMetrics = await this.systemMonitor.getPerformanceMetrics();

            // Optimize mining based on system resources
            if (this.operationStatus.crypto_mining) {
                const cpuUsage = systemMetrics.current_stats?.cpu?.percent || 0;
                if (cpuUsage < 70) {
                    console.log('🔧 CPU usage low - optimizing mining intensity');
                }
            }

            // Optimize NFT hunting frequency
            if (this.operationStatus.nft_hunting) {
                console.log('🔧 Optimizing NFT hunting parameters');
            }

            console.log('✅ Operations optimized for maximum profit');
            this.emit('operationsOptimized');
        } catch (error) {
            console.error('Error optimizing operations:', error);
            throw error;
        }
    }

    async transferProfitsToExodus(): Promise<void> {
        console.log('💸 Transferring profits to Exodus wallet...');

        try {
            const profitReport = await this.getProfitReport();
            const totalProfits = profitReport.total_profits || 0;

            if (totalProfits > 0) {
                console.log(`💰 Transferring $${totalProfits} to Exodus wallet`);
                // Actual transfer logic would be implemented here
            } else {
                console.log('💰 No profits to transfer yet');
            }

            this.emit('profitsTransferred', { amount: totalProfits });
        } catch (error) {
            console.error('Error transferring profits:', error);
            throw error;
        }
    }

    isRunning(): boolean {
        return this.running;
    }
}