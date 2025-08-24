using System.Collections.Generic;

namespace JagCodeHQ.Models
{
    public class WalletConnectionRequest
    {
        public string WalletType { get; set; }
        public string Address { get; set; }
    }

    public class WalletConnectionResult
    {
        public bool IsConnected { get; set; }
        public string Message { get; set; }
        public string ConnectedAddress { get; set; }
        public string WalletType { get; set; }
    }

    public class WalletBalanceResult
    {
        public string Address { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public decimal UsdValue { get; set; }
        public long LastUpdatedTimestamp { get; set; }
    }

    public class TransactionItem
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string FromAddress { get; set; }
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public long Timestamp { get; set; }
        public string TransactionHash { get; set; }
        public string Status { get; set; }
    }

    public class TransactionHistoryResult
    {
        public string Address { get; set; }
        public List<TransactionItem> Transactions { get; set; }
        public string Message { get; set; }
    }

    public class AddressValidationResult
    {
        public string Address { get; set; }
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public string Network { get; set; }
    }

    public class SupportedWalletsResult
    {
        public List<string> SupportedWalletTypes { get; set; }
        public List<string> SupportedChains { get; set; }
    }

    public class FeeEstimationRequest
    {
        public string FromAddress { get; set; }
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Network { get; set; }
    }

    public class FeeEstimationResult
    {
        public string Network { get; set; }
        public string Currency { get; set; }
        public decimal EstimatedFee { get; set; }
        public string FeeUnit { get; set; }
        public string Message { get; set; }
    }
}