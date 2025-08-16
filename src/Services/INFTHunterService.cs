using JagCodeHQ.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JagCodeHQ.Services
{
    public interface INFTHunterService
    {
        Task<ApiResponse<List<object>>> SearchNfts(object searchRequest);
        Task<ApiResponse<object>> GetNftDetails(string contractAddress, string tokenId);
        Task<ApiResponse<List<object>>> GetCollectionNfts(string collectionId);
        // Add methods for tracking, alerts, etc.
    }
}