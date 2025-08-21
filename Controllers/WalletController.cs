using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Net;

using JagCodeHQ.Models; // Ensure this is explicitly here
using JagCodeHQ.Services; // Ensure this is explicitly here

namespace JagCodeHQ.Controllers
{
    /// <summary>
    /// Wallet integration controller providing comprehensive cryptocurrency wallet operations
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Produces("application/json")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletIntegrationService _walletService;
        private readonly ILogger<WalletController> _logger;

        public WalletController(
            IWalletIntegrationService walletService,
            ILogger<WalletController> logger)
        {
            _walletService = walletService ?? throw new ArgumentNullException(nameof(walletService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Connect to a cryptocurrency wallet
        /// </summary>
        /// <param name="request">Wallet connection request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Wallet connection result</returns>
        [HttpPost("connect")]
        [ProducesResponseType(typeof(ApiResponse<WalletConnectionResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> ConnectWallet(
            [FromBody] WalletConnectionRequest request,
            CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "ConnectWallet",
                ["WalletType"] = request.WalletType
            });

            _logger.LogInformation("Wallet connection request received");

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Invalid wallet connection request",
                        errorCode: "INVALID_REQUEST",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                var result = await _walletService.ConnectWalletAsync(request, cancellationToken);

                if (result.Success)
                {
                    _logger.LogInformation("Wallet connected successfully: {ConnectedAddress}", result.Data?.ConnectedAddress);
                    
                    return Ok(ApiResponse<WalletConnectionResult>.SuccessResponse(
                        result.Data,
                        "Wallet connected successfully"));
                }
                else
                {
                    _logger.LogWarning("Wallet connection failed: {ErrorMessage}", result.Message);
                    
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        result.Message ?? "Wallet connection failed",
                        errorCode: result.Error?.ErrorCode,
                        statusCode: result.Error?.StatusCode ?? (int)HttpStatusCode.BadRequest));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect wallet");
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error during wallet connection",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }

        /// <summary>
        /// Get wallet balance for specified cryptocurrencies
        /// </summary>
        /// <param name="walletAddress">Wallet address</param>
        /// <param name="cryptocurrencies">Comma-separated list of cryptocurrency symbols</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Wallet balance information</returns>
        [HttpGet("{walletAddress}/balance")]
        [ProducesResponseType(typeof(ApiResponse<WalletBalanceResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetWalletBalance(
            [FromRoute] string walletAddress,
            [FromQuery] string cryptocurrencies = "BTC,ETH,BNB",
            CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "GetWalletBalance",
                ["WalletAddress"] = walletAddress
            });

            try
            {
                if (string.IsNullOrWhiteSpace(walletAddress))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Wallet address is required",
                        errorCode: "INVALID_ADDRESS",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                var cryptoList = cryptocurrencies.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(c => c.Trim().ToUpper())
                    .ToList();

                var allBalances = new List<WalletBalanceResult>();
                foreach (var cryptoSymbol in cryptoList)
                {
                    var result = await _walletService.GetWalletBalanceAsync(walletAddress, cryptoSymbol, cancellationToken);
                    if (result.Success && result.Data != null)
                    {
                        allBalances.Add(result.Data);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to get balance for {CryptoSymbol}: {ErrorMessage}", cryptoSymbol, result.Message);
                    }
                }

                if (allBalances.Any())
                {
                    return Ok(ApiResponse<List<WalletBalanceResult>>.SuccessResponse(
                        allBalances,
                        "Wallet balance(s) retrieved successfully"));
                }
                else
                {
                     return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Failed to retrieve wallet balance for any specified cryptocurrency or no balances found",
                        errorCode: "NO_BALANCES_FOUND",
                        statusCode: (int)HttpStatusCode.NotFound));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get wallet balance for {WalletAddress}", walletAddress);
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error while retrieving wallet balance",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }

        /// <summary>
        /// Get transaction history for a wallet
        /// </summary>
        /// <param name="walletAddress">Wallet address</param>
        /// <param name="cryptocurrency">Cryptocurrency symbol</param>
        /// <param name="limit">Maximum number of transactions to return</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Transaction history</returns>
        [HttpGet("{walletAddress}/transactions")]
        [ProducesResponseType(typeof(ApiResponse<TransactionHistoryResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetTransactionHistory(
            [FromRoute] string walletAddress,
            [FromQuery] string cryptocurrency = "ETH",
            [FromQuery] int limit = 100,
            CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "GetTransactionHistory",
                ["WalletAddress"] = walletAddress,
                ["Cryptocurrency"] = cryptocurrency
            });

            try
            {
                if (string.IsNullOrWhiteSpace(walletAddress))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Wallet address is required",
                        errorCode: "INVALID_ADDRESS",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                if (limit <= 0 || limit > 1000)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Limit must be between 1 and 1000",
                        errorCode: "INVALID_LIMIT",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                var result = await _walletService.GetTransactionHistoryAsync(walletAddress, cryptocurrency, cancellationToken); 

                if (result.Success)
                {
                    return Ok(ApiResponse<TransactionHistoryResult>.SuccessResponse(
                        result.Data,
                        "Transaction history retrieved successfully"));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Failed to retrieve transaction history",
                        errorCode: result.Error?.ErrorCode,
                        statusCode: result.Error?.StatusCode ?? (int)HttpStatusCode.BadRequest));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get transaction history for {WalletAddress}", walletAddress);
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error while retrieving transaction history",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }

        /// <summary>
        /// Validate a cryptocurrency wallet address
        /// </summary>
        /// <param name="address">Wallet address to validate</param>
        /// <param name="cryptocurrency">Cryptocurrency symbol (used as network for validation)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Address validation result</returns>
        [HttpGet("validate/{address}")]
        [ProducesResponseType(typeof(ApiResponse<AddressValidationResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> ValidateAddress(
            [FromRoute] string address,
            [FromQuery] string cryptocurrency = "ETH",
            CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "ValidateAddress",
                ["Address"] = address,
                ["Cryptocurrency"] = cryptocurrency
            });

            try
            {
                if (string.IsNullOrWhiteSpace(address))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Address is required",
                        errorCode: "INVALID_ADDRESS",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                var result = await _walletService.ValidateAddressAsync(address, cryptocurrency, cancellationToken);

                return Ok(ApiResponse<AddressValidationResult>.SuccessResponse(
                    result.Data,
                    result.Success ? "Address is valid" : "Address is invalid"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate address {Address}", address);
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error while validating address",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }

        /// <summary>
        /// Get supported wallets and cryptocurrencies
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Supported wallet information</returns>
        [HttpGet("supported")]
        [ProducesResponseType(typeof(ApiResponse<SupportedWalletsResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> GetSupportedWallets(CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "GetSupportedWallets"
            });

            try
            {
                var result = await _walletService.GetSupportedWalletsAndChainsAsync(cancellationToken);

                return Ok(ApiResponse<SupportedWalletsResult>.SuccessResponse(
                    result.Data,
                    "Supported wallets retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get supported wallets");
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error while retrieving supported wallets",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }

        /// <summary>
        /// Estimate transaction fees
        /// </summary>
        /// <param name="request">Fee estimation request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Fee estimation result</returns>
        [HttpPost("estimate-fee")]
        [ProducesResponseType(typeof(ApiResponse<FeeEstimationResult>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> EstimateTransactionFee(
            [FromBody] FeeEstimationRequest request,
            CancellationToken cancellationToken = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["Operation"] = "EstimateTransactionFee",
                ["Currency"] = request.Currency
            });

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Invalid fee estimation request",
                        errorCode: "INVALID_REQUEST",
                        statusCode: (int)HttpStatusCode.BadRequest));
                }

                var result = await _walletService.EstimateTransactionFeeAsync(request, cancellationToken);

                if (result.Success)
                {
                    return Ok(ApiResponse<FeeEstimationResult>.SuccessResponse(
                        result.Data,
                        "Transaction fee estimated successfully"));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Failed to estimate transaction fee",
                        errorCode: result.Error?.ErrorCode,
                        statusCode: result.Error?.StatusCode ?? (int)HttpStatusCode.BadRequest));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to estimate transaction fee");
                
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "Internal server error while estimating transaction fee",
                        errorCode: "INTERNAL_ERROR",
                        statusCode: (int)HttpStatusCode.InternalServerError));
            }
        }
    }
}