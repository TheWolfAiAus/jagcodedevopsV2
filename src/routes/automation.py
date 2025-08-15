from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import logging

from ..services.automation_engine import AutomationEngine

logger = logging.getLogger(__name__)
router = APIRouter()

# Global automation engine instance (will be injected from main.py)
automation_engine: AutomationEngine = None

def set_automation_engine(engine: AutomationEngine):
    """Set the automation engine instance"""
    global automation_engine
    automation_engine = engine

@router.post("/start", summary="🚀 START ALL OPERATIONS - THE MAGIC BUTTON!")
async def start_all_operations(background_tasks: BackgroundTasks):
    """
    🎯 THE MAGIC BUTTON - Start all profit-generating operations!
    
    This endpoint starts:
    - NFT hunting for free opportunities
    - Cryptocurrency mining
    - Smart contract automation
    - Wallet monitoring
    - System optimization
    
    Press this and let the magic happen! 🚀
    """
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        # Start all operations in background
        background_tasks.add_task(automation_engine.start_all_operations)
        
        return {
            "message": "🚀 ALL SYSTEMS ACTIVATED! JAG-OPS is now generating profits!",
            "status": "success",
            "operations_starting": True
        }
        
    except Exception as e:
        logger.error(f"Error starting operations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start operations: {e}")

@router.post("/stop", summary="🛑 Stop All Operations")
async def stop_all_operations():
    """Stop all automated operations"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        await automation_engine.stop_all_operations()
        
        return {
            "message": "🛑 All operations stopped",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error stopping operations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop operations: {e}")

@router.post("/emergency-stop", summary="🚨 Emergency Stop")
async def emergency_stop():
    """Emergency stop all operations immediately"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        await automation_engine.emergency_stop()
        
        return {
            "message": "🚨 Emergency stop activated - All operations halted",
            "status": "emergency_stopped"
        }
        
    except Exception as e:
        logger.error(f"Error during emergency stop: {e}")
        raise HTTPException(status_code=500, detail=f"Emergency stop failed: {e}")

@router.get("/status", summary="📊 Get System Status")
async def get_system_status():
    """Get comprehensive status of all operations and services"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        status = await automation_engine.get_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {e}")

@router.get("/profit-report", summary="💰 Get Profit Report")
async def get_profit_report():
    """Get comprehensive profit report from all sources"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        report = await automation_engine.get_profit_report()
        return report
        
    except Exception as e:
        logger.error(f"Error generating profit report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate profit report: {e}")

@router.post("/optimize", summary="🎯 Optimize Operations")
async def optimize_operations(background_tasks: BackgroundTasks):
    """Optimize all operations for maximum profit"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        background_tasks.add_task(automation_engine.optimize_operations)
        
        return {
            "message": "🎯 Optimization started - Maximizing profits!",
            "status": "optimizing"
        }
        
    except Exception as e:
        logger.error(f"Error starting optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start optimization: {e}")

@router.post("/transfer-profits", summary="💸 Transfer Profits to Exodus")
async def transfer_profits_to_exodus(background_tasks: BackgroundTasks):
    """Transfer all accumulated profits to Exodus wallet"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        background_tasks.add_task(automation_engine.transfer_profits_to_exodus)
        
        return {
            "message": "💸 Profit transfer initiated to Exodus wallet",
            "status": "transferring"
        }
        
    except Exception as e:
        logger.error(f"Error initiating profit transfer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transfer profits: {e}")

@router.post("/execute-strategy", summary="💰 Execute Profit Strategy")
async def execute_profit_strategy(background_tasks: BackgroundTasks):
    """Execute automated profit-maximizing strategy"""
    try:
        if not automation_engine:
            raise HTTPException(status_code=500, detail="Automation engine not initialized")
            
        background_tasks.add_task(automation_engine.execute_profit_strategy)
        
        return {
            "message": "💰 Profit strategy execution started",
            "status": "executing"
        }
        
    except Exception as e:
        logger.error(f"Error executing profit strategy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute strategy: {e}")

@router.get("/health", summary="🏥 Health Check")
async def health_check():
    """Simple health check endpoint"""
    try:
        if not automation_engine:
            return {
                "status": "unhealthy",
                "message": "Automation engine not initialized"
            }
            
        engine_status = automation_engine.is_running
        
        return {
            "status": "healthy" if engine_status else "inactive",
            "engine_running": engine_status,
            "message": "JAG-OPS Backend is operational" if engine_status else "JAG-OPS Backend is inactive"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }