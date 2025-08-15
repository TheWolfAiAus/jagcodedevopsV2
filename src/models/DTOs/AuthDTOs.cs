using JagCodeHQ.Models; // For ApiResponse and ErrorResponse if needed

namespace JagCodeHQ.Models.DTOs
{
    // Represents a user in the system
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        // In a real app, do NOT expose password hash here.
        // public string PasswordHash { get; set; }
    }

    // Request body for login
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // Response body for successful login
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public User User { get; set; }
        public string Token { get; set; } // JWT or session token
    }
}