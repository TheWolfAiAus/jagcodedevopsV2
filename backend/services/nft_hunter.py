import asyncio
import aiohttp
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from web3 import Web3
import json
import time

from ..core.config import settings
from ..core.database import AsyncSessionLocal, NFTOpportunity
from sqlalchemy import select

logger = logging.getLogger(__name__)

class NFTHunter:
    """NFT Hunter service for discovering free and low-cost NFTs"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.is_running = False
        self.sources = {
            "opensea": self._hunt_opensea,
            "rarible": self._hunt_rarible,
            "foundation": self._hunt_foundation,
            "superrare": self._hunt_superrare,
            "async_art": self._hunt_async_art,
            "known_origin": self._hunt_known_origin
        }
        
    async def start(self):
        """Start the NFT hunting service"""
        if self.is_running:
            return
            
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )
        self.is_running = True
        logger.info("NFT Hunter service started")
        
        # Start hunting loop
        asyncio.create_task(self._hunting_loop())
        
    async def stop(self):
        """Stop the NFT hunting service"""
        self.is_running = False
        if self.session:
            await self.session.close()
        logger.info("NFT Hunter service stopped")
        
    async def _hunting_loop(self):
        """Main hunting loop"""
        while self.is_running:
            try:
                logger.info("Starting NFT hunting cycle...")
                opportunities = []
                
                for source_name in settings.NFT_SOURCES:
                    if source_name in self.sources:
                        try:
                            source_opportunities = await self.sources[source_name]()
                            opportunities.extend(source_opportunities)
                            logger.info(f"Found {len(source_opportunities)} opportunities from {source_name}")
                        except Exception as e:
                            logger.error(f"Error hunting from {source_name}: {e}")
                
                # Score and save opportunities
                scored_opportunities = await self._score_opportunities(opportunities)
                await self._save_opportunities(scored_opportunities)
                
                logger.info(f"Hunting cycle completed. Found {len(scored_opportunities)} high-score opportunities")
                
            except Exception as e:
                logger.error(f"Error in hunting loop: {e}")
                
            # Wait for next cycle
            await asyncio.sleep(settings.NFT_HUNT_INTERVAL)
            
    async def _hunt_opensea(self) -> List[Dict[str, Any]]:
        """Hunt for free NFTs on OpenSea"""
        opportunities = []
        
        try:
            # Search for free NFTs (price = 0)
            url = "https://api.opensea.io/api/v1/assets"
            params = {
                "order_direction": "desc",
                "offset": 0,
                "limit": 50,
                "include_orders": "true"
            }
            
            headers = {}
            if settings.OPENSEA_API_KEY:
                headers["X-API-KEY"] = settings.OPENSEA_API_KEY
                
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for asset in data.get("assets", []):
                        # Look for assets with no current price or very low price
                        if self._is_free_or_cheap_nft(asset):
                            opportunity = {
                                "contract_address": asset.get("asset_contract", {}).get("address", ""),
                                "token_id": asset.get("token_id", ""),
                                "name": asset.get("name", ""),
                                "collection_name": asset.get("collection", {}).get("name", ""),
                                "price_eth": 0.0,
                                "source": "opensea",
                                "marketplace_url": asset.get("permalink", ""),
                                "image_url": asset.get("image_url", ""),
                                "metadata": asset
                            }
                            opportunities.append(opportunity)
                            
        except Exception as e:
            logger.error(f"Error hunting OpenSea: {e}")
            
        return opportunities
        
    async def _hunt_rarible(self) -> List[Dict[str, Any]]:
        """Hunt for free NFTs on Rarible"""
        opportunities = []
        
        try:
            url = "https://api.rarible.org/v0.1/items/all"
            params = {
                "size": 50,
                "sort": "LATEST"
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for item in data.get("items", []):
                        if self._is_free_or_cheap_rarible_nft(item):
                            opportunity = {
                                "contract_address": item.get("contract", ""),
                                "token_id": item.get("tokenId", ""),
                                "name": item.get("meta", {}).get("name", ""),
                                "collection_name": item.get("collection", ""),
                                "price_eth": 0.0,
                                "source": "rarible",
                                "marketplace_url": f"https://rarible.com/token/{item.get('contract')}:{item.get('tokenId')}",
                                "image_url": item.get("meta", {}).get("image", ""),
                                "metadata": item
                            }
                            opportunities.append(opportunity)
                            
        except Exception as e:
            logger.error(f"Error hunting Rarible: {e}")
            
        return opportunities
        
    async def _hunt_foundation(self) -> List[Dict[str, Any]]:
        """Hunt for opportunities on Foundation"""
        # Foundation API implementation
        return []
        
    async def _hunt_superrare(self) -> List[Dict[str, Any]]:
        """Hunt for opportunities on SuperRare"""
        # SuperRare API implementation
        return []
        
    async def _hunt_async_art(self) -> List[Dict[str, Any]]:
        """Hunt for opportunities on Async Art"""
        # Async Art API implementation
        return []
        
    async def _hunt_known_origin(self) -> List[Dict[str, Any]]:
        """Hunt for opportunities on Known Origin"""
        # Known Origin API implementation
        return []
        
    def _is_free_or_cheap_nft(self, asset: Dict[str, Any]) -> bool:
        """Check if OpenSea NFT is free or cheap"""
        # Check if there are any sell orders
        sell_orders = asset.get("sell_orders", [])
        if not sell_orders:
            return True  # No sell orders = potentially free
            
        # Check if price is very low
        for order in sell_orders:
            price_eth = float(order.get("current_price", 0)) / 1e18
            if price_eth <= settings.NFT_MAX_PRICE_ETH:
                return True
                
        return False
        
    def _is_free_or_cheap_rarible_nft(self, item: Dict[str, Any]) -> bool:
        """Check if Rarible NFT is free or cheap"""
        # Check for active sell orders
        sell_orders = item.get("bestSellOrder")
        if not sell_orders:
            return True
            
        # Check price
        price_data = sell_orders.get("makePrice")
        if price_data:
            price_eth = float(price_data) / 1e18
            return price_eth <= settings.NFT_MAX_PRICE_ETH
            
        return True
        
    async def _score_opportunities(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Score NFT opportunities based on various factors"""
        scored_opportunities = []
        
        for opp in opportunities:
            try:
                score = await self._calculate_nft_score(opp)
                if score >= settings.NFT_MIN_SCORE:
                    opp["score"] = score
                    scored_opportunities.append(opp)
            except Exception as e:
                logger.error(f"Error scoring opportunity: {e}")
                
        return scored_opportunities
        
    async def _calculate_nft_score(self, opportunity: Dict[str, Any]) -> float:
        """Calculate NFT opportunity score"""
        score = 5.0  # Base score
        
        # Collection popularity (simplified)
        collection_name = opportunity.get("collection_name", "").lower()
        if any(keyword in collection_name for keyword in ["art", "pixel", "punk", "ape", "cat"]):
            score += 2.0
            
        # Has image
        if opportunity.get("image_url"):
            score += 1.0
            
        # Recent discovery bonus
        score += 1.0
        
        # Source reliability
        source_scores = {
            "opensea": 2.0,
            "rarible": 1.5,
            "foundation": 2.0,
            "superrare": 1.8
        }
        score += source_scores.get(opportunity.get("source", ""), 0.5)
        
        # Free NFT bonus
        if opportunity.get("price_eth", 0) == 0:
            score += 3.0
            
        return min(score, 10.0)  # Cap at 10
        
    async def _save_opportunities(self, opportunities: List[Dict[str, Any]]):
        """Save opportunities to database"""
        if not opportunities:
            return
            
        async with AsyncSessionLocal() as db:
            try:
                for opp in opportunities:
                    # Check if already exists
                    stmt = select(NFTOpportunity).where(
                        NFTOpportunity.contract_address == opp["contract_address"],
                        NFTOpportunity.token_id == opp["token_id"]
                    )
                    result = await db.execute(stmt)
                    existing = result.scalar_one_or_none()
                    
                    if not existing:
                        nft_opp = NFTOpportunity(
                            contract_address=opp["contract_address"],
                            token_id=opp["token_id"],
                            name=opp.get("name"),
                            collection_name=opp.get("collection_name"),
                            price_eth=opp.get("price_eth", 0.0),
                            score=opp["score"],
                            source=opp["source"],
                            marketplace_url=opp.get("marketplace_url"),
                            image_url=opp.get("image_url"),
                            metadata=opp.get("metadata")
                        )
                        db.add(nft_opp)
                        
                await db.commit()
                logger.info(f"Saved {len(opportunities)} new NFT opportunities")
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error saving opportunities: {e}")
                
    async def get_top_opportunities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top scoring opportunities"""
        async with AsyncSessionLocal() as db:
            stmt = select(NFTOpportunity).where(
                NFTOpportunity.status == "discovered"
            ).order_by(NFTOpportunity.score.desc()).limit(limit)
            
            result = await db.execute(stmt)
            opportunities = result.scalars().all()
            
            return [
                {
                    "id": opp.id,
                    "contract_address": opp.contract_address,
                    "token_id": opp.token_id,
                    "name": opp.name,
                    "collection_name": opp.collection_name,
                    "price_eth": opp.price_eth,
                    "score": opp.score,
                    "source": opp.source,
                    "marketplace_url": opp.marketplace_url,
                    "image_url": opp.image_url,
                    "discovered_at": opp.discovered_at.isoformat()
                }
                for opp in opportunities
            ]