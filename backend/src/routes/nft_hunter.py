from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# This will be injected from main.py
nft_hunter_service = None

def set_nft_hunter_service(service):
    """Set the NFT hunter service instance"""
    global nft_hunter_service
    nft_hunter_service = service

@router.get("/opportunities", summary="🎨 Get NFT Opportunities")
async def get_nft_opportunities(limit: int = 20):
    """Get discovered NFT opportunities sorted by score"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        opportunities = await nft_hunter_service.get_top_opportunities(limit)
        
        return {
            "opportunities": opportunities,
            "count": len(opportunities),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error getting NFT opportunities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get opportunities: {e}")

@router.get("/status", summary="📊 Get NFT Hunter Status")
async def get_nft_hunter_status():
    """Get current status of NFT hunting service"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        return {
            "is_running": nft_hunter_service.is_running,
            "sources": nft_hunter_service.sources.keys() if hasattr(nft_hunter_service, 'sources') else [],
            "status": "active" if nft_hunter_service.is_running else "inactive"
        }
        
    except Exception as e:
        logger.error(f"Error getting NFT hunter status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {e}")

@router.post("/start", summary="🚀 Start NFT Hunting")
async def start_nft_hunting():
    """Start the NFT hunting service"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        await nft_hunter_service.start()
        
        return {
            "message": "🎨 NFT Hunter started - Hunting for free NFTs!",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Error starting NFT hunter: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start NFT hunter: {e}")

@router.post("/stop", summary="🛑 Stop NFT Hunting")
async def stop_nft_hunting():
    """Stop the NFT hunting service"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        await nft_hunter_service.stop()
        
        return {
            "message": "🛑 NFT Hunter stopped",
            "status": "stopped"
        }
        
    except Exception as e:
        logger.error(f"Error stopping NFT hunter: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop NFT hunter: {e}")

@router.get("/opportunities/top", summary="💎 Get Top Opportunities")
async def get_top_opportunities(limit: int = 5):
    """Get the highest scoring NFT opportunities"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        opportunities = await nft_hunter_service.get_top_opportunities(limit)
        
        # Filter for only the highest scores
        top_opportunities = [opp for opp in opportunities if opp.get("score", 0) >= 8.0]
        
        return {
            "top_opportunities": top_opportunities,
            "count": len(top_opportunities),
            "message": f"Found {len(top_opportunities)} premium opportunities"
        }
        
    except Exception as e:
        logger.error(f"Error getting top opportunities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get top opportunities: {e}")

@router.get("/stats", summary="📈 Get NFT Hunting Statistics")
async def get_nft_stats():
    """Get NFT hunting statistics and metrics"""
    try:
        if not nft_hunter_service:
            raise HTTPException(status_code=500, detail="NFT Hunter service not available")
            
        # Get all opportunities to calculate stats
        all_opportunities = await nft_hunter_service.get_top_opportunities(1000)
        
        if not all_opportunities:
            return {
                "total_discovered": 0,
                "average_score": 0,
                "sources_active": 0,
                "high_value_count": 0
            }
            
        # Calculate statistics
        total_discovered = len(all_opportunities)
        average_score = sum(opp.get("score", 0) for opp in all_opportunities) / total_discovered
        high_value_count = len([opp for opp in all_opportunities if opp.get("score", 0) >= 8.0])
        
        # Get unique sources
        sources = set(opp.get("source", "") for opp in all_opportunities)
        
        return {
            "total_discovered": total_discovered,
            "average_score": round(average_score, 2),
            "sources_active": len(sources),
            "high_value_count": high_value_count,
            "sources": list(sources),
            "is_hunting": nft_hunter_service.is_running
        }
        
    except Exception as e:
        logger.error(f"Error getting NFT stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {e}")