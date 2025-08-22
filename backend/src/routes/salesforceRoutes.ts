import { Router, Request, Response } from 'express';
import salesforceDataSeedService from '../services/salesforceDataSeedService';
import databaseService from '../services/databaseService';

const router = Router();

// Generate crypto trading accounts
router.post('/generate/accounts', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        const accounts = await salesforceDataSeedService.generateCryptoTradingAccounts();

        res.json({
            message: 'Crypto trading accounts generated successfully',
            accounts,
            count: accounts.length,
            total_annual_revenue: accounts.reduce((sum, acc) => sum + (acc.AnnualRevenue || 0), 0)
        });

        console.log(`🏢 Generated ${accounts.length} crypto trading accounts`);
    } catch (error: any) {
        console.error('Account generation error:', error);
        res.status(500).json({
            error: 'Failed to generate accounts',
            details: error.message
        });
    }
});

// Generate crypto industry contacts
router.post('/generate/contacts', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        // First generate accounts to link contacts to
        const accounts = await salesforceDataSeedService.generateCryptoTradingAccounts();
        const contacts = await salesforceDataSeedService.generateCryptoContacts(accounts);

        res.json({
            message: 'Crypto industry contacts generated successfully',
            contacts,
            linked_accounts: accounts.length,
            count: contacts.length
        });

        console.log(`👤 Generated ${contacts.length} crypto industry contacts`);
    } catch (error: any) {
        console.error('Contact generation error:', error);
        res.status(500).json({
            error: 'Failed to generate contacts',
            details: error.message
        });
    }
});

// Generate crypto opportunities
router.post('/generate/opportunities', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        // Generate accounts first
        const accounts = await salesforceDataSeedService.generateCryptoTradingAccounts();
        const opportunities = await salesforceDataSeedService.generateCryptoOpportunities(accounts);

        const totalValue = opportunities.reduce((sum, opp) => sum + (opp.Amount || 0), 0);
        const highProbDeals = opportunities.filter(opp => (opp.Probability || 0) > 70);

        res.json({
            message: 'Crypto opportunities generated successfully',
            opportunities,
            count: opportunities.length,
            total_value: totalValue,
            high_probability_deals: highProbDeals.length,
            average_deal_size: Math.round(totalValue / opportunities.length)
        });

        console.log(`💰 Generated ${opportunities.length} opportunities worth $${totalValue.toLocaleString()}`);
    } catch (error: any) {
        console.error('Opportunity generation error:', error);
        res.status(500).json({
            error: 'Failed to generate opportunities',
            details: error.message
        });
    }
});

// Generate support cases
router.post('/generate/cases', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        // Generate prerequisite data
        const accounts = await salesforceDataSeedService.generateCryptoTradingAccounts();
        const contacts = await salesforceDataSeedService.generateCryptoContacts(accounts);
        const cases = await salesforceDataSeedService.generateCryptoCases(accounts, contacts);

        const casesByPriority = {
            high: cases.filter(c => c.Priority === 'High').length,
            medium: cases.filter(c => c.Priority === 'Medium').length,
            low: cases.filter(c => c.Priority === 'Low').length
        };

        res.json({
            message: 'Support cases generated successfully',
            cases,
            count: cases.length,
            priority_breakdown: casesByPriority
        });

        console.log(`🎫 Generated ${cases.length} support cases`);
    } catch (error: any) {
        console.error('Case generation error:', error);
        res.status(500).json({
            error: 'Failed to generate cases',
            details: error.message
        });
    }
});

// Generate complete dataset
router.post('/generate/complete', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        console.log('🚀 Starting complete Salesforce dataset generation...');
        const dataset = await salesforceDataSeedService.generateCompleteCryptoDataset();

        res.json({
            message: 'Complete Salesforce dataset generated successfully',
            dataset,
            summary: dataset.summary
        });

        console.log('✅ Complete Salesforce dataset generated successfully');
    } catch (error: any) {
        console.error('Complete dataset generation error:', error);
        res.status(500).json({
            error: 'Failed to generate complete dataset',
            details: error.message
        });
    }
});

// Generate JAG-OPS business data
router.post('/generate/jagops', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        const jagopsData = await salesforceDataSeedService.generateJAGOPSBusinessData();

        res.json({
            message: 'JAG-OPS business data generated successfully',
            data: jagopsData,
            platform: 'JAG-OPS Automation Platform'
        });

        console.log('🎯 JAG-OPS business data generated for Salesforce');
    } catch (error: any) {
        console.error('JAG-OPS data generation error:', error);
        res.status(500).json({
            error: 'Failed to generate JAG-OPS data',
            details: error.message
        });
    }
});

// Export data in Salesforce format
router.post('/export/csv', async (req: Request, res: Response) => {
    try {
        const { userId, dataType = 'complete' } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        let dataset;
        
        switch (dataType) {
            case 'complete':
                dataset = await salesforceDataSeedService.generateCompleteCryptoDataset();
                break;
            case 'jagops':
                dataset = await salesforceDataSeedService.generateJAGOPSBusinessData();
                break;
            default:
                return res.status(400).json({ error: 'Invalid data type' });
        }

        const csvContent = salesforceDataSeedService.exportToSalesforceFormat(dataset);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="salesforce_${dataType}_data.csv"`);
        res.send(csvContent);

        console.log(`📄 Exported ${dataType} data to CSV format`);
    } catch (error: any) {
        console.error('CSV export error:', error);
        res.status(500).json({
            error: 'Failed to export CSV',
            details: error.message
        });
    }
});

// Get data statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        // Generate sample data to get statistics
        const accounts = await salesforceDataSeedService.generateCryptoTradingAccounts();
        const contacts = await salesforceDataSeedService.generateCryptoContacts(accounts);
        const opportunities = await salesforceDataSeedService.generateCryptoOpportunities(accounts);
        const cases = await salesforceDataSeedService.generateCryptoCases(accounts, contacts);

        const stats = {
            available_data_types: [
                'crypto_accounts',
                'crypto_contacts', 
                'crypto_opportunities',
                'crypto_cases',
                'complete_dataset',
                'jagops_business_data'
            ],
            sample_counts: {
                accounts: accounts.length,
                contacts: contacts.length,
                opportunities: opportunities.length,
                cases: cases.length
            },
            opportunity_stats: {
                total_value: opportunities.reduce((sum, opp) => sum + (opp.Amount || 0), 0),
                average_value: opportunities.reduce((sum, opp) => sum + (opp.Amount || 0), 0) / opportunities.length,
                high_probability_count: opportunities.filter(opp => (opp.Probability || 0) > 70).length
            },
            industries_covered: [
                'Financial Services',
                'Technology', 
                'Mining',
                'Financial Technology'
            ],
            supported_formats: ['JSON', 'CSV']
        };

        res.json({
            message: 'Salesforce data seed statistics',
            stats
        });
    } catch (error: any) {
        console.error('Stats generation error:', error);
        res.status(500).json({
            error: 'Failed to generate statistics',
            details: error.message
        });
    }
});

// Bulk data generation for testing
router.post('/bulk/generate', async (req: Request, res: Response) => {
    try {
        const { userId, multiplier = 1 } = req.body;

        if (userId) {
            salesforceDataSeedService.setCurrentUser(userId);
        }

        if (multiplier > 10) {
            return res.status(400).json({ 
                error: 'Multiplier cannot exceed 10 to prevent system overload' 
            });
        }

        const datasets = [];
        for (let i = 0; i < multiplier; i++) {
            const dataset = await salesforceDataSeedService.generateCompleteCryptoDataset();
            datasets.push(dataset);
        }

        const totalStats = datasets.reduce((acc, dataset) => ({
            accounts: acc.accounts + dataset.accounts.length,
            contacts: acc.contacts + dataset.contacts.length,
            opportunities: acc.opportunities + dataset.opportunities.length,
            cases: acc.cases + dataset.cases.length,
            total_value: acc.total_value + dataset.summary.total_opportunity_value
        }), { accounts: 0, contacts: 0, opportunities: 0, cases: 0, total_value: 0 });

        res.json({
            message: `Bulk generation completed with ${multiplier}x datasets`,
            datasets,
            total_stats,
            multiplier
        });

        console.log(`📊 Generated ${multiplier} complete datasets`);
    } catch (error: any) {
        console.error('Bulk generation error:', error);
        res.status(500).json({
            error: 'Failed to generate bulk data',
            details: error.message
        });
    }
});

export default router;