from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager

from backend.routers import automation, nft_hunter, crypto_miner, wallet_manager, smart_contracts, asset_tracker
from backend.core.config import settings
from backend.core.database import init_db
from backend.services.system_monitor import SystemMonitor
from backend.services.automation_engine import AutomationEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
system_monitor = SystemMonitor()
automation_engine = AutomationEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting JAG-OPS Backend System...")

    # Initialize database
    await init_db()

    # Start system monitor
    await system_monitor.start()

    # Start automation engine
    await automation_engine.start()

    logger.info("JAG-OPS Backend System started successfully!")

    yield

    # Cleanup
    logger.info("Shutting down JAG-OPS Backend System...")
    await system_monitor.stop()
    await automation_engine.stop()

# Create FastAPI app
app = FastAPI(
    title="JAG-OPS Backend",
    description="Comprehensive crypto operations backend with NFT hunting, mining, and smart contracts",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(automation.router, prefix="/api/automation", tags=["Automation Engine"])
app.include_router(nft_hunter.router, prefix="/api/nft", tags=["NFT Hunter"])
app.include_router(crypto_miner.router, prefix="/api/mining", tags=["Crypto Mining"])
app.include_router(wallet_manager.router, prefix="/api/wallet", tags=["Wallet Manager"])
app.include_router(smart_contracts.router, prefix="/api/contracts", tags=["Smart Contracts"])
app.include_router(asset_tracker.router, prefix="/api/assets", tags=["Asset Tracker"])

# Inject services into routers
automation.set_automation_engine(automation_engine)
nft_hunter.set_nft_hunter_service(automation_engine.nft_hunter)
crypto_miner.set_crypto_miner_service(automation_engine.crypto_miner)
wallet_manager.set_wallet_manager_service(automation_engine.wallet_manager)
smart_contracts.set_smart_contract_service(automation_engine.smart_contract_manager)
asset_tracker.set_wallet_manager_service(automation_engine.wallet_manager)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "JAG-OPS Backend System",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "system_monitor": await system_monitor.get_status(),
        "automation_engine": await automation_engine.get_status()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
