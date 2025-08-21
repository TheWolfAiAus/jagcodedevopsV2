# Crypto Tracker Service

## Overview
This service tracks cryptocurrency prices, analyzes market data, and manages user price alerts for the CryptoDashboard application.

## Features
- Fetches top 100 cryptocurrencies and their market data
- Stores historical price data in PostgreSQL database
- Caches latest prices in Redis for fast access
- Monitors user-defined price alerts
- Automated data cleanup to manage database size

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Redis cache

### Environment Variables
```
PG_HOST=your_db_host
PG_PORT=your_db_port
PG_USER=your_db_user
PG_PASSWORD=your_db_password
PG_DATABASE=your_db_name
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
COINGECKO_API_KEY=your_coingecko_key
```

### Installation
```bash
# Install dependencies
pip install -r requirements.txt
```

### Running
```bash
# Run the service
python main.py
```

## Docker
You can also run the service using Docker:

```bash
# Build the image
docker build -t crypto-tracker .

# Run the container
docker run -d --env-file .env --name crypto-tracker crypto-tracker
```
