using System.Threading.Tasks;
using System.Collections.Generic;
using JagCodeHQ.Models; // Ensure this is explicitly here

namespace JagCodeHQ.Services
{
    public interface IWalletIntegrationService
    {
        Task<ApiResponse<WalletConnectionResult>> ConnectWalletAsync(WalletConnectionRequest request);
        Task<ApiResponse<WalletBalanceResult>> GetWalletBalanceAsync(string address, string currency);
        Task<ApiResponse<TransactionHistoryResult>> GetTransactionHistoryAsync(string address);
        Task<ApiResponse<AddressValidationResult>> ValidateAddressAsync(string address, string network);
        Task<ApiResponse<SupportedWalletsResult>> GetSupportedWalletsAndChainsAsync();
        Task<ApiResponse<FeeEstimationResult>> EstimateTransactionFeeAsync(FeeEstimationRequest request);
        // Add other wallet-related operations as needed
    }
}