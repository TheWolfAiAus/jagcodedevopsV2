using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JagCodeHQ.Services;

namespace JagCodeHQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WolfAIController : ControllerBase
    {
        private readonly IWolfAIService _wolfAIService;

        public WolfAIController(IWolfAIService wolfAIService)
        {
            _wolfAIService = wolfAIService;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<object>> Chat([FromBody] object request)
        {
            // Extract message from request
            var message = request.ToString() ?? "";
            var response = await _wolfAIService.SendMessageAsync(message);

            return Ok(new { response = response, timestamp = DateTime.UtcNow });
        }

        [HttpPost("analyze/market")]
        public async Task<ActionResult<object>> AnalyzeMarket([FromBody] object marketData)
        {
            var result = await _wolfAIService.AnalyzeMarketDataAsync(marketData);
            return Ok(result);
        }

        [HttpGet("predict/price/{symbol}")]
        public async Task<ActionResult<object>> PredictPrice(string symbol, [FromQuery] int days = 7)
        {
            var result = await _wolfAIService.PredictPriceAsync(symbol, days);
            return Ok(result);
        }

        [HttpPost("analyze/wallet")]
        public async Task<ActionResult<object>> AnalyzeWallet([FromBody] object request)
        {
            // This would extract address and network from request
            var result = await _wolfAIService.AnalyzeWalletAsync("", "");
            return Ok(result);
        }

        [HttpPost("scan/opportunities")]
        public async Task<ActionResult<object>> ScanOpportunities([FromBody] string[] networks)
        {
            var result = await _wolfAIService.ScanForOpportunitiesAsync(networks);
            return Ok(result);
        }

        [HttpGet("status")]
        public async Task<ActionResult<object>> GetStatus()
        {
            var status = await _wolfAIService.GetAIStatusAsync();
            var isHealthy = await _wolfAIService.IsHealthyAsync();

            return Ok(new { status = status, isHealthy = isHealthy, timestamp = DateTime.UtcNow });
        }

        [HttpPost("learn/start")]
        public async Task<ActionResult<object>> StartLearning([FromBody] object request)
        {
            // This would extract taskType and parameters from request
            var result = await _wolfAIService.StartLearningTaskAsync("", request);
            return Ok(result);
        }
    }
}