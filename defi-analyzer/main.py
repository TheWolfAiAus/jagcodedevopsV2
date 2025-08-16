import json
import logging
import os
import psycopg2
import requests
import schedule
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from web3 import Web3

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("defi_analyzer.log")
    ]
)
logger = logging.getLogger("defi-analyzer")

# Load environment variables
load_dotenv()


# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('PG_HOST'),
        port=os.environ.get('PG_PORT'),
        user=os.environ.get('PG_USER'),
        password=os.environ.get('PG_PASSWORD'),
        database=os.environ.get('PG_DATABASE')
    )


# Blockchain connections
def get_ethereum_connection():
    alchemy_url = f"https://eth-mainnet.g.alchemy.com/v2/{os.environ.get('ALCHEMY_API_KEY')}"
    return Web3(Web3.HTTPProvider(alchemy_url, request_kwargs={'timeout': 60}))


# API keys
ETHERSCAN_API_KEY = os.environ.get('ETHERSCAN_API_KEY')
ALCHEMY_API_KEY = os.environ.get('ALCHEMY_API_KEY')

# List of top DeFi protocols to track
DEFI_PROTOCOLS = [
    {
        'name': 'Uniswap V3',
        'blockchain': 'ethereum',
        'category': 'dex',
        'address': '0x1F98431c8aD98523631AE4a59f267346ea31F984'  # Uniswap V3 Factory
    },
    {
        'name': 'Aave V3',
        'blockchain': 'ethereum',
        'category': 'lending',
        'address': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'  # Aave V3 Pool
    },
    {
        'name': 'Compound V3',
        'blockchain': 'ethereum',
        'category': 'lending',
        'address': '0xc3d688B66703497DAA19211EEdff47f25384cdc3'  # Compound V3 Pool
    },
    {
        'name': 'Curve Finance',
        'blockchain': 'ethereum',
        'category': 'dex',
        'address': '0xB9fC157394Af804a3578134A6585C0dc9cc990d4'  # Curve Factory
    },
    {
        'name': 'MakerDAO',
        'blockchain': 'ethereum',
        'category': 'lending',
        'address': '0x9759A6Ac90977b93B58547b4A71c78317f391A28'  # MakerDAO DSS
    },
    {
        'name': 'Balancer',
        'blockchain': 'ethereum',
        'category': 'dex',
        'address': '0xBA12222222228d8Ba445958a75a0704d566BF2C8'  # Balancer Vault
    },
    {
        'name': 'Lido',
        'blockchain': 'ethereum',
        'category': 'staking',
        'address': '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'  # Lido stETH
    },
    {
        'name': 'SushiSwap',
        'blockchain': 'ethereum',
        'category': 'dex',
        'address': '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'  # SushiSwap Factory
    },
    {
        'name': 'Convex Finance',
        'blockchain': 'ethereum',
        'category': 'yield',
        'address': '0xF403C135812408BFbE8713b5A23a04b3D48AAE31'  # Convex Booster
    },
    {
        'name': 'Yearn Finance',
        'blockchain': 'ethereum',
        'category': 'yield',
        'address': '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804'  # Yearn Registry
    }
]


# Fetch DeFi protocol data from DeFi Llama API
def fetch_defi_protocols():
    try:
        url = "https://api.llama.fi/protocols"
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        protocols = response.json()
        logger.info(f"Fetched {len(protocols)} DeFi protocols from DeFi Llama")

        # Filter and process the data
        processed_protocols = []
        for protocol in protocols:
            # Find matches with our tracked protocols
            for tracked in DEFI_PROTOCOLS:
                if tracked['name'].lower() in protocol['name'].lower():
                    # Handle potential missing 'tvl' key
                    tvl = protocol.get('tvl', 0)
                    processed_protocols.append({
                        'name': tracked['name'],
                        'blockchain': tracked['blockchain'],
                        'category': tracked['category'],
                        'tvl': tvl,
                        'apy': None  # We'll fill this in later
                    })
                    break

        return processed_protocols
    except Exception as e:
        logger.error(f"Error fetching DeFi protocols: {e}")
        return []


# Fetch APY data for protocols
def fetch_apy_data(protocols):
    try:
        url = "https://yields.llama.fi/pools"
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        result = response.json()
        if 'data' not in result:
            logger.error("Unexpected API response format: 'data' key missing")
            return protocols

        pools = result['data']
        logger.info(f"Fetched {len(pools)} yield pools from DeFi Llama")

        # Map protocols to their APY data
        for protocol in protocols:
            # Find matching pools
            matching_pools = [p for p in pools if 'project' in p and protocol['name'].lower() in p['project'].lower()]

            if matching_pools:
                # Calculate average APY
                valid_pools = [p for p in matching_pools if 'apy' in p and p['apy'] is not None]
                if valid_pools:
                    total_apy = sum(float(p['apy']) for p in valid_pools)
                    avg_apy = total_apy / len(valid_pools) if total_apy > 0 else 0
                    protocol['apy'] = avg_apy

        return protocols
    except Exception as e:
        logger.error(f"Error fetching APY data: {e}")
        return protocols


# Store protocol data in database
def store_protocol_data(protocols):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for protocol in protocols:
            cursor.execute(
                """INSERT INTO defi_protocols
                       (name, blockchain, category, tvl, apy)
                   VALUES (%s, %s, %s, %s, %s) ON CONFLICT (name) DO
                UPDATE
                    SET tvl = EXCLUDED.tvl,
                    apy = EXCLUDED.apy,
                    last_updated = CURRENT_TIMESTAMP""",
                (protocol['name'],
                 protocol['blockchain'],
                 protocol['category'],
                 protocol['tvl'],
                 protocol['apy'])
            )

        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Stored data for {len(protocols)} DeFi protocols")
    except Exception as e:
        logger.error(f"Error storing protocol data: {e}")


# Analyze smart contracts for tracked protocols
def analyze_smart_contracts():
    try:
        # Get Ethereum connection
        w3 = get_ethereum_connection()

        # Verify connection
        if not w3.is_connected():
            logger.error("Could not connect to Ethereum network")
            return

        conn = get_db_connection()
        cursor = conn.cursor()

        for protocol in DEFI_PROTOCOLS:
            try:
                # Get contract code
                address = protocol['address']
                contract_code = w3.eth.get_code(address).hex()

                # Skip if no code at address (not a contract)
                if contract_code == '0x' or contract_code == '0x0':
                    logger.warning(f"No contract code found at {address} for {protocol['name']}")
                    continue

                # Get source code from Etherscan
                etherscan_url = f"https://api.etherscan.io/api?module=contract&action=getsourcecode&address={address}&apikey={ETHERSCAN_API_KEY}"
                response = requests.get(etherscan_url, timeout=10)  # Add timeout

                if response.status_code == 200:
                    data = response.json()
                    if data['status'] == '1' and len(data['result']) > 0:
                        source_code = data['result'][0]['SourceCode']

                        # Store contract info in database
                        cursor.execute(
                            """INSERT INTO smart_contracts
                                   (name, blockchain, address, source_code, last_analyzed)
                               VALUES (%s, %s, %s, %s, %s) ON CONFLICT (address) DO
                            UPDATE
                                SET source_code = EXCLUDED.source_code,
                                last_analyzed = EXCLUDED.last_analyzed""",
                            (protocol['name'],
                             protocol['blockchain'],
                             address,
                             source_code,
                             datetime.now())
                        )
                        conn.commit()  # Commit after each successful insert
            except Exception as e:
                logger.error(f"Error analyzing contract for {protocol['name']}: {e}")
                # Continue with next protocol instead of failing entire batch
                continue

        cursor.close()
        conn.close()
        logger.info(f"Analyzed smart contracts for {len(DEFI_PROTOCOLS)} protocols")
    except Exception as e:
        logger.error(f"Error analyzing smart contracts: {e}")


# Main job to update DeFi protocol data
def update_defi_data():
    logger.info("Starting DeFi protocol data update")

    # Fetch protocol data
    protocols = fetch_defi_protocols()

    if protocols:
        # Fetch APY data
        protocols = fetch_apy_data(protocols)

        # Store protocol data
        store_protocol_data(protocols)

    logger.info("Finished DeFi protocol data update")


# Job to analyze smart contracts
def analyze_contracts_job():
    logger.info("Starting smart contract analysis")
    analyze_smart_contracts()
    logger.info("Finished smart contract analysis")


# Schedule jobs
def schedule_jobs():
    # Update DeFi data every 6 hours
    schedule.every(6).hours.do(update_defi_data)

    # Analyze contracts once a day
    schedule.every().day.at("02:00").do(analyze_contracts_job)

    logger.info("Scheduled jobs")

    # Run jobs
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            logger.error(f"Error in job scheduler: {e}")
            # Continue running even if an exception occurs
            time.sleep(10)


# Run an initial update
def initial_update():
    try:
        update_defi_data()
    except Exception as e:
        logger.error(f"Error during initial update: {e}")


if __name__ == "__main__":
    logger.info("Starting DeFi Analyzer service")

    # Initialize health check server
    from health_check import start_health_check_server
    start_health_check_server()

    # Run initial update
    initial_update()

    # Schedule and run jobs
    schedule_jobs()
