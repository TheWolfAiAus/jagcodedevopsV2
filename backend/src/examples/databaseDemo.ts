/**
 * Demo script showing how the database registration system works
 * This demonstrates all the major database operations for JAG-OPS
 */

import databaseService from '../services/databaseService';
import {AutomationEngine} from '../services/automationEngine';

export class DatabaseDemo {
    
    static async runDemo(): Promise<void> {
        console.log('🚀 Starting JAG-OPS Database Demo...\n');

        try {
            // 1. Register a new user
            console.log('1️⃣ Registering new user...');
            const newUser = await databaseService.registerUser({
                email: 'demo@jagops.com',
                username: 'jagops_demo',
                password: 'secure123',
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
            });
            console.log(`✅ User registered: ${newUser.username} (ID: ${newUser.id})\n`);

            // 2. Update user settings
            console.log('2️⃣ Configuring user settings...');
            await databaseService.updateUserSettings(newUser.id, {
                auto_mining: true,
                nft_hunting: true,
                profit_threshold: 0.05,
                notification_settings: {
                    email: true,
                    push: true,
                    sms: false
                },
                trading_settings: {
                    max_trade_amount: 1000,
                    risk_level: 'medium',
                    auto_trade: false
                }
            });
            console.log('✅ Settings configured\n');

            // 3. Add portfolio items
            console.log('3️⃣ Adding portfolio items...');
            await databaseService.registerPortfolioItem(newUser.id, {
                asset_type: 'crypto',
                symbol: 'BTC',
                name: 'Bitcoin',
                amount: 0.5,
                value_usd: 21500,
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
            });

            await databaseService.registerPortfolioItem(newUser.id, {
                asset_type: 'crypto',
                symbol: 'ETH',
                name: 'Ethereum',
                amount: 10,
                value_usd: 18000,
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
            });

            await databaseService.registerPortfolioItem(newUser.id, {
                asset_type: 'nft',
                symbol: 'BAYC',
                name: 'Bored Ape Yacht Club #1234',
                amount: 1,
                value_usd: 45000,
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
                contract_address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
                token_id: '1234'
            });
            console.log('✅ Portfolio items added\n');

            // 4. Record some transactions
            console.log('4️⃣ Recording transactions...');
            await databaseService.registerTransaction(newUser.id, {
                type: 'buy',
                asset_symbol: 'ETH',
                amount: 5,
                price_usd: 1800,
                total_value: 9000,
                fee: 25,
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
                transaction_hash: '0xabcdef1234567890abcdef1234567890abcdef12',
                exchange: 'Binance',
                notes: 'Strategic ETH purchase'
            });

            await databaseService.registerTransaction(newUser.id, {
                type: 'sell',
                asset_symbol: 'BTC',
                amount: 0.1,
                price_usd: 43500,
                total_value: 4350,
                fee: 15,
                wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
                transaction_hash: '0x1234567890abcdef1234567890abcdef12345678',
                exchange: 'Coinbase Pro',
                notes: 'Profit taking at resistance'
            });
            console.log('✅ Transactions recorded\n');

            // 5. Register mining session
            console.log('5️⃣ Recording mining session...');
            await databaseService.registerMiningSession(newUser.id, {
                currency: 'BTC',
                hash_rate: '2.5 TH/s',
                duration_minutes: 480, // 8 hours
                earnings: 0.0012,
                power_consumption: '150W',
                pool: 'Slush Pool'
            });
            console.log('✅ Mining session recorded\n');

            // 6. Register NFT opportunities
            console.log('6️⃣ Recording NFT opportunities...');
            await databaseService.registerNFTOpportunity(newUser.id, {
                contract_address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
                collection_name: 'Mutant Ape Yacht Club',
                floor_price: 15.5,
                estimated_profit: 3.2,
                opportunity_type: 'undervalued',
                marketplace: 'OpenSea',
                confidence_score: 8.7
            });

            await databaseService.registerNFTOpportunity(newUser.id, {
                contract_address: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
                collection_name: 'Doodles',
                floor_price: 2.1,
                estimated_profit: 0.8,
                opportunity_type: 'trending',
                marketplace: 'LooksRare',
                confidence_score: 9.1
            });
            console.log('✅ NFT opportunities recorded\n');

            // 7. Test automation engine integration
            console.log('7️⃣ Testing automation engine integration...');
            const automationEngine = new AutomationEngine();
            automationEngine.setCurrentUser(newUser.id);

            // Start the engine to trigger database logging
            await automationEngine.start();
            
            // Get some NFT opportunities (this will auto-register them)
            const opportunities = await automationEngine.nftHunter.getTopOpportunities(3);
            console.log(`✅ Found ${opportunities.length} NFT opportunities\n`);

            // Stop the engine
            await automationEngine.stop();

            // 8. Retrieve user dashboard
            console.log('8️⃣ Retrieving user dashboard...');
            const dashboard = await databaseService.getUserDashboard(newUser.id);
            console.log('✅ Dashboard data:');
            console.log(`   - Portfolio value: $${dashboard.summary.total_portfolio_value}`);
            console.log(`   - Total profits: $${dashboard.summary.total_profits}`);
            console.log(`   - Portfolio items: ${dashboard.portfolio.length}`);
            console.log(`   - Recent transactions: ${dashboard.recent_transactions.length}`);
            console.log(`   - Recent activities: ${dashboard.recent_activity.length}\n`);

            console.log('🎉 Database demo completed successfully!');
            console.log('All data has been registered to your Appwrite collections:');
            console.log('   - Users: 68a3b34a00375e270b15');
            console.log('   - Portfolio: 68a3b3e2000dcc682c12');
            console.log('   - Transactions: 68a3b41400346ff40705');
            console.log('   - Activity: 68a3b43e001c44090ac6');
            console.log('   - Settings: 68a3b463003bb9695087');

        } catch (error) {
            console.error('❌ Demo failed:', error);
        }
    }
}

// Run the demo if this file is executed directly
if (require.main === module) {
    DatabaseDemo.runDemo();
}