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
export declare class SalesforceDataSeedService {
    private currentUserId;
    setCurrentUser(userId: string): void;
    generateCryptoTradingAccounts(): Promise<SalesforceAccount[]>;
    generateCryptoContacts(accounts: SalesforceAccount[]): Promise<SalesforceContact[]>;
    generateCryptoOpportunities(accounts: SalesforceAccount[]): Promise<SalesforceOpportunity[]>;
    generateCryptoCases(accounts: SalesforceAccount[], contacts: SalesforceContact[]): Promise<SalesforceCase[]>;
    generateCompleteCryptoDataset(): Promise<{
        accounts: SalesforceAccount[];
        contacts: SalesforceContact[];
        opportunities: SalesforceOpportunity[];
        cases: SalesforceCase[];
        summary: any;
    }>;
    generateJAGOPSBusinessData(): Promise<any>;
    exportToSalesforceFormat(data: any): string;
}
declare const _default: SalesforceDataSeedService;
export default _default;
//# sourceMappingURL=salesforceDataSeedService.d.ts.map