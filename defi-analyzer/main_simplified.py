import logging
import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException
import uvicorn
from typing import Dict, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("defi-analyzer")

app = FastAPI(title="DeFi Analyzer", version="1.0.0")

# Sample DeFi protocols data
DEFI_PROTOCOLS = {
    "UNISWAP": {"symbol": "UNI", "category": "DEX"},
    "COMPOUND": {"symbol": "COMP", "category": "Lending"},
    "AAVE": {"symbol": "AAVE", "category": "Lending"},
    "MAKER": {"symbol": "MKR", "category": "Stablecoin"},
    "SUSHISWAP": {"symbol": "SUSHI", "category": "DEX"}
}

# In-memory storage
defi_data = {}

def fetch_defi_data():
    """Fetch DeFi protocol data from APIs."""
    try:
        # Using CoinGecko for simplicity
        symbols = [data["symbol"].lower() for data in DEFI_PROTOCOLS.values()]
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            'ids': ','.join(['uniswap', 'compound-governance-token', 'aave', 'maker', 'sushi']),
            'vs_currencies': 'usd',
            'include_24hr_change': 'true',
            'include_market_cap': 'true'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Fetched DeFi data for {len(data)} protocols")
        
        # Store in memory
        global defi_data
        defi_data = {
            protocol: {
                'price_usd': data.get(protocol.replace('compound-governance-token', 'compound'), {}).get('usd', 0),
                'change_24h': data.get(protocol.replace('compound-governance-token', 'compound'), {}).get('usd_24h_change', 0),
                'market_cap': data.get(protocol.replace('compound-governance-token', 'compound'), {}).get('usd_market_cap', 0),
                'last_updated': datetime.now().isoformat()
            }
            for protocol in ['uniswap', 'compound-governance-token', 'aave', 'maker', 'sushi']
        }
        
        return data
    except Exception as e:
        logger.error(f"Error fetching DeFi data: {e}")
        return {}

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "service": "defi-analyzer", 
        "timestamp": datetime.now().isoformat()
    }

@app.get("/defi/protocols")
async def get_defi_protocols():
    """Get all DeFi protocol data."""
    if not defi_data:
        fetch_defi_data()
    return {
        "protocols": defi_data,
        "count": len(defi_data),
        "categories": DEFI_PROTOCOLS
    }

@app.get("/defi/tvl")
async def get_tvl_summary():
    """Get Total Value Locked summary."""
    # Simplified TVL calculation
    total_tvl = sum(data.get('market_cap', 0) for data in defi_data.values())
    return {
        "total_tvl_usd": total_tvl,
        "timestamp": datetime.now().isoformat(),
        "protocols_count": len(defi_data)
    }

@app.get("/defi/analytics")
async def get_analytics():
    """Get DeFi analytics."""
    if not defi_data:
        fetch_defi_data()
    
    # Calculate some basic analytics
    positive_changes = [d for d in defi_data.values() if d.get('change_24h', 0) > 0]
    negative_changes = [d for d in defi_data.values() if d.get('change_24h', 0) < 0]
    
    return {
        "market_sentiment": {
            "bullish_protocols": len(positive_changes),
            "bearish_protocols": len(negative_changes),
            "total_protocols": len(defi_data)
        },
        "avg_24h_change": sum(d.get('change_24h', 0) for d in defi_data.values()) / len(defi_data) if defi_data else 0,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    logger.info("Starting DeFi Analyzer service (simplified)")
    
    # Initial data fetch
    fetch_defi_data()
    
    # Start API server
    uvicorn.run(app, host="0.0.0.0", port=8001)