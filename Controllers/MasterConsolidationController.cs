using Microsoft.AspNetCore.Mvc;
using JagCodeHQ.Services;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.IO; 
using JagCodeHQ.Models; 

namespace JagCodeHQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MasterConsolidationController : ControllerBase
    {
        private readonly IMasterDataConsolidationService _consolidationService;
        private readonly ILogger<MasterConsolidationController> _logger;

        public MasterConsolidationController(
            IMasterDataConsolidationService consolidationService,
            ILogger<MasterConsolidationController> logger)
        {
            _consolidationService = consolidationService;
            _logger = logger;
        }

        [HttpPost("consolidate-all")]
        public async Task<IActionResult> ConsolidateAllDataAndServices()
        {
            var correlationId = Guid.NewGuid().ToString();
            _logger.LogInformation("Starting master consolidation request with correlation ID: {CorrelationId}", correlationId);

            try
            {
                var result = await _consolidationService.ConsolidateData(null); 

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        correlationId = correlationId,
                        message = result.Message ?? "Master data consolidation completed successfully", 
                        data = result.Data 
                    });
                }
                else
                {
                    // Consistent Error Handling Fix
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        result.Message ?? "Master data consolidation failed", 
                        errorCode: result.Error?.ErrorCode, 
                        statusCode: result.Error?.StatusCode ?? 400
                    ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute master consolidation");

                // Consistent Error Handling Fix
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    ex.Message ?? "Internal server error during consolidation", 
                    errorCode: "INTERNAL_SERVER_ERROR", 
                    statusCode: 500
                ));
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetConsolidationStatus()
        {
            try
            {
                var status = await GetCurrentConsolidationStatusAsync();
                
                return Ok(new
                {
                    success = true,
                    message = "Consolidation status retrieved successfully",
                    data = status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get consolidation status");
                // Fix: Consistent Error Handling
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    ex.Message ?? "Failed to retrieve consolidation status", 
                    errorCode: "CONSOLIDATION_STATUS_ERROR", 
                    statusCode: 500
                ));
            }
        }

        [HttpGet("project-analysis")]
        public async Task<IActionResult> AnalyzeProjectStructure()
        {
            try
            {
                var analysis = await AnalyzeCurrentProjectStructureAsync();
                
                return Ok(new
                {
                    success = true,
                    message = "Project structure analysis completed",
                    data = analysis
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to analyze project structure");
                // Fix: Consistent Error Handling
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    ex.Message ?? "Failed to analyze project structure", 
                    errorCode: "PROJECT_ANALYSIS_ERROR", 
                    statusCode: 500
                ));
            }
        }

        private async Task<object> GetCurrentConsolidationStatusAsync()
        {
            await Task.CompletedTask; 

            var projectRoot = Directory.GetCurrentDirectory();
            
            var subfolders = Directory.GetDirectories(projectRoot)
                .Select(d => new
                {
                    Name = Path.GetFileName(d),
                    Path = d,
                    FileCount = (Directory.Exists(d) ? Directory.GetFiles(d, "*", SearchOption.AllDirectories).Length : 0),
                    Size = GetDirectorySize(d)
                })
                .ToList();

            var importantFiles = new[]
            {
                ".envsupabase.txt",
                "thewolfai-firebase-adminsdk-fbsvc-f8c234d449.json",
                "The Wolf Data Base ODBC.dsn",
                "extraRpcs.js",
                "axios.ts"
            }.Select(f => 
            {
                string filePath = null;
                bool exists = false;
                long size = 0;

                // Fix: Add null/empty checks for projectRoot and file before Path.Combine
                if (!string.IsNullOrEmpty(projectRoot) && !string.IsNullOrEmpty(f))
                {
                    filePath = Path.Combine(projectRoot, f);
                    exists = System.IO.File.Exists(filePath);
                    if (exists)
                    {
                        size = new FileInfo(filePath).Length;
                    }
                }

                return new
                {
                    Name = f,
                    Exists = exists,
                    Size = size,
                    Type = GetConfigurationType(f)
                };
            }).ToList();

            return new
            {
                ProjectRoot = projectRoot,
                TotalSubfolders = subfolders.Count,
                Subfolders = subfolders,
                ImportantFiles = importantFiles,
                TotalProjectSize = GetDirectorySize(projectRoot),
                AnalysisTime = DateTime.UtcNow
            };
        }

        private async Task<object> AnalyzeCurrentProjectStructureAsync()
        {
            await Task.CompletedTask; 

            var projectRoot = Directory.GetCurrentDirectory();
            var analysis = new
            {
                ProjectRoot = projectRoot,
                // Note: AnalyzeSubfolder is async, but this anonymous object assignment is not awaiting it.
                // For a proper await chain, you'd need to await each call if they return Task<T>.
                // For now, leaving as is to address the specific compiler warnings first.
                CryptoTracker = await AnalyzeSubfolder("crypto-tracker"), 
                DefiAnalyzer = await AnalyzeSubfolder("defi-analyzer"),
                SmartContractGetter = await AnalyzeSubfolder("Smart Contract Getter"),
                PythonBitcoinWallet = await AnalyzeSubfolder("PYTHON - BITCOIN & WALLET CYPHER"),
                ExistingServices = await AnalyzeSubfolder("Services"),
                Controllers = await AnalyzeSubfolder("Controllers"),
                Models = await AnalyzeSubfolder("Models"),
                ConfigurationFiles = AnalyzeConfigurationFiles(),
                RecommendedConsolidationPlan = GenerateConsolidationPlan()
            };

            return analysis;
        }

        private async Task<object> AnalyzeSubfolder(string folderName)
        {
            await Task.CompletedTask; 

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            
            // Fix: Add null/empty check for folderPath before Directory.Exists
            if (string.IsNullOrEmpty(folderPath) || !Directory.Exists(folderPath))
            {
                return new { Exists = false, Message = $"Folder '{folderName}' not found or path is invalid" };
            }

            var files = Directory.GetFiles(folderPath, "*", SearchOption.AllDirectories);
            var fileTypes = files.GroupBy(f => Path.GetExtension(f)?.ToLower() ?? "") 
                .ToDictionary(g => g.Key, g => g.Count());

            return new
            {
                Exists = true,
                Path = folderPath,
                TotalFiles = files.Length,
                FileTypes = fileTypes,
                Size = GetDirectorySize(folderPath),
                PythonFiles = files.Count(f => f.EndsWith(".py")),
                JavaScriptFiles = files.Count(f => f.EndsWith(".js") || f.EndsWith(".ts")),
                CSharpFiles = files.Count(f => f.EndsWith(".cs")),
                ConfigFiles = files.Count(f => f.EndsWith(".json") || f.EndsWith(".xml") || f.EndsWith(".config"))
            };
        }

        private object AnalyzeConfigurationFiles()
        {
            var projectRoot = Directory.GetCurrentDirectory();
            var configFiles = new[]
            {
                ".envsupabase.txt",
                "thewolfai-firebase-adminsdk-fbsvc-f8c234d449.json",
                "The Wolf Data Base ODBC.dsn",
                "extraRpcs.js",
                "axios.ts"
            };

            return configFiles.Select(file => 
            {
                string filePath = null;
                bool exists = false;
                long size = 0;

                if (!string.IsNullOrEmpty(projectRoot) && !string.IsNullOrEmpty(file))
                {
                    filePath = Path.Combine(projectRoot, file);
                    exists = System.IO.File.Exists(filePath);
                    if (exists)
                    {
                        size = new FileInfo(filePath).Length;
                    }
                }

                return new
                {
                    Name = file,
                    Exists = exists,
                    Size = size,
                    Type = GetConfigurationType(file)
                };
            }).ToList();
        }

        private string GetConfigurationType(string fileName)
        {
            return fileName switch
            {
                ".envsupabase.txt" => "Supabase Database Configuration",
                "thewolfai-firebase-adminsdk-fbsvc-f8c234d449.json" => "Firebase Admin SDK Credentials",
                "The Wolf Data Base ODBC.dsn" => "Legacy Database Connection",
                "extraRpcs.js" => "Blockchain RPC Network Configuration",
                "axios.ts" => "HTTP Client Configuration",
                _ => "Unknown Configuration"
            };
        }

        private object GenerateConsolidationPlan()
        {
            return new
            {
                Phase1_DatabaseSetup = new
                {
                    Description = "Create master SQLite database on external drive",
                    EstimatedTime = "5-10 minutes",
                    Actions = new[]
                    {
                        "Initialize SQLite database with comprehensive schema",
                        "Set up encryption for sensitive data",
                        "Create backup and recovery procedures"
                    }
                },
                Phase2_DataConsolidation = new
                {
                    Description = "Consolidate all project files and configurations",
                    EstimatedTime = "10-15 minutes",
                    Actions = new[]
                    {
                        "Copy all important configuration files",
                        "Consolidate Services, Controllers, Models directories",
                        "Store encrypted credentials in database"
                    }
                },
                Phase3_PythonConversion = new
                {
                    Description = "Convert Python scripts to .NET services",
                    EstimatedTime = "15-20 minutes",
                    Actions = new[]
                    {
                        "Analyze Python scripts in PYTHON - BITCOIN & WALLET CYPHER",
                        "Generate equivalent C# service classes",
                        "Create service registration and dependency injection"
                    }
                },
                Phase4_ServiceMerging = new
                {
                    Description = "Merge existing project components into unified services",
                    EstimatedTime = "10-15 minutes",
                    Actions = new[]
                    {
                        "Merge crypto-tracker into UnifiedCryptoTrackingService",
                        "Merge defi-analyzer into UnifiedDefiAnalyzerService",
                        "Merge Smart Contract Getter into UnifiedSmartContractService"
                    }
                },
                Phase5_FinalBackup = new
                {
                    Description = "Create comprehensive backup on external drive",
                    EstimatedTime = "5-10 minutes",
                    Actions = new[]
                    {
                        "Create compressed backup of all consolidated data",
                        "Verify backup integrity",
                        "Generate backup manifest and checksums"
                    }
                },
                TotalEstimatedTime = "45-70 minutes",
                RecommendedApproach = "Execute all phases in sequence with real-time progress updates"
            };
        }

        private long GetDirectorySize(string directoryPath)
        {
            if (string.IsNullOrEmpty(directoryPath) || !Directory.Exists(directoryPath))
                return 0;

            try
            {
                return Directory.GetFiles(directoryPath, "*", SearchOption.AllDirectories)
                    .Sum(file => new FileInfo(file).Length);
            }
            catch(Exception ex) 
            {
                _logger.LogError(ex, "Error calculating directory size for {DirectoryPath}", directoryPath);
                throw; // Rethrow the exception to propagate it
            }
        }
    }
}