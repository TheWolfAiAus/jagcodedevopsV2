import json
import logging
import os
import time
from datetime import datetime
import requests
from fastapi import FastAPI, HTTPException
import uvicorn
from threading import Thread
from typing import Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("crypto-tracker")

# API Configuration
COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

app = FastAPI(title="Crypto Tracker", version="1.0.0")

# In-memory storage for demo
latest_prices = {}

def fetch_top_cryptocurrencies():
    """Fetch top cryptocurrencies from CoinGecko API."""
    try:
        url = f"{COINGECKO_BASE_URL}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 10,  # Reduced for faster response
            'page': 1,
            'sparkline': 'false'
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        cryptocurrencies = response.json()
        logger.info(f"Fetched {len(cryptocurrencies)} cryptocurrencies")
        
        # Store in memory
        global latest_prices
        for crypto in cryptocurrencies:
            latest_prices[crypto['symbol'].upper()] = {
                'price': crypto['current_price'],
                'change_24h': crypto.get('price_change_percentage_24h', 0),
                'last_updated': datetime.now().isoformat()
            }

        return cryptocurrencies
    except Exception as e:
        logger.error(f"Error fetching cryptocurrencies: {e}")
        return []

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "crypto-tracker", "timestamp": datetime.now().isoformat()}

@app.get("/prices")
async def get_latest_prices():
    """Get latest cryptocurrency prices."""
    if not latest_prices:
        # Try to fetch fresh data
        fetch_top_cryptocurrencies()
    return {"prices": latest_prices, "count": len(latest_prices)}

@app.get("/prices/{symbol}")
async def get_price(symbol: str):
    """Get price for specific cryptocurrency."""
    symbol = symbol.upper()
    if symbol in latest_prices:
        return {"symbol": symbol, "data": latest_prices[symbol]}
    else:
        raise HTTPException(status_code=404, detail=f"Price data not found for {symbol}")

def update_crypto_data():
    """Periodically update crypto data."""
    while True:
        try:
            logger.info("Updating cryptocurrency data...")
            fetch_top_cryptocurrencies()
            logger.info("Crypto data updated successfully")
        except Exception as e:
            logger.error(f"Error updating crypto data: {e}")
        
        time.sleep(300)  # Update every 5 minutes

def run_background_updater():
    """Run background data updater."""
    updater_thread = Thread(target=update_crypto_data, daemon=True)
    updater_thread.start()

if __name__ == "__main__":
    logger.info("Starting Crypto Tracker service (simplified)")
    
    # Initial data fetch
    fetch_top_cryptocurrencies()
    
    # Start background updater
    run_background_updater()
    
    # Start API server
    uvicorn.run(app, host="0.0.0.0", port=8000)