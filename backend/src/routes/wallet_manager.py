from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

wallet_manager_service = None

def set_wallet_manager_service(service):
    global wallet_manager_service
    wallet_manager_service = service

@router.get("/status", summary="💰 Get Wallet Status")
async def get_wallet_status():
    """Get current wallet status, balances, and recent transactions"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        status = await wallet_manager_service.get_wallet_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting wallet status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get wallet status: {e}")

@router.post("/transfer", summary="💸 Send Transaction")
async def send_transaction(
    to_address: str,
    amount: float,
    token_symbol: str = "ETH",
    network: str = "ethereum"
):
    """Send a transaction from the Exodus wallet"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        tx_hash = await wallet_manager_service.send_transaction(
            to_address=to_address,
            amount=amount,
            token_symbol=token_symbol,
            network=network
        )
        
        if tx_hash:
            return {
                "message": f"💸 Transaction sent successfully",
                "tx_hash": tx_hash,
                "amount": amount,
                "token": token_symbol,
                "network": network,
                "status": "sent"
            }
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")
            
    except Exception as e:
        logger.error(f"Error sending transaction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send transaction: {e}")

@router.post("/transfer-to-exodus", summary="💰 Transfer to Exodus")
async def transfer_to_exodus(
    amount: float,
    token_symbol: str = "ETH",
    network: str = "ethereum"
):
    """Transfer assets to Exodus wallet"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        tx_hash = await wallet_manager_service.transfer_to_exodus(
            amount=amount,
            token_symbol=token_symbol,
            network=network
        )
        
        return {
            "message": f"💰 Transfer to Exodus initiated",
            "tx_hash": tx_hash,
            "amount": amount,
            "token": token_symbol,
            "network": network,
            "status": "transferred" if tx_hash else "queued"
        }
        
    except Exception as e:
        logger.error(f"Error transferring to Exodus: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transfer to Exodus: {e}")