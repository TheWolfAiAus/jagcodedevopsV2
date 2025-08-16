# DeFi Analyzer Service

## Overview
This service tracks DeFi protocols, analyzes smart contracts, and provides yield opportunity data for the CryptoDashboard application.

## Features
- Fetches protocol data from DeFi Llama API
- Calculates average APY across different pools
- Analyzes smart contracts for security vulnerabilities
- Stores protocol and contract data in PostgreSQL database

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Ethereum node access (via Alchemy or Infura)

### Environment Variables
```
PG_HOST=your_db_host
PG_PORT=your_db_port
PG_USER=your_db_user
PG_PASSWORD=your_db_password
PG_DATABASE=your_db_name
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
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
docker build -t defi-analyzer .

# Run the container
docker run -d --env-file .env --name defi-analyzer defi-analyzer
```
