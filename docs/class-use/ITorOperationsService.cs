using JagCodeHQ.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JagCodeHQ.Services
{
    public interface ITorOperationsService
    {
        Task<ApiResponse<List<object>>> DiscoverHiddenServices(object discoveryRequest);
        // Add other ethical Tor-related operations
    }
}