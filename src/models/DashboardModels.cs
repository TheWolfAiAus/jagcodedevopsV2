using System.Collections.Generic;

namespace JagCodeHQ.Models
{
    public class DashboardOverviewResponse
    {
        public decimal TotalPortfolioValueUSD { get; set; }
        public decimal DailyProfitLossUSD { get; set; }
        public decimal DailyProfitLossPercentage { get; set; }
        public int ActiveAlertsCount { get; set; }
        public int CompletedTasksCount { get; set; }
        public int PendingActionsCount { get; set; }
        public List<ActivityItem> RecentActivity { get; set; }
        public List<Alert> TopAlerts { get; set; }
    }

    public class DashboardFilterRequest
    {
        public string TimePeriod { get; set; }
        public string CurrencyFilter { get; set; }
        public List<string> WalletTypes { get; set; }
        public List<string> Categories { get; set; }
    }

    public class DashboardStatsResponse
    {
        public TransactionStats TransactionStats { get; set; }
        public PerformanceStats PerformanceStats { get; set; }
        public SystemStats SystemStats { get; set; }
    }

    public class TransactionStats
    {
        public int TotalTransactions { get; set; }
        public decimal TotalVolumeUSD { get; set; }
        public Dictionary<string, decimal> VolumeByCurrency { get; set; }
        public Dictionary<string, int> TransactionsByType { get; set; }
    }

    public class PerformanceStats
    {
        public decimal RoiPercentage { get; set; }
        public Dictionary<string, decimal> RoiByAsset { get; set; }
        public decimal AverageDailyProfitLossUSD { get; set; }
        public int WinningTradesCount { get; set; }
        public int LosingTradesCount { get; set; }
    }

    public class SystemStats
    {
        public decimal CpuUsagePercentage { get; set; }
        public decimal MemoryUsagePercentage { get; set; }
        public long DiskSpaceFreeGB { get; set; }
        public bool AiServiceStatus { get; set; }
        public int ActiveUsersCount { get; set; }
    }

    public class Alert
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public string Severity { get; set; }
        public long Timestamp { get; set; }
        public bool IsDismissed { get; set; }
        public Dictionary<string, string> Details { get; set; }
    }

    public class SecurityAlert : Alert
    {
        public string ThreatSource { get; set; }
        public string AffectedComponent { get; set; }
        public List<string> RemediationSteps { get; set; }
    }

    public class AlertsResponse
    {
        public List<Alert> CriticalAlerts { get; set; }
        public List<Alert> RecentAlerts { get; set; }
        public int UnreadAlertsCount { get; set; }
    }

    public class QuickActionRequest
    {
        public string ActionType { get; set; }
        public Dictionary<string, string> Parameters { get; set; }
    }

    public class ActivityItem
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public long Timestamp { get; set; }
        public string Icon { get; set; }
    }
}