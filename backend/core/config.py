from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "JAG-OPS Backend"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://jagops:jagops123@localhost:5432/jagops_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Exodus Wallet Configuration
    EXODUS_WALLET_ADDRESS: str = os.getenv("EXODUS_WALLET_ADDRESS", "")
    EXODUS_PRIVATE_KEY: str = os.getenv("EXODUS_PRIVATE_KEY", "")
    
    # Blockchain Networks
    ETHEREUM_RPC_URL: str = "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
    POLYGON_RPC_URL: str = "https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID"
    BSC_RPC_URL: str = "https://bsc-dataseed.binance.org/"
    ARBITRUM_RPC_URL: str = "https://arb1.arbitrum.io/rpc"
    
    # API Keys
    INFURA_PROJECT_ID: str = os.getenv("INFURA_PROJECT_ID", "")
    ALCHEMY_API_KEY: str = os.getenv("ALCHEMY_API_KEY", "")
    MORALIS_API_KEY: str = os.getenv("MORALIS_API_KEY", "")
    OPENSEA_API_KEY: str = os.getenv("OPENSEA_API_KEY", "")
    
    # NFT Hunting Configuration
    NFT_HUNT_INTERVAL: int = 300  # 5 minutes
    NFT_SOURCES: List[str] = [
        "opensea",
        "rarible",
        "foundation",
        "superrare",
        "async_art",
        "known_origin"
    ]
    NFT_MIN_SCORE: float = 7.0
    NFT_MAX_PRICE_ETH: float = 0.1
    
    # Mining Configuration
    MINING_ENABLED: bool = True
    MINING_COINS: List[str] = ["ETH", "BTC", "MATIC", "BNB"]
    MINING_POOL_URLS: dict = {
        "ETH": "stratum1+tcp://eth-us-east1.nanopool.org:9999",
        "BTC": "stratum+tcp://btc.pool.com:3333"
    }
    
    # Smart Contract Configuration
    CONTRACT_AUTOMATION_ENABLED: bool = True
    GAS_PRICE_GWEI: int = 20
    MAX_GAS_LIMIT: int = 500000
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Monitoring
    SYSTEM_MONITOR_INTERVAL: int = 60  # 1 minute
    LOG_LEVEL: str = "INFO"
    
    # Profit Targets
    PROFIT_TARGET_PERCENTAGE: float = 20.0
    STOP_LOSS_PERCENTAGE: float = 10.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()