using JagCodeHQ.Models;
using System.Threading.Tasks;

namespace JagCodeHQ.Services
{
    public class AuthService : IAuthService
    {
        // In a real application, this would interact with a database and securely hash passwords.
        // This is a placeholder for basic functionality.
        private readonly List<User> _users = new List<User>
        {
            new User { Id = 1, Username = "admin1", Email = "admin1@example.com" },
            new User { Id = 2, Username = "admin2", Email = "admin2@example.com" },
            new User { Id = 3, Username = "admin3", Email = "admin3@example.com" },
            new User { Id = 4, Username = "admin4", Email = "admin4@example.com" },
            new User { Id = 5, Username = "admin5", Email = "admin5@example.com" },
        };

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // Placeholder for password validation
            var user = _users.FirstOrDefault(u => u.Username == request.Username && request.Password == $"password{u.Id}");

            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid username or password." };
            }

            // In a real application, generate a JWT token here.
            string token = "mock_jwt_token_for_" + user.Username;

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                User = user,
                Token = token
            };
        }
    }
}