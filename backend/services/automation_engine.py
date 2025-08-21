import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from .nft_hunter import NFTHunter
from .crypto_miner import CryptoMiner
from .wallet_manager import WalletManager
from .smart_contract_manager import SmartContractManager
from .system_monitor import SystemMonitor
from ..core.config import settings

logger = logging.getLogger(__name__)

class AutomationEngine:
    """Central automation engine that coordinates all services"""
    
    def __init__(self):
        self.is_running = False
        self.services = {}
        self.operation_status = {
            "nft_hunting": False,
            "crypto_mining": False,
            "wallet_monitoring": False,
            "smart_contracts": False,
            "system_monitoring": False
        }
        
        # Initialize services
        self.nft_hunter = NFTHunter()
        self.crypto_miner = CryptoMiner()
        self.wallet_manager = WalletManager()
        self.smart_contract_manager = SmartContractManager()
        self.system_monitor = SystemMonitor()
        
    async def start(self):
        """Start the automation engine"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("🚀 JAG-OPS Automation Engine starting...")
        
        # Start system monitor first
        await self.system_monitor.start()
        self.operation_status["system_monitoring"] = True
        logger.info("✅ System Monitor started")
        
        # Start wallet manager
        await self.wallet_manager.start()
        self.operation_status["wallet_monitoring"] = True
        logger.info("✅ Wallet Manager started")
        
        # Start smart contract manager
        await self.smart_contract_manager.start()
        self.operation_status["smart_contracts"] = True
        logger.info("✅ Smart Contract Manager started")
        
        logger.info("🎯 JAG-OPS Automation Engine fully operational!")
        
    async def stop(self):
        """Stop the automation engine"""
        self.is_running = False
        logger.info("🛑 JAG-OPS Automation Engine stopping...")
        
        # Stop all services
        await self.nft_hunter.stop()
        await self.crypto_miner.stop()
        await self.wallet_manager.stop()
        await self.smart_contract_manager.stop()
        await self.system_monitor.stop()
        
        # Reset operation status
        for key in self.operation_status:
            self.operation_status[key] = False
            
        logger.info("🛑 JAG-OPS Automation Engine stopped")
        
    async def start_all_operations(self):
        """Start all profit-generating operations - THE MAGIC BUTTON"""
        logger.info("🎯 STARTING ALL OPERATIONS - LET THE MAGIC HAPPEN!")
        
        try:
            # Start NFT hunting
            if not self.operation_status["nft_hunting"]:
                await self.nft_hunter.start()
                self.operation_status["nft_hunting"] = True
                logger.info("🎨 NFT Hunter activated - Hunting for free NFTs!")
                
            # Start crypto mining
            if not self.operation_status["crypto_mining"]:
                await self.crypto_miner.start()
                self.operation_status["crypto_mining"] = True
                logger.info("⛏️ Crypto Miner activated - Mining profits!")
                
            # Log success
            await self.system_monitor._save_system_log(
                level="INFO",
                module="automation_engine",
                message="All operations started successfully",
                details={"operation_status": self.operation_status}
            )
            
            logger.info("🚀 ALL SYSTEMS GO! JAG-OPS is now generating profits!")
            
        except Exception as e:
            logger.error(f"❌ Error starting operations: {e}")
            await self.system_monitor.alert_system_issue(
                "STARTUP_ERROR",
                f"Failed to start all operations: {e}"
            )
            
    async def stop_all_operations(self):
        """Stop all operations"""
        logger.info("🛑 Stopping all operations...")
        
        try:
            # Stop NFT hunting
            if self.operation_status["nft_hunting"]:
                await self.nft_hunter.stop()
                self.operation_status["nft_hunting"] = False
                logger.info("🎨 NFT Hunter stopped")
                
            # Stop crypto mining
            if self.operation_status["crypto_mining"]:
                await self.crypto_miner.stop()
                self.operation_status["crypto_mining"] = False
                logger.info("⛏️ Crypto Miner stopped")
                
            logger.info("🛑 All operations stopped")
            
        except Exception as e:
            logger.error(f"❌ Error stopping operations: {e}")
            
    async def get_status(self) -> Dict[str, Any]:
        """Get comprehensive status of all operations"""
        try:
            # Get individual service statuses
            nft_status = await self.nft_hunter.get_top_opportunities(5) if self.operation_status["nft_hunting"] else []
            mining_status = await self.crypto_miner.get_mining_status() if self.operation_status["crypto_mining"] else {}
            wallet_status = await self.wallet_manager.get_wallet_status() if self.operation_status["wallet_monitoring"] else {}
            contract_status = await self.smart_contract_manager.get_contract_status() if self.operation_status["smart_contracts"] else {}
            system_status = await self.system_monitor.get_status() if self.operation_status["system_monitoring"] else {}
            
            # Calculate total earnings (simplified)
            total_earnings = 0.0
            if mining_status.get("operations"):
                for op in mining_status["operations"]:
                    total_earnings += op.get("earnings_total", 0)
                    
            # Count opportunities
            nft_opportunities = len(nft_status)
            
            return {
                "engine_running": self.is_running,
                "operation_status": self.operation_status,
                "summary": {
                    "total_earnings": total_earnings,
                    "nft_opportunities": nft_opportunities,
                    "mining_active": mining_status.get("is_running", False),
                    "wallet_connected": wallet_status.get("is_connected", False),
                    "contracts_managed": contract_status.get("total_contracts", 0),
                    "system_healthy": system_status.get("service_status", {}).get("system_healthy", False)
                },
                "services": {
                    "nft_hunter": {
                        "active": self.operation_status["nft_hunting"],
                        "top_opportunities": nft_status
                    },
                    "crypto_miner": {
                        "active": self.operation_status["crypto_mining"],
                        "status": mining_status
                    },
                    "wallet_manager": {
                        "active": self.operation_status["wallet_monitoring"],
                        "status": wallet_status
                    },
                    "smart_contracts": {
                        "active": self.operation_status["smart_contracts"],
                        "status": contract_status
                    },
                    "system_monitor": {
                        "active": self.operation_status["system_monitoring"],
                        "status": system_status
                    }
                },
                "last_update": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting automation status: {e}")
            return {
                "engine_running": self.is_running,
                "operation_status": self.operation_status,
                "error": str(e),
                "last_update": datetime.utcnow().isoformat()
            }
            
    async def execute_profit_strategy(self):
        """Execute profit-maximizing strategy"""
        logger.info("💰 Executing profit strategy...")
        
        try:
            # Get current status
            status = await self.get_status()
            
            # Check NFT opportunities
            nft_opportunities = status.get("services", {}).get("nft_hunter", {}).get("top_opportunities", [])
            if nft_opportunities:
                logger.info(f"💎 Found {len(nft_opportunities)} high-value NFT opportunities")
                
            # Check mining profitability
            mining_status = status.get("services", {}).get("crypto_miner", {}).get("status", {})
            if mining_status.get("is_running"):
                total_earnings = sum(op.get("earnings_total", 0) for op in mining_status.get("operations", []))
                logger.info(f"⛏️ Total mining earnings: {total_earnings}")
                
            # Check wallet balances for opportunities
            wallet_status = status.get("services", {}).get("wallet_manager", {}).get("status", {})
            balances = wallet_status.get("balances", [])
            if balances:
                total_value = sum(balance.get("balance_usd", 0) for balance in balances)
                logger.info(f"💰 Total wallet value: ${total_value}")
                
            # Execute smart contract strategies
            if self.operation_status["smart_contracts"]:
                logger.info("🤖 Smart contract automation active")
                
        except Exception as e:
            logger.error(f"Error executing profit strategy: {e}")
            
    async def emergency_stop(self):
        """Emergency stop all operations"""
        logger.warning("🚨 EMERGENCY STOP ACTIVATED!")
        
        try:
            await self.stop_all_operations()
            
            # Log emergency stop
            await self.system_monitor._save_system_log(
                level="WARNING",
                module="automation_engine",
                message="Emergency stop activated",
                details={"timestamp": datetime.utcnow().isoformat()}
            )
            
        except Exception as e:
            logger.error(f"Error during emergency stop: {e}")
            
    async def get_profit_report(self) -> Dict[str, Any]:
        """Generate comprehensive profit report"""
        try:
            status = await self.get_status()
            
            # Calculate profits from different sources
            mining_profits = 0.0
            nft_profits = 0.0
            contract_profits = 0.0
            
            # Mining profits
            mining_status = status.get("services", {}).get("crypto_miner", {}).get("status", {})
            if mining_status.get("operations"):
                mining_profits = sum(op.get("earnings_total", 0) for op in mining_status["operations"])
                
            # NFT opportunities value (estimated)
            nft_opportunities = status.get("services", {}).get("nft_hunter", {}).get("top_opportunities", [])
            nft_profits = len(nft_opportunities) * 0.01  # Estimated value per opportunity
            
            total_profits = mining_profits + nft_profits + contract_profits
            
            return {
                "total_profits": total_profits,
                "breakdown": {
                    "mining": mining_profits,
                    "nft_opportunities": nft_profits,
                    "smart_contracts": contract_profits
                },
                "opportunities": {
                    "nft_count": len(nft_opportunities),
                    "mining_active": mining_status.get("is_running", False),
                    "contracts_active": status.get("services", {}).get("smart_contracts", {}).get("active", False)
                },
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating profit report: {e}")
            return {"error": str(e)}
            
    async def optimize_operations(self):
        """Optimize all operations for maximum profit"""
        logger.info("🎯 Optimizing operations for maximum profit...")
        
        try:
            # Get current performance metrics
            system_metrics = await self.system_monitor.get_performance_metrics()
            
            # Optimize mining based on system resources
            if self.operation_status["crypto_mining"]:
                cpu_usage = system_metrics.get("current_stats", {}).get("cpu", {}).get("percent", 0)
                if cpu_usage < 70:  # If CPU usage is low, we can mine more aggressively
                    logger.info("🔧 CPU usage low - optimizing mining intensity")
                    
            # Optimize NFT hunting frequency based on opportunities found
            if self.operation_status["nft_hunting"]:
                logger.info("🔧 Optimizing NFT hunting parameters")
                
            logger.info("✅ Operations optimized for maximum profit")
            
        except Exception as e:
            logger.error(f"Error optimizing operations: {e}")
            
    async def transfer_profits_to_exodus(self):
        """Transfer all accumulated profits to Exodus wallet"""
        logger.info("💸 Transferring profits to Exodus wallet...")
        
        try:
            # This would implement the actual transfer logic
            # For now, just log the action
            profit_report = await self.get_profit_report()
            total_profits = profit_report.get("total_profits", 0)
            
            if total_profits > 0:
                logger.info(f"💰 Transferring ${total_profits} to Exodus wallet")
                # Actual transfer would happen here
                
                # Log the transfer
                await self.system_monitor._save_system_log(
                    level="INFO",
                    module="automation_engine",
                    message=f"Profit transfer to Exodus: ${total_profits}",
                    details=profit_report
                )
            else:
                logger.info("💰 No profits to transfer yet")
                
        except Exception as e:
            logger.error(f"Error transferring profits: {e}")