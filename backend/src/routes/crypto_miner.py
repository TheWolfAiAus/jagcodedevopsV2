from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

crypto_miner_service = None

def set_crypto_miner_service(service):
    global crypto_miner_service
    crypto_miner_service = service

@router.get("/status", summary="⛏️ Get Mining Status")
async def get_mining_status():
    """Get current mining status for all coins"""
    try:
        if not crypto_miner_service:
            raise HTTPException(status_code=500, detail="Crypto Miner service not available")
            
        status = await crypto_miner_service.get_mining_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting mining status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get mining status: {e}")

@router.post("/start", summary="🚀 Start Mining")
async def start_mining():
    """Start mining for all configured coins"""
    try:
        if not crypto_miner_service:
            raise HTTPException(status_code=500, detail="Crypto Miner service not available")
            
        await crypto_miner_service.start()
        
        return {
            "message": "⛏️ Crypto mining started for all coins!",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Error starting mining: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start mining: {e}")

@router.post("/stop", summary="🛑 Stop Mining")
async def stop_mining():
    """Stop all mining operations"""
    try:
        if not crypto_miner_service:
            raise HTTPException(status_code=500, detail="Crypto Miner service not available")
            
        await crypto_miner_service.stop()
        
        return {
            "message": "🛑 All mining operations stopped",
            "status": "stopped"
        }
        
    except Exception as e:
        logger.error(f"Error stopping mining: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop mining: {e}")

@router.post("/start/{coin}", summary="🚀 Start Mining Specific Coin")
async def start_mining_coin(coin: str):
    """Start mining for a specific coin"""
    try:
        if not crypto_miner_service:
            raise HTTPException(status_code=500, detail="Crypto Miner service not available")
            
        success = await crypto_miner_service.start_mining_coin(coin.upper())
        
        if success:
            return {
                "message": f"⛏️ Started mining {coin.upper()}",
                "status": "started",
                "coin": coin.upper()
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to start mining {coin}")
            
    except Exception as e:
        logger.error(f"Error starting mining for {coin}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start mining {coin}: {e}")

@router.post("/stop/{coin}", summary="🛑 Stop Mining Specific Coin")
async def stop_mining_coin(coin: str):
    """Stop mining for a specific coin"""
    try:
        if not crypto_miner_service:
            raise HTTPException(status_code=500, detail="Crypto Miner service not available")
            
        success = await crypto_miner_service.stop_mining_coin(coin.upper())
        
        if success:
            return {
                "message": f"🛑 Stopped mining {coin.upper()}",
                "status": "stopped",
                "coin": coin.upper()
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to stop mining {coin}")
            
    except Exception as e:
        logger.error(f"Error stopping mining for {coin}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop mining {coin}: {e}")