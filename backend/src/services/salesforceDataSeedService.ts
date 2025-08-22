import databaseService from './databaseService';

// Types for Salesforce data seeding
interface SalesforceAccount {
    Id?: string;
    Name: string;
    Type?: string;
    Industry?: string;
    Phone?: string;
    Website?: string;
    BillingStreet?: string;
    BillingCity?: string;
    BillingState?: string;
    BillingPostalCode?: string;
    BillingCountry?: string;
    AnnualRevenue?: number;
    NumberOfEmployees?: number;
}

interface SalesforceContact {
    Id?: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Phone?: string;
    Title?: string;
    AccountId?: string;
    Department?: string;
}

interface SalesforceOpportunity {
    Id?: string;
    Name: string;
    AccountId?: string;
    StageName: string;
    Amount?: number;
    CloseDate: string;
    Probability?: number;
    Type?: string;
    LeadSource?: string;
    Description?: string;
}

interface SalesforceCase {
    Id?: string;
    AccountId?: string;
    ContactId?: string;
    Subject: string;
    Description?: string;
    Status: string;
    Priority: string;
    Origin?: string;
    Type?: string;
}

export class SalesforceDataSeedService {
    private currentUserId: string | null = null;

    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    /**
     * Generate seed data for JAG-OPS crypto trading accounts
     */
    async generateCryptoTradingAccounts(): Promise<SalesforceAccount[]> {
        const accounts: SalesforceAccount[] = [
            {
                Name: 'CryptoMax Trading LLC',
                Type: 'Customer',
                Industry: 'Financial Services',
                Phone: '+1-555-0101',
                Website: 'https://cryptomax.example.com',
                BillingStreet: '123 Blockchain Ave',
                BillingCity: 'San Francisco',
                BillingState: 'CA',
                BillingPostalCode: '94102',
                BillingCountry: 'USA',
                AnnualRevenue: 5000000,
                NumberOfEmployees: 50
            },
            {
                Name: 'NFT Ventures Capital',
                Type: 'Prospect',
                Industry: 'Technology',
                Phone: '+1-555-0102',
                Website: 'https://nftventures.example.com',
                BillingStreet: '456 Digital Blvd',
                BillingCity: 'New York',
                BillingState: 'NY',
                BillingPostalCode: '10001',
                BillingCountry: 'USA',
                AnnualRevenue: 12000000,
                NumberOfEmployees: 25
            },
            {
                Name: 'DeFi Solutions Group',
                Type: 'Customer',
                Industry: 'Financial Services',
                Phone: '+1-555-0103',
                Website: 'https://defisolutions.example.com',
                BillingStreet: '789 Smart Contract St',
                BillingCity: 'Miami',
                BillingState: 'FL',
                BillingPostalCode: '33101',
                BillingCountry: 'USA',
                AnnualRevenue: 8500000,
                NumberOfEmployees: 75
            },
            {
                Name: 'Blockchain Mining Corp',
                Type: 'Customer',
                Industry: 'Mining',
                Phone: '+1-555-0104',
                Website: 'https://blockchainmining.example.com',
                BillingStreet: '321 Hash Rate Way',
                BillingCity: 'Austin',
                BillingState: 'TX',
                BillingPostalCode: '73301',
                BillingCountry: 'USA',
                AnnualRevenue: 15000000,
                NumberOfEmployees: 150
            }
        ];

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Generated ${accounts.length} crypto trading accounts for Salesforce`,
                metadata: { accounts_generated: accounts.length, type: 'crypto_accounts' }
            });
        }

        return accounts;
    }

    /**
     * Generate seed contacts for crypto industry
     */
    async generateCryptoContacts(accounts: SalesforceAccount[]): Promise<SalesforceContact[]> {
        const contacts: SalesforceContact[] = [
            {
                FirstName: 'Sarah',
                LastName: 'Mitchell',
                Email: 'sarah.mitchell@cryptomax.example.com',
                Phone: '+1-555-0201',
                Title: 'Chief Trading Officer',
                Department: 'Trading',
                AccountId: accounts[0].Id
            },
            {
                FirstName: 'David',
                LastName: 'Chen',
                Email: 'david.chen@nftventures.example.com',
                Phone: '+1-555-0202',
                Title: 'NFT Investment Director',
                Department: 'Investments',
                AccountId: accounts[1].Id
            },
            {
                FirstName: 'Maria',
                LastName: 'Rodriguez',
                Email: 'maria.rodriguez@defisolutions.example.com',
                Phone: '+1-555-0203',
                Title: 'DeFi Strategy Manager',
                Department: 'Strategy',
                AccountId: accounts[2].Id
            },
            {
                FirstName: 'Alex',
                LastName: 'Thompson',
                Email: 'alex.thompson@blockchainmining.example.com',
                Phone: '+1-555-0204',
                Title: 'Mining Operations Director',
                Department: 'Operations',
                AccountId: accounts[3].Id
            },
            {
                FirstName: 'Jennifer',
                LastName: 'Park',
                Email: 'jennifer.park@cryptomax.example.com',
                Phone: '+1-555-0205',
                Title: 'Compliance Officer',
                Department: 'Legal',
                AccountId: accounts[0].Id
            }
        ];

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Generated ${contacts.length} crypto industry contacts for Salesforce`,
                metadata: { contacts_generated: contacts.length, type: 'crypto_contacts' }
            });
        }

        return contacts;
    }

    /**
     * Generate crypto trading opportunities
     */
    async generateCryptoOpportunities(accounts: SalesforceAccount[]): Promise<SalesforceOpportunity[]> {
        const opportunities: SalesforceOpportunity[] = [
            {
                Name: 'Bitcoin Mining Infrastructure Upgrade',
                AccountId: accounts[3].Id,
                StageName: 'Proposal/Price Quote',
                Amount: 2500000,
                CloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days
                Probability: 75,
                Type: 'New Business',
                LeadSource: 'Web',
                Description: 'Comprehensive mining infrastructure upgrade including new ASIC miners and cooling systems'
            },
            {
                Name: 'NFT Marketplace Development',
                AccountId: accounts[1].Id,
                StageName: 'Needs Analysis',
                Amount: 850000,
                CloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
                Probability: 50,
                Type: 'New Business',
                LeadSource: 'Referral',
                Description: 'Custom NFT marketplace with advanced trading features and analytics'
            },
            {
                Name: 'DeFi Protocol Integration',
                AccountId: accounts[2].Id,
                StageName: 'Qualification',
                Amount: 1200000,
                CloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days
                Probability: 60,
                Type: 'Existing Business',
                LeadSource: 'Partner Referral',
                Description: 'Integration with multiple DeFi protocols for yield optimization'
            },
            {
                Name: 'Crypto Trading Algorithm License',
                AccountId: accounts[0].Id,
                StageName: 'Negotiation/Review',
                Amount: 450000,
                CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
                Probability: 85,
                Type: 'New Business',
                LeadSource: 'Cold Call',
                Description: 'Advanced AI-powered trading algorithms for automated profit generation'
            }
        ];

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Generated ${opportunities.length} crypto opportunities for Salesforce`,
                metadata: { 
                    opportunities_generated: opportunities.length, 
                    total_value: opportunities.reduce((sum, opp) => sum + (opp.Amount || 0), 0),
                    type: 'crypto_opportunities' 
                }
            });
        }

        return opportunities;
    }

    /**
     * Generate support cases for crypto platforms
     */
    async generateCryptoCases(accounts: SalesforceAccount[], contacts: SalesforceContact[]): Promise<SalesforceCase[]> {
        const cases: SalesforceCase[] = [
            {
                AccountId: accounts[0].Id,
                ContactId: contacts[0].Id,
                Subject: 'Trading API Performance Issues',
                Description: 'Experiencing latency issues with high-frequency trading API calls during peak market hours',
                Status: 'In Progress',
                Priority: 'High',
                Origin: 'Phone',
                Type: 'Technical'
            },
            {
                AccountId: accounts[1].Id,
                ContactId: contacts[1].Id,
                Subject: 'NFT Metadata Sync Problems',
                Description: 'NFT metadata not updating properly after recent smart contract upgrade',
                Status: 'New',
                Priority: 'Medium',
                Origin: 'Email',
                Type: 'Technical'
            },
            {
                AccountId: accounts[2].Id,
                ContactId: contacts[2].Id,
                Subject: 'DeFi Yield Calculation Discrepancy',
                Description: 'Yield calculations showing inconsistent results across different DeFi protocols',
                Status: 'Working',
                Priority: 'High',
                Origin: 'Web',
                Type: 'Technical'
            },
            {
                AccountId: accounts[3].Id,
                ContactId: contacts[3].Id,
                Subject: 'Mining Pool Configuration Request',
                Description: 'Request for assistance with configuring new mining pool connections and optimization',
                Status: 'New',
                Priority: 'Low',
                Origin: 'Phone',
                Type: 'Configuration'
            }
        ];

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: `Generated ${cases.length} support cases for Salesforce`,
                metadata: { cases_generated: cases.length, type: 'crypto_cases' }
            });
        }

        return cases;
    }

    /**
     * Generate complete dataset for crypto business
     */
    async generateCompleteCryptoDataset(): Promise<{
        accounts: SalesforceAccount[];
        contacts: SalesforceContact[];
        opportunities: SalesforceOpportunity[];
        cases: SalesforceCase[];
        summary: any;
    }> {
        console.log('🏢 Generating complete Salesforce dataset for crypto business...');

        const accounts = await this.generateCryptoTradingAccounts();
        const contacts = await this.generateCryptoContacts(accounts);
        const opportunities = await this.generateCryptoOpportunities(accounts);
        const cases = await this.generateCryptoCases(accounts, contacts);

        const summary = {
            accounts_generated: accounts.length,
            contacts_generated: contacts.length,
            opportunities_generated: opportunities.length,
            cases_generated: cases.length,
            total_opportunity_value: opportunities.reduce((sum, opp) => sum + (opp.Amount || 0), 0),
            high_probability_deals: opportunities.filter(opp => (opp.Probability || 0) > 70).length,
            generated_at: new Date().toISOString()
        };

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'Complete Salesforce crypto dataset generated successfully',
                metadata: summary
            });
        }

        console.log('✅ Salesforce crypto dataset generation complete');
        console.log(`   - ${accounts.length} Accounts`);
        console.log(`   - ${contacts.length} Contacts`);
        console.log(`   - ${opportunities.length} Opportunities ($${summary.total_opportunity_value.toLocaleString()})`);
        console.log(`   - ${cases.length} Cases`);

        return {
            accounts,
            contacts,
            opportunities,
            cases,
            summary
        };
    }

    /**
     * Generate JAG-OPS specific business data
     */
    async generateJAGOPSBusinessData(): Promise<any> {
        const jagopsData = {
            accounts: [
                {
                    Name: 'JAG-OPS Automation Platform',
                    Type: 'Technology Partner',
                    Industry: 'Financial Technology',
                    Phone: '+1-555-JAGOPS',
                    Website: 'https://jagops.ai',
                    BillingStreet: '1000 Innovation Drive',
                    BillingCity: 'San Francisco',
                    BillingState: 'CA',
                    BillingPostalCode: '94105',
                    BillingCountry: 'USA',
                    AnnualRevenue: 50000000,
                    NumberOfEmployees: 200
                }
            ],
            contacts: [
                {
                    FirstName: 'JAG',
                    LastName: 'Operations',
                    Email: 'operations@jagops.ai',
                    Phone: '+1-555-JAG-OPS',
                    Title: 'Chief Operations Officer',
                    Department: 'Operations'
                }
            ],
            opportunities: [
                {
                    Name: 'Enterprise Crypto Automation Suite',
                    StageName: 'Closed Won',
                    Amount: 10000000,
                    CloseDate: new Date().toISOString().split('T')[0],
                    Probability: 100,
                    Type: 'New Business',
                    LeadSource: 'Direct',
                    Description: 'Complete crypto trading and mining automation platform for enterprise clients'
                }
            ]
        };

        if (this.currentUserId) {
            await databaseService.logActivity(this.currentUserId, {
                type: 'system_alert',
                description: 'JAG-OPS business data generated for Salesforce integration',
                metadata: { platform: 'JAG-OPS', data_type: 'business_profile' }
            });
        }

        return jagopsData;
    }

    /**
     * Export data in Salesforce-compatible format
     */
    exportToSalesforceFormat(data: any): string {
        // Convert to CSV format for Salesforce Data Loader
        const csvLines: string[] = [];
        
        // Export accounts
        if (data.accounts && data.accounts.length > 0) {
            const accountHeaders = Object.keys(data.accounts[0]).join(',');
            csvLines.push('=== ACCOUNTS ===');
            csvLines.push(accountHeaders);
            data.accounts.forEach((account: any) => {
                const values = Object.values(account).map(v => `"${v || ''}"`).join(',');
                csvLines.push(values);
            });
            csvLines.push('');
        }

        // Export contacts  
        if (data.contacts && data.contacts.length > 0) {
            const contactHeaders = Object.keys(data.contacts[0]).join(',');
            csvLines.push('=== CONTACTS ===');
            csvLines.push(contactHeaders);
            data.contacts.forEach((contact: any) => {
                const values = Object.values(contact).map(v => `"${v || ''}"`).join(',');
                csvLines.push(values);
            });
            csvLines.push('');
        }

        return csvLines.join('\n');
    }
}

export default new SalesforceDataSeedService();