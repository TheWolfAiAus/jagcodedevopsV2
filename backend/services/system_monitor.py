import asyncio
import psutil
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

from ..core.config import settings
from ..core.database import AsyncSessionLocal, SystemLog
from sqlalchemy import select

logger = logging.getLogger(__name__)

class SystemMonitor:
    """System monitoring and health check service"""
    
    def __init__(self):
        self.is_running = False
        self.system_stats = {}
        self.service_status = {}
        
    async def start(self):
        """Start the system monitoring service"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("System Monitor service started")
        
        # Start monitoring loop
        asyncio.create_task(self._monitoring_loop())
        
    async def stop(self):
        """Stop the system monitoring service"""
        self.is_running = False
        logger.info("System Monitor service stopped")
        
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_running:
            try:
                # Collect system statistics
                await self._collect_system_stats()
                
                # Check service health
                await self._check_service_health()
                
                # Log system status
                await self._log_system_status()
                
            except Exception as e:
                logger.error(f"Error in system monitoring loop: {e}")
                
            await asyncio.sleep(settings.SYSTEM_MONITOR_INTERVAL)
            
    async def _collect_system_stats(self):
        """Collect system performance statistics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available / (1024**3)  # GB
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            disk_free = disk.free / (1024**3)  # GB
            
            # Network I/O
            network = psutil.net_io_counters()
            
            # Process count
            process_count = len(psutil.pids())
            
            self.system_stats = {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "memory": {
                    "percent": memory_percent,
                    "available_gb": round(memory_available, 2),
                    "total_gb": round(memory.total / (1024**3), 2)
                },
                "disk": {
                    "percent": disk_percent,
                    "free_gb": round(disk_free, 2),
                    "total_gb": round(disk.total / (1024**3), 2)
                },
                "network": {
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                },
                "processes": process_count
            }
            
        except Exception as e:
            logger.error(f"Error collecting system stats: {e}")
            
    async def _check_service_health(self):
        """Check health of all services"""
        try:
            # Check if critical processes are running
            mining_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if any(miner in proc.info['name'].lower() for miner in ['t-rex', 'cgminer', 'lolminer']):
                        mining_processes.append({
                            "pid": proc.info['pid'],
                            "name": proc.info['name'],
                            "cmdline": ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ""
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
                    
            self.service_status = {
                "timestamp": datetime.utcnow().isoformat(),
                "mining_processes": mining_processes,
                "mining_active": len(mining_processes) > 0,
                "database_connected": await self._check_database_connection(),
                "system_healthy": self._is_system_healthy()
            }
            
        except Exception as e:
            logger.error(f"Error checking service health: {e}")
            
    async def _check_database_connection(self) -> bool:
        """Check database connection health"""
        try:
            async with AsyncSessionLocal() as db:
                # Simple query to test connection
                stmt = select(SystemLog).limit(1)
                await db.execute(stmt)
                return True
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False
            
    def _is_system_healthy(self) -> bool:
        """Determine if system is healthy based on metrics"""
        try:
            # Check CPU usage
            if self.system_stats.get("cpu", {}).get("percent", 0) > 90:
                return False
                
            # Check memory usage
            if self.system_stats.get("memory", {}).get("percent", 0) > 90:
                return False
                
            # Check disk usage
            if self.system_stats.get("disk", {}).get("percent", 0) > 95:
                return False
                
            return True
            
        except Exception:
            return False
            
    async def _log_system_status(self):
        """Log system status to database"""
        try:
            # Only log if there are issues or every 10 minutes
            should_log = (
                not self._is_system_healthy() or
                datetime.utcnow().minute % 10 == 0
            )
            
            if should_log:
                await self._save_system_log(
                    level="INFO" if self._is_system_healthy() else "WARNING",
                    module="system_monitor",
                    message="System status update",
                    details={
                        "system_stats": self.system_stats,
                        "service_status": self.service_status
                    }
                )
                
        except Exception as e:
            logger.error(f"Error logging system status: {e}")
            
    async def _save_system_log(self, level: str, module: str, message: str, details: Dict[str, Any] = None):
        """Save log entry to database"""
        async with AsyncSessionLocal() as db:
            try:
                system_log = SystemLog(
                    level=level,
                    module=module,
                    message=message,
                    details=details
                )
                db.add(system_log)
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error saving system log: {e}")
                
    async def get_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return {
            "is_running": self.is_running,
            "system_stats": self.system_stats,
            "service_status": self.service_status,
            "last_update": datetime.utcnow().isoformat()
        }
        
    async def get_system_logs(self, limit: int = 100, level: str = None) -> List[Dict[str, Any]]:
        """Get recent system logs"""
        async with AsyncSessionLocal() as db:
            try:
                stmt = select(SystemLog)
                
                if level:
                    stmt = stmt.where(SystemLog.level == level.upper())
                    
                stmt = stmt.order_by(SystemLog.timestamp.desc()).limit(limit)
                
                result = await db.execute(stmt)
                logs = result.scalars().all()
                
                return [
                    {
                        "id": log.id,
                        "level": log.level,
                        "module": log.module,
                        "message": log.message,
                        "details": log.details,
                        "timestamp": log.timestamp.isoformat()
                    }
                    for log in logs
                ]
                
            except Exception as e:
                logger.error(f"Error getting system logs: {e}")
                return []
                
    async def alert_system_issue(self, issue_type: str, message: str, details: Dict[str, Any] = None):
        """Log a system alert/issue"""
        await self._save_system_log(
            level="ERROR",
            module="system_alert",
            message=f"{issue_type}: {message}",
            details=details
        )
        logger.error(f"System Alert - {issue_type}: {message}")
        
    async def get_performance_metrics(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance metrics for the specified time period"""
        try:
            # This would typically aggregate data from logs
            # For now, return current stats
            return {
                "period_hours": hours,
                "current_stats": self.system_stats,
                "average_cpu": self.system_stats.get("cpu", {}).get("percent", 0),
                "average_memory": self.system_stats.get("memory", {}).get("percent", 0),
                "uptime_percentage": 99.5,  # Placeholder
                "total_alerts": 0  # Would count from logs
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {}
            
    async def restart_service(self, service_name: str) -> bool:
        """Restart a specific service (placeholder)"""
        try:
            logger.info(f"Restart requested for service: {service_name}")
            # This would implement actual service restart logic
            return True
            
        except Exception as e:
            logger.error(f"Error restarting service {service_name}: {e}")
            return False