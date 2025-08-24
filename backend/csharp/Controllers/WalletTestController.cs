using Microsoft.AspNetCore.Mvc;
using JagCodeHQ.Services;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using JagCodeHQ.Models;

namespace JagCodeHQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletTestController : ControllerBase
    {
        private readonly IAssetScannerService _assetScannerService;
        private readonly ILogger<WalletTestController> _logger;

        // Real wallet addresses for testing (example, should be moved to config or database in production)
        private static readonly Dictionary<string, string> TestWallets = new()
        {
            ["bitcoin"] = "bc1pka4qu8c8ccrph2aemrjswmrmawfdvgts9nnjkqdd23nwq77paqlq3npf8l",
            ["ethereum"] = "0x72886c97e994413551897d2b03ded5b5a0a2028c"
        };

        public WalletTestController(
            IAssetScannerService assetScannerService,
            ILogger<WalletTestController> logger)
        {
            _assetScannerService = assetScannerService;
            _logger = logger;
        }

        /// <summary>
        /// Test endpoint to scan a predefined Bitcoin wallet for assets.
        /// </summary>
        [HttpGet("scan-test-bitcoin-wallet")]
        public async Task<ActionResult<ApiResponse<List<object>>>> ScanTestBitcoinWallet()
        {
            _logger.LogInformation("Initiating scan for test Bitcoin wallet.");
            
            if (TestWallets.TryGetValue("bitcoin", out var bitcoinAddress))
            {
                var result = await _assetScannerService.ScanAssets(bitcoinAddress, "bitcoin");
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return StatusCode(result.Error?.StatusCode ?? 500, result);
                }
            }
            return NotFound(ApiResponse<List<object>>.ErrorResponse("Test Bitcoin wallet address not found.", "WALLET_NOT_FOUND", 404));
        }

        /// <summary>
        /// Test endpoint to get details of a predefined Ethereum asset.
        /// </summary>
        [HttpGet("get-test-ethereum-asset-details")]
        public async Task<ActionResult<ApiResponse<object>>> GetTestEthereumAssetDetails()
        {
            _logger.LogInformation("Initiating asset details retrieval for test Ethereum asset.");

            // This is a placeholder. Replace with an actual test asset ID.
            const string testAssetId = "0xabc123def456"; 
            const string chain = "ethereum";

            var result = await _assetScannerService.GetAssetDetails(testAssetId, chain);
            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return StatusCode(result.Error?.StatusCode ?? 500, result);
            }
        }
    }
}