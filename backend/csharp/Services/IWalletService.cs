using System.Threading.Tasks;
using System.Collections.Generic;
using JagCodeHQ.Models; // Explicitly ensure this is here

namespace JagCodeHQ.Services
{
    public interface IWalletService
    {
        Task<ApiResponse<Wallet>> GetUserWalletOverview(string userId);
        Task<ApiResponse<List<Wallet>>> GetUserWallets(string userId);
        Task<ApiResponse<bool>> AddWalletToUser(string userId, Wallet wallet);
        Task<ApiResponse<bool>> RemoveWalletFromUser(string userId, string walletAddress);
        Task<ApiResponse<WalletBalanceResult>> GetRealtimeBalance(string walletAddress, string currency);
        Task<ApiResponse<TransactionHistoryResult>> GetRealtimeTransactions(string walletAddress);
        // Add methods related to user's personal wallet management, distinct from raw integration
    }
}