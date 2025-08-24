using Microsoft.AspNetCore.Mvc;
using JagCodeHQ.Models;
using JagCodeHQ.Services;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Collections.Generic;

namespace JagCodeHQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<LoginResponse>.ErrorResponse(
                    "Invalid login request",
                    errorCode: "INVALID_LOGIN_REQUEST",
                    statusCode: 400));
            }

            try
            {
                var result = await _authService.LoginAsync(request);

                if (result.Success)
                {
                    return Ok(ApiResponse<LoginResponse>.SuccessResponse(result));
                }
                else
                {
                    return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(
                        result.Message ?? "Login failed due to invalid credentials.",
                        errorCode: "AUTH_FAILED",
                        statusCode: 401));
                }
            }
            catch (Exception ex)
            {
                // Log the exception (e.g., using a logging framework)
                Console.WriteLine($"Login error: {ex.Message}");
                return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(
                    "An unexpected error occurred during login.",
                    errorCode: "UNEXPECTED_ERROR",
                    statusCode: 500));
            }
        }
    }
}