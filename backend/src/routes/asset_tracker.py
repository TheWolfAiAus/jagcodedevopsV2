from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

wallet_manager_service = None

def set_wallet_manager_service(service):
    global wallet_manager_service
    wallet_manager_service = service

@router.get("/balances", summary="💰 Get Asset Balances")
async def get_asset_balances():
    """Get all asset balances across networks"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        status = await wallet_manager_service.get_wallet_status()
        balances = status.get("balances", [])
        
        # Calculate total USD value
        total_usd = sum(balance.get("balance_usd", 0) for balance in balances if balance.get("balance_usd"))
        
        # Group by network
        by_network = {}
        for balance in balances:
            network = balance.get("network", "unknown")
            if network not in by_network:
                by_network[network] = []
            by_network[network].append(balance)
            
        return {
            "balances": balances,
            "total_usd_value": total_usd,
            "by_network": by_network,
            "networks": list(by_network.keys()),
            "total_assets": len(balances)
        }
        
    except Exception as e:
        logger.error(f"Error getting asset balances: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get asset balances: {e}")

@router.get("/transactions", summary="📊 Get Transaction History")
async def get_transaction_history(limit: int = 50):
    """Get recent transaction history"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        status = await wallet_manager_service.get_wallet_status()
        transactions = status.get("recent_transactions", [])
        
        # Limit results
        limited_transactions = transactions[:limit]
        
        # Calculate transaction stats
        total_sent = sum(tx.get("value", 0) for tx in limited_transactions if tx.get("transaction_type") == "send")
        total_received = sum(tx.get("value", 0) for tx in limited_transactions if tx.get("transaction_type") == "receive")
        
        return {
            "transactions": limited_transactions,
            "count": len(limited_transactions),
            "stats": {
                "total_sent": total_sent,
                "total_received": total_received,
                "net_flow": total_received - total_sent
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting transaction history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transaction history: {e}")

@router.get("/portfolio", summary="📈 Get Portfolio Overview")
async def get_portfolio_overview():
    """Get comprehensive portfolio overview"""
    try:
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        status = await wallet_manager_service.get_wallet_status()
        balances = status.get("balances", [])
        transactions = status.get("recent_transactions", [])
        
        # Calculate portfolio metrics
        total_value = sum(balance.get("balance_usd", 0) for balance in balances if balance.get("balance_usd"))
        
        # Asset allocation
        asset_allocation = {}
        for balance in balances:
            symbol = balance.get("token_symbol", "UNKNOWN")
            usd_value = balance.get("balance_usd", 0)
            if usd_value > 0:
                asset_allocation[symbol] = asset_allocation.get(symbol, 0) + usd_value
                
        # Network distribution
        network_distribution = {}
        for balance in balances:
            network = balance.get("network", "unknown")
            usd_value = balance.get("balance_usd", 0)
            if usd_value > 0:
                network_distribution[network] = network_distribution.get(network, 0) + usd_value
                
        return {
            "total_portfolio_value": total_value,
            "asset_count": len(balances),
            "network_count": len(set(b.get("network") for b in balances)),
            "asset_allocation": asset_allocation,
            "network_distribution": network_distribution,
            "recent_activity": len(transactions),
            "wallet_address": status.get("wallet_address"),
            "is_connected": status.get("is_connected", False)
        }
        
    except Exception as e:
        logger.error(f"Error getting portfolio overview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio overview: {e}")

@router.get("/movements", summary="📊 Get Asset Movements")
async def get_asset_movements(hours: int = 24):
    """Get asset movements and changes over time period"""
    try:
        # This would typically track balance changes over time
        # For now, return current status
        if not wallet_manager_service:
            raise HTTPException(status_code=500, detail="Wallet Manager service not available")
            
        status = await wallet_manager_service.get_wallet_status()
        transactions = status.get("recent_transactions", [])
        
        # Filter transactions by time period (simplified)
        recent_transactions = transactions[:10]  # Last 10 transactions as proxy
        
        return {
            "time_period_hours": hours,
            "movements": recent_transactions,
            "movement_count": len(recent_transactions),
            "message": f"Asset movements for last {hours} hours"
        }
        
    except Exception as e:
        logger.error(f"Error getting asset movements: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get asset movements: {e}")