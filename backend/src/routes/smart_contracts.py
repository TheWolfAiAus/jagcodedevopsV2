from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

smart_contract_service = None

def set_smart_contract_service(service):
    global smart_contract_service
    smart_contract_service = service

@router.get("/status", summary="🤖 Get Smart Contract Status")
async def get_contract_status():
    """Get status of all managed smart contracts"""
    try:
        if not smart_contract_service:
            raise HTTPException(status_code=500, detail="Smart Contract service not available")
            
        status = await smart_contract_service.get_contract_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting contract status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get contract status: {e}")

@router.post("/add", summary="➕ Add Smart Contract")
async def add_contract(
    contract_address: str,
    name: str,
    network: str,
    abi: List[Dict],
    automation_rules: Dict[str, Any] = None
):
    """Add a new smart contract for automation"""
    try:
        if not smart_contract_service:
            raise HTTPException(status_code=500, detail="Smart Contract service not available")
            
        if automation_rules is None:
            automation_rules = {}
            
        success = await smart_contract_service.add_contract(
            contract_address=contract_address,
            name=name,
            network=network,
            abi=abi,
            automation_rules=automation_rules
        )
        
        if success:
            return {
                "message": f"🤖 Smart contract '{name}' added successfully",
                "contract_address": contract_address,
                "network": network,
                "status": "added"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to add contract")
            
    except Exception as e:
        logger.error(f"Error adding contract: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add contract: {e}")

@router.post("/execute/{contract_address}", summary="⚡ Execute Contract Action")
async def execute_contract_action(
    contract_address: str,
    action: str,
    params: Dict[str, Any] = None
):
    """Execute a manual action on a smart contract"""
    try:
        if not smart_contract_service:
            raise HTTPException(status_code=500, detail="Smart Contract service not available")
            
        if params is None:
            params = {}
            
        result = await smart_contract_service.execute_manual_action(
            contract_address=contract_address,
            action=action,
            params=params
        )
        
        if result:
            return {
                "message": f"⚡ Action '{action}' executed successfully",
                "contract_address": contract_address,
                "action": action,
                "result": result,
                "status": "executed"
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to execute action '{action}'")
            
    except Exception as e:
        logger.error(f"Error executing contract action: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute action: {e}")