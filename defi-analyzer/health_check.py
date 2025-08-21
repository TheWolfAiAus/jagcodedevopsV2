import os
import logging
from fastapi import FastAPI, HTTPException
import uvicorn
from threading import Thread
from typing import Dict

logger = logging.getLogger("defi-analyzer")

# Initialize FastAPI app
app = FastAPI()

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for the DeFi Analyzer service"""
    try:
        # Return healthy status
        return {
            "status": "healthy",
            "service": "defi-analyzer",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def run_api_server():
    """Run the FastAPI server in the background"""
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

def start_health_check_server():
    """Start the health check API server in a background thread"""
    api_thread = Thread(target=run_api_server, daemon=True)
    api_thread.start()
    logger.info("Health check API server started")
