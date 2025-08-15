using JagCodeHQ.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JagCodeHQ.Services
{
    public interface IWolfAIService
    {
        // These methods will eventually call into your Python backend for AI functions.
        Task<ApiResponse<object>> TriggerMarketplaceMonitor(object request);
        Task<ApiResponse<object>> TriggerTorDiscovery(object request);
        Task<ApiResponse<object>> TriggerCryptoMixingAnalysis(object request);
        Task<ApiResponse<object>> TriggerPrivacyVulnerabilityScan(object request);
        Task<ApiResponse<object>> TriggerExploitSurfaceAnalysis(object request);
        Task<ApiResponse<object>> TriggerCompetitorEmailScrape(object request);
        Task<ApiResponse<object>> TriggerMarketSignalDiscriminator(object request);
        Task<ApiResponse<object>> TriggerDeepfakeAudioGeneration(object request);

        // Ethically excluded functions will be marked as such in their implementations.
        Task<ApiResponse<object>> TriggerTaxArbitrage(object request);
        Task<ApiResponse<object>> TriggerPiratedContentScan(object request);
        Task<ApiResponse<object>> TriggerAdBlockEvasion(object request);
        Task<ApiResponse<object>> TriggerDataExfiltrationAudit(object request);
        Task<ApiResponse<object>> TriggerStealthSocialEngagement(object request);
        Task<ApiResponse<object>> TriggerAutoRedirectAdBlockUsers(object request);
        Task<ApiResponse<object>> TriggerStealthAffiliateLinks(object request);
        Task<ApiResponse<object>> TriggerGeoRestrictedStreamsScrape(object request);
        Task<ApiResponse<object>> TriggerXSSInjection(object request);
        Task<ApiResponse<object>> TriggerCopyrightClaimsOverride(object request);
        Task<ApiResponse<object>> TriggerProMarketSignalDiscriminator(object request);
        Task<ApiResponse<object>> TriggerAutoTaxHavenEntityBuilder(object request);

        // Add methods for managing AI tasks and getting results
        Task<ApiResponse<List<object>>> GetAiTaskStatus(string taskId);
        Task<ApiResponse<object>> GetAiTaskResult(string taskId);
    }
}