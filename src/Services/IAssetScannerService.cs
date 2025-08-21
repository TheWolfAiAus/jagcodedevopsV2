using JagCodeHQ.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JagCodeHQ.Services
{
    public interface IAssetScannerService
    {
        Task<ApiResponse<List<object>>> ScanAssets(string walletAddress, string chain);
        Task<ApiResponse<object>> GetAssetDetails(string assetId, string chain);
        // Add methods for NFT specific scanning if not covered by INFTHunterService
    }
}