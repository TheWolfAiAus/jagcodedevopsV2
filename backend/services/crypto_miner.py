import asyncio
import aiohttp
import logging
import subprocess
import psutil
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from ..core.config import settings
from ..core.database import AsyncSessionLocal, MiningOperation
from sqlalchemy import select, update

logger = logging.getLogger(__name__)

class CryptoMiner:
    """Cryptocurrency mining service"""
    
    def __init__(self):
        self.is_running = False
        self.mining_processes: Dict[str, subprocess.Popen] = {}
        self.mining_stats: Dict[str, Dict[str, Any]] = {}
        
    async def start(self):
        """Start the crypto mining service"""
        if self.is_running or not settings.MINING_ENABLED:
            return
            
        self.is_running = True
        logger.info("Crypto Mining service started")
        
        # Initialize mining operations in database
        await self._initialize_mining_operations()
        
        # Start mining for configured coins
        for coin in settings.MINING_COINS:
            await self._start_mining_coin(coin)
            
        # Start monitoring loop
        asyncio.create_task(self._monitoring_loop())
        
    async def stop(self):
        """Stop the crypto mining service"""
        self.is_running = False
        
        # Stop all mining processes
        for coin, process in self.mining_processes.items():
            try:
                process.terminate()
                process.wait(timeout=10)
                logger.info(f"Stopped mining {coin}")
            except Exception as e:
                logger.error(f"Error stopping {coin} mining: {e}")
                try:
                    process.kill()
                except:
                    pass
                    
        self.mining_processes.clear()
        logger.info("Crypto Mining service stopped")
        
    async def _initialize_mining_operations(self):
        """Initialize mining operations in database"""
        async with AsyncSessionLocal() as db:
            try:
                for coin in settings.MINING_COINS:
                    # Check if operation exists
                    stmt = select(MiningOperation).where(MiningOperation.coin == coin)
                    result = await db.execute(stmt)
                    existing = result.scalar_one_or_none()
                    
                    if not existing:
                        mining_op = MiningOperation(
                            coin=coin,
                            pool_url=settings.MINING_POOL_URLS.get(coin, ""),
                            wallet_address=settings.EXODUS_WALLET_ADDRESS,
                            status="inactive"
                        )
                        db.add(mining_op)
                        
                await db.commit()
                logger.info("Mining operations initialized in database")
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error initializing mining operations: {e}")
                
    async def _start_mining_coin(self, coin: str):
        """Start mining for a specific coin"""
        try:
            if coin in self.mining_processes:
                logger.warning(f"Mining for {coin} already running")
                return
                
            miner_config = self._get_miner_config(coin)
            if not miner_config:
                logger.error(f"No miner configuration found for {coin}")
                return
                
            # Start mining process
            process = await self._start_miner_process(coin, miner_config)
            if process:
                self.mining_processes[coin] = process
                self.mining_stats[coin] = {
                    "started_at": datetime.utcnow(),
                    "hashrate": 0.0,
                    "shares_accepted": 0,
                    "shares_rejected": 0,
                    "earnings": 0.0
                }
                
                # Update database
                await self._update_mining_status(coin, "active")
                logger.info(f"Started mining {coin}")
                
        except Exception as e:
            logger.error(f"Error starting mining for {coin}: {e}")
            
    def _get_miner_config(self, coin: str) -> Optional[Dict[str, Any]]:
        """Get miner configuration for a coin"""
        configs = {
            "ETH": {
                "executable": "t-rex.exe",  # T-Rex miner for NVIDIA
                "algorithm": "ethash",
                "pool": settings.MINING_POOL_URLS.get("ETH", ""),
                "wallet": settings.EXODUS_WALLET_ADDRESS,
                "worker": "jagops-rig1"
            },
            "BTC": {
                "executable": "cgminer.exe",  # CGMiner for Bitcoin
                "algorithm": "sha256",
                "pool": settings.MINING_POOL_URLS.get("BTC", ""),
                "wallet": settings.EXODUS_WALLET_ADDRESS,
                "worker": "jagops-rig1"
            },
            "MATIC": {
                "executable": "t-rex.exe",
                "algorithm": "ethash",
                "pool": "stratum1+tcp://matic.pool.com:4444",
                "wallet": settings.EXODUS_WALLET_ADDRESS,
                "worker": "jagops-rig1"
            },
            "BNB": {
                "executable": "t-rex.exe",
                "algorithm": "ethash",
                "pool": "stratum1+tcp://bnb.pool.com:4444",
                "wallet": settings.EXODUS_WALLET_ADDRESS,
                "worker": "jagops-rig1"
            }
        }
        
        return configs.get(coin)
        
    async def _start_miner_process(self, coin: str, config: Dict[str, Any]) -> Optional[subprocess.Popen]:
        """Start the actual miner process"""
        try:
            if coin == "ETH":
                # T-Rex miner command for Ethereum
                cmd = [
                    config["executable"],
                    "-a", config["algorithm"],
                    "-o", config["pool"],
                    "-u", f"{config['wallet']}.{config['worker']}",
                    "-w", config["worker"],
                    "--api-bind-http", "127.0.0.1:4067",
                    "--no-watchdog"
                ]
            elif coin == "BTC":
                # CGMiner command for Bitcoin
                cmd = [
                    config["executable"],
                    "--scrypt",
                    "-o", config["pool"],
                    "-u", f"{config['wallet']}.{config['worker']}",
                    "-p", "x",
                    "--api-listen",
                    "--api-port", "4028"
                ]
            else:
                # Generic T-Rex command for other coins
                cmd = [
                    config["executable"],
                    "-a", config["algorithm"],
                    "-o", config["pool"],
                    "-u", f"{config['wallet']}.{config['worker']}",
                    "-w", config["worker"],
                    "--api-bind-http", f"127.0.0.1:{4067 + hash(coin) % 100}",
                    "--no-watchdog"
                ]
                
            # Start process
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
            )
            
            # Wait a moment to check if process started successfully
            await asyncio.sleep(2)
            if process.poll() is None:
                return process
            else:
                logger.error(f"Miner process for {coin} failed to start")
                return None
                
        except Exception as e:
            logger.error(f"Error starting miner process for {coin}: {e}")
            return None
            
    async def _monitoring_loop(self):
        """Monitor mining operations"""
        while self.is_running:
            try:
                for coin in list(self.mining_processes.keys()):
                    await self._update_mining_stats(coin)
                    
                # Update database with current stats
                await self._save_mining_stats()
                
            except Exception as e:
                logger.error(f"Error in mining monitoring loop: {e}")
                
            await asyncio.sleep(60)  # Update every minute
            
    async def _update_mining_stats(self, coin: str):
        """Update mining statistics for a coin"""
        try:
            process = self.mining_processes.get(coin)
            if not process:
                return
                
            # Check if process is still running
            if process.poll() is not None:
                logger.warning(f"Mining process for {coin} has stopped")
                del self.mining_processes[coin]
                await self._update_mining_status(coin, "error")
                return
                
            # Get stats from miner API
            stats = await self._get_miner_api_stats(coin)
            if stats:
                self.mining_stats[coin].update(stats)
                
        except Exception as e:
            logger.error(f"Error updating stats for {coin}: {e}")
            
    async def _get_miner_api_stats(self, coin: str) -> Optional[Dict[str, Any]]:
        """Get statistics from miner API"""
        try:
            if coin == "ETH":
                # T-Rex API
                async with aiohttp.ClientSession() as session:
                    async with session.get("http://127.0.0.1:4067/summary") as response:
                        if response.status == 200:
                            data = await response.json()
                            return {
                                "hashrate": data.get("hashrate", 0) / 1e6,  # Convert to MH/s
                                "shares_accepted": data.get("accepted_count", 0),
                                "shares_rejected": data.get("rejected_count", 0)
                            }
            elif coin == "BTC":
                # CGMiner API (simplified)
                return {
                    "hashrate": 0.0,  # Would need to implement CGMiner API parsing
                    "shares_accepted": 0,
                    "shares_rejected": 0
                }
                
        except Exception as e:
            logger.error(f"Error getting API stats for {coin}: {e}")
            
        return None
        
    async def _save_mining_stats(self):
        """Save current mining statistics to database"""
        async with AsyncSessionLocal() as db:
            try:
                for coin, stats in self.mining_stats.items():
                    stmt = update(MiningOperation).where(
                        MiningOperation.coin == coin
                    ).values(
                        hashrate=stats.get("hashrate", 0.0),
                        shares_accepted=stats.get("shares_accepted", 0),
                        shares_rejected=stats.get("shares_rejected", 0),
                        last_update=datetime.utcnow()
                    )
                    await db.execute(stmt)
                    
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error saving mining stats: {e}")
                
    async def _update_mining_status(self, coin: str, status: str):
        """Update mining operation status"""
        async with AsyncSessionLocal() as db:
            try:
                stmt = update(MiningOperation).where(
                    MiningOperation.coin == coin
                ).values(
                    status=status,
                    started_at=datetime.utcnow() if status == "active" else None,
                    last_update=datetime.utcnow()
                )
                await db.execute(stmt)
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error updating mining status for {coin}: {e}")
                
    async def get_mining_status(self) -> Dict[str, Any]:
        """Get current mining status"""
        async with AsyncSessionLocal() as db:
            stmt = select(MiningOperation)
            result = await db.execute(stmt)
            operations = result.scalars().all()
            
            return {
                "is_running": self.is_running,
                "operations": [
                    {
                        "coin": op.coin,
                        "status": op.status,
                        "hashrate": op.hashrate,
                        "shares_accepted": op.shares_accepted,
                        "shares_rejected": op.shares_rejected,
                        "earnings_today": op.earnings_today,
                        "earnings_total": op.earnings_total,
                        "started_at": op.started_at.isoformat() if op.started_at else None,
                        "last_update": op.last_update.isoformat()
                    }
                    for op in operations
                ]
            }
            
    async def start_mining_coin(self, coin: str) -> bool:
        """Manually start mining for a specific coin"""
        if coin not in settings.MINING_COINS:
            return False
            
        await self._start_mining_coin(coin)
        return coin in self.mining_processes
        
    async def stop_mining_coin(self, coin: str) -> bool:
        """Manually stop mining for a specific coin"""
        if coin not in self.mining_processes:
            return False
            
        try:
            process = self.mining_processes[coin]
            process.terminate()
            process.wait(timeout=10)
            del self.mining_processes[coin]
            await self._update_mining_status(coin, "inactive")
            logger.info(f"Stopped mining {coin}")
            return True
            
        except Exception as e:
            logger.error(f"Error stopping mining for {coin}: {e}")
            return False