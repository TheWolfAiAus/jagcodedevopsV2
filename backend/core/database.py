from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer, DateTime, Boolean, Text, JSON
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from .config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    """Base class for all database models"""
    pass

# Database Models
class NFTOpportunity(Base):
    __tablename__ = "nft_opportunities"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    contract_address: Mapped[str] = mapped_column(String(42), index=True)
    token_id: Mapped[str] = mapped_column(String(100), index=True)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    collection_name: Mapped[Optional[str]] = mapped_column(String(255))
    price_eth: Mapped[float] = mapped_column(Float)
    price_usd: Mapped[Optional[float]] = mapped_column(Float)
    score: Mapped[float] = mapped_column(Float, index=True)
    source: Mapped[str] = mapped_column(String(50))
    marketplace_url: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(Text)
    metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    discovered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="discovered")  # discovered, purchased, passed
    
class MiningOperation(Base):
    __tablename__ = "mining_operations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    coin: Mapped[str] = mapped_column(String(10), index=True)
    pool_url: Mapped[str] = mapped_column(String(255))
    wallet_address: Mapped[str] = mapped_column(String(42))
    hashrate: Mapped[Optional[float]] = mapped_column(Float)
    shares_accepted: Mapped[int] = mapped_column(Integer, default=0)
    shares_rejected: Mapped[int] = mapped_column(Integer, default=0)
    earnings_today: Mapped[float] = mapped_column(Float, default=0.0)
    earnings_total: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="inactive")  # active, inactive, error
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tx_hash: Mapped[str] = mapped_column(String(66), unique=True, index=True)
    from_address: Mapped[str] = mapped_column(String(42), index=True)
    to_address: Mapped[str] = mapped_column(String(42), index=True)
    value: Mapped[float] = mapped_column(Float)
    token_symbol: Mapped[str] = mapped_column(String(10))
    gas_used: Mapped[Optional[int]] = mapped_column(Integer)
    gas_price: Mapped[Optional[float]] = mapped_column(Float)
    block_number: Mapped[Optional[int]] = mapped_column(Integer)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    transaction_type: Mapped[str] = mapped_column(String(20))  # send, receive, contract_call
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, confirmed, failed

class SmartContract(Base):
    __tablename__ = "smart_contracts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    contract_address: Mapped[str] = mapped_column(String(42), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    network: Mapped[str] = mapped_column(String(20))
    abi: Mapped[Dict[str, Any]] = mapped_column(JSON)
    automation_rules: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_interaction: Mapped[Optional[datetime]] = mapped_column(DateTime)

class AssetBalance(Base):
    __tablename__ = "asset_balances"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wallet_address: Mapped[str] = mapped_column(String(42), index=True)
    token_address: Mapped[Optional[str]] = mapped_column(String(42))  # None for native tokens
    token_symbol: Mapped[str] = mapped_column(String(10))
    balance: Mapped[float] = mapped_column(Float)
    balance_usd: Mapped[Optional[float]] = mapped_column(Float)
    network: Mapped[str] = mapped_column(String(20))
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level: Mapped[str] = mapped_column(String(10), index=True)
    module: Mapped[str] = mapped_column(String(50), index=True)
    message: Mapped[str] = mapped_column(Text)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

# Database dependency
async def get_db() -> AsyncSession:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise