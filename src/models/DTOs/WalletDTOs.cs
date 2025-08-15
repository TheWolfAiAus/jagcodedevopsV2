using System.Collections.Generic;
using JagCodeHQ.Models; // For ApiResponse and ErrorResponse if needed

namespace JagCodeHQ.Models.DTOs
{
    // Request to connect a wallet
    public class WalletConnectionRequest
    {
        public string WalletType { get; set; } // e.g., "Metamask", "Trezor", "Ledger"
        public string Address { get; set; }
        // Additional fields like signature, public key might be needed for secure connection
    }

    // Result of a wallet connection attempt
    public class WalletConnectionResult
    {
        public bool IsConnected { get; set; }
        public string Message { get; set; }
        public string ConnectedAddress { get; set; }
        public string WalletType { get; set; }
    }

    // Result of fetching wallet balance
    public class WalletBalanceResult
    {
        public string Address { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public decimal UsdValue { get; set; }
        public long LastUpdatedTimestamp { get; set; }
    }

    // Represents a single transaction item
    public class TransactionItem
    {
        public string Id { get; set; }
        public string Type { get; set; } // e.g., "sent", "received", "swap"
        public string FromAddress { get; set; }
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public long Timestamp { get; set; }
        public string TransactionHash { get; set; }
        public string Status { get; set; } // e.g., "confirmed", "pending", "failed"
    }

    // Result of fetching transaction history
    public class TransactionHistoryResult
    {
        public string Address { get; set; }
        public List<TransactionItem> Transactions { get; set; }
        public string Message { get; set; }
    }

    // Result of validating an address
    public class AddressValidationResult
    {
        public string Address { get; set; }
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public string Network { get; set; } // e.g., "ethereum", "bitcoin"
    }

    // Result of fetching supported wallets/chains
    public class SupportedWalletsResult
    {
        public List<string> SupportedWalletTypes { get; set; }
        public List<string> SupportedChains { get; set; }
    }

    // Request for fee estimation
    public class FeeEstimationRequest
    {
        public string FromAddress { get; set; }
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Network { get; set; }
    }

    // Result of fee estimation
    public class FeeEstimationResult
    {
        public string Network { get; set; }
        public string Currency { get; set; }
        public decimal EstimatedFee { get; set; }
        public string FeeUnit { get; set; } // e.g., "GWEI", "satoshi"
        public string Message { get; set; }
    }
}