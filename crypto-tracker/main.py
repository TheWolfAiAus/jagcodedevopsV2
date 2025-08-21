import json
import logging
import os
import time
from datetime import datetime, timedelta

import psycopg2
import redis
import requests
import schedule
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("crypto_tracker.log")
    ]
)
logger = logging.getLogger("crypto-tracker")

# Load environment variables
load_dotenv()


# Database connection
def get_db_connection():
    """
    Create and return a connection to the PostgreSQL database using environment variables.

    Returns:
        psycopg2.connection: A connection object to the PostgreSQL database
    """
    return psycopg2.connect(
        host=os.environ.get('PG_HOST'),
        port=os.environ.get('PG_PORT'),
        user=os.environ.get('PG_USER'),
        password=os.environ.get('PG_PASSWORD'),
        database=os.environ.get('PG_DATABASE')
    )


# Redis connection
def get_redis_connection():
    """
    Create and return a connection to the Redis cache using environment variables.

    Returns:
        redis.Redis: A connection object to the Redis server
    """
    return redis.Redis(
        host=os.environ.get('REDIS_HOST', 'redis'),
        port=int(os.environ.get('REDIS_PORT', 6379)),
        password=os.environ.get('REDIS_PASSWORD', '')
    )


# API Clients
COINGECKO_API_KEY = os.environ.get('COINGECKO_API_KEY')
COINGECKO_BASE_URL = 'https://pro-api.coingecko.com/api/v3'


# Top 100 cryptocurrencies to track
def fetch_top_cryptocurrencies():
    """
    Fetch top 100 cryptocurrencies from CoinGecko API.

    Returns:
        list: A list of dictionaries containing cryptocurrency data
    """
    try:
        url = f"{COINGECKO_BASE_URL}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': 'false',
            'x_cg_pro_api_key': COINGECKO_API_KEY
        }

        response = requests.get(url, params=params, timeout=30)  # Add timeout
        response.raise_for_status()

        cryptocurrencies = response.json()
        logger.info(f"Fetched {len(cryptocurrencies)} cryptocurrencies")

        return cryptocurrencies
    except requests.exceptions.Timeout:
        logger.error("Timeout error while fetching cryptocurrencies")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error fetching top cryptocurrencies: {e}")
        return []
    except Exception as e:
        logger.error(f"Error fetching top cryptocurrencies: {e}")
        return []


# Store price data in database
def store_price_data(cryptocurrencies):
    """
    Store cryptocurrency price data in the PostgreSQL database.

    Args:
        cryptocurrencies (list): List of cryptocurrency data dictionaries
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for crypto in cryptocurrencies:
            # Check for missing or None values and provide defaults
            symbol = crypto.get('symbol', '').upper() if crypto.get('symbol') else 'UNKNOWN'
            current_price = crypto.get('current_price', 0.0) if crypto.get('current_price') is not None else 0.0
            total_volume = crypto.get('total_volume', 0.0) if crypto.get('total_volume') is not None else 0.0
            market_cap = crypto.get('market_cap', 0.0) if crypto.get('market_cap') is not None else 0.0
            price_change = crypto.get('price_change_percentage_24h', 0.0) if crypto.get(
                'price_change_percentage_24h') is not None else 0.0

            cursor.execute(
                """INSERT INTO price_history
                       (token_symbol, price_usd, volume_24h, market_cap, percent_change_24h)
                   VALUES (%s, %s, %s, %s, %s)""",
                (symbol, current_price, total_volume, market_cap, price_change)
            )

        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Stored price data for {len(cryptocurrencies)} cryptocurrencies")
    except Exception as e:
        logger.error(f"Error storing price data: {e}")


# Cache latest prices in Redis for fast access
def cache_latest_prices(cryptocurrencies):
    """
    Cache latest cryptocurrency prices in Redis for fast access.

    Args:
        cryptocurrencies (list): List of cryptocurrency data dictionaries
    """
    try:
        redis_client = get_redis_connection()

        # Store all prices in a hash
        price_data = {crypto['symbol'].upper(): crypto['current_price'] for crypto in cryptocurrencies}
        redis_client.hset('latest_crypto_prices', mapping=price_data)

        # Set expiration to 15 minutes
        redis_client.expire('latest_crypto_prices', 900)

        # Also store full data for each crypto
        for crypto in cryptocurrencies:
            crypto_data = {
                'price': crypto['current_price'],
                'volume': crypto['total_volume'],
                'market_cap': crypto['market_cap'],
                'change_24h': crypto['price_change_percentage_24h'],
                'last_updated': datetime.now().isoformat()
            }
            redis_client.set(
                f"crypto:{crypto['symbol'].upper()}",
                json.dumps(crypto_data),
                ex=900  # 15 minutes expiration
            )

        logger.info(f"Cached latest prices for {len(cryptocurrencies)} cryptocurrencies")
    except Exception as e:
        logger.error(f"Error caching latest prices: {e}")


# Check API endpoints are accessible
def check_api_endpoints():
    """
    Check if CoinGecko API endpoints are accessible and responding correctly.
    """
    try:
        # Test CoinGecko API
        response = requests.get(
            f"{COINGECKO_BASE_URL}/ping",
            params={"x_cg_pro_api_key": COINGECKO_API_KEY},
            timeout=10
        )
        if response.status_code != 200:
            logger.warning(f"CoinGecko API health check failed: {response.status_code}")
        else:
            logger.info("CoinGecko API is healthy")
    except Exception as e:
        logger.error(f"Error checking API endpoints: {e}")

# Check for price alerts
def check_price_alerts():
    """
    Check and process active price alerts against current cryptocurrency prices.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        redis_client = get_redis_connection()

        # Get all active alerts
        cursor.execute(
            """SELECT a.id, a.user_id, a.token_symbol, a.price_target, a.comparison_operator
               FROM price_alerts a
               WHERE a.is_active = TRUE"""
        )

        alerts = cursor.fetchall()
        logger.info(f"Checking {len(alerts)} price alerts")

        # Get latest prices from Redis
        all_prices = redis_client.hgetall('latest_crypto_prices')

        # Check each alert against current price
        for alert in alerts:
            alert_id, user_id, token_symbol, price_target, comparison_operator = alert

            if token_symbol in all_prices:
                current_price = float(all_prices[token_symbol])

                # Check if alert condition is met
                is_triggered = False
                if comparison_operator == '>' and current_price > price_target:
                    is_triggered = True
                elif comparison_operator == '<' and current_price < price_target:
                    is_triggered = True
                elif comparison_operator == '=' and abs(
                        current_price - price_target) < 0.01 * price_target:  # Within 1%
                    is_triggered = True

                if is_triggered:
                    # Create notification
                    message = f"{token_symbol} price {comparison_operator} {price_target} USD alert triggered. Current price: {current_price} USD"
                    cursor.execute(
                        """INSERT INTO notifications (user_id, alert_id, message)
                           VALUES (%s, %s, %s)""",
                        (user_id, alert_id, message)
                    )

                    # Update alert last triggered time
                    cursor.execute(
                        """UPDATE price_alerts
                           SET last_triggered = %s
                           WHERE id = %s""",
                        (datetime.now(), alert_id)
                    )

                    logger.info(f"Triggered alert {alert_id} for user {user_id}: {message}")

        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error checking price alerts: {e}")


# Clean up old price history data (keep last 90 days)
def cleanup_old_data():
    """
    Remove price history data older than 90 days from the database.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete price history older than 90 days
        ninety_days_ago = datetime.now() - timedelta(days=90)
        cursor.execute(
            "DELETE FROM price_history WHERE timestamp < %s",
            (ninety_days_ago,)
        )

        deleted_count = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()

        logger.info(f"Cleaned up {deleted_count} old price history records")
    except Exception as e:
        logger.error(f"Error cleaning up old data: {e}")


# Main job to fetch and store cryptocurrency data
def update_crypto_data():
    """
    Main job function to fetch and store cryptocurrency data, including price updates and alerts.
    """
    logger.info("Starting cryptocurrency data update")

    # Fetch top cryptocurrencies
    cryptocurrencies = fetch_top_cryptocurrencies()

    if cryptocurrencies:
        # Store price data in database
        store_price_data(cryptocurrencies)

        # Cache latest prices in Redis
        cache_latest_prices(cryptocurrencies)

        # Check for price alerts
        check_price_alerts()

    logger.info("Finished cryptocurrency data update")


# Schedule jobs
def schedule_jobs():
    """
    Schedule periodic jobs for updating crypto data and cleaning old records.
    """
    # Update crypto data every 15 minutes
    schedule.every(15).minutes.do(update_crypto_data)

    # Clean up old data once a day at 3 AM
    schedule.every().day.at("03:00").do(cleanup_old_data)

    logger.info("Scheduled jobs")

    # Run jobs
    while True:
        schedule.run_pending()
        time.sleep(1)


# Run an initial update
def initial_update():
    """
    Perform initial cryptocurrency data update when the service starts.
    """
    try:
        update_crypto_data()
    except Exception as e:
        logger.error(f"Error during initial update: {e}")

# Add health check API
from fastapi import FastAPI, HTTPException
import uvicorn
from threading import Thread
from typing import Dict

app = FastAPI()

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Check the health status of the service including database and Redis connections.

    Returns:
        Dict[str, str]: A dictionary containing service health status
    """
    # Basic health check endpoint
    try:
        # Check database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()

        # Check Redis connection
        redis_client = get_redis_connection()
        redis_client.ping()

        return {"status": "healthy", "service": "crypto-tracker"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run FastAPI in a separate thread
def run_api_server():
    """
    Start the FastAPI server for health check endpoint.
    """
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    logger.info("Starting Crypto Tracker service")

    # Start API server in a separate thread
    api_thread = Thread(target=run_api_server, daemon=True)
    api_thread.start()

    # Run initial update
    initial_update()

    # Schedule and run jobs
    try:
        schedule_jobs()
    except Exception as e:
        logger.error(f"Error in job scheduler: {e}")
