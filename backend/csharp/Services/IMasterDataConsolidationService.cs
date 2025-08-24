using JagCodeHQ.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JagCodeHQ.Services
{
    public interface IMasterDataConsolidationService
    {
        Task<ApiResponse<object>> ConsolidateData(object consolidationRequest);
        // Add methods for data ingestion, transformation, and storage
    }
}