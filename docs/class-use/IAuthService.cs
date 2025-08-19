using System.Threading.Tasks;
using JagCodeHQ.Models; // Explicitly ensure this is here

namespace JagCodeHQ.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        // Task<User> RegisterAsync(RegistrationRequest request); // Example
        // Task<bool> ValidateTokenAsync(string token); // Example
    }
}