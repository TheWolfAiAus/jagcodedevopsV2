import asyncio
import aiohttp
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from web3 import Web3
from eth_account import Account
import json

from ..core.config import settings
from ..core.database import AsyncSessionLocal, SmartContract, WalletTransaction
from sqlalchemy import select, update

logger = logging.getLogger(__name__)

class SmartContractManager:
    """Smart contract automation and management service"""
    
    def __init__(self):
        self.is_running = False
        self.web3_connections: Dict[str, Web3] = {}
        self.wallet_account = None
        self.active_contracts: Dict[str, Dict[str, Any]] = {}
        
    async def start(self):
        """Start the smart contract management service"""
        if self.is_running or not settings.CONTRACT_AUTOMATION_ENABLED:
            return
            
        self.is_running = True
        logger.info("Smart Contract Manager service started")
        
        # Initialize wallet account
        await self._initialize_wallet()
        
        # Initialize Web3 connections
        await self._initialize_web3_connections()
        
        # Load active contracts
        await self._load_active_contracts()
        
        # Start automation loop
        asyncio.create_task(self._automation_loop())
        
    async def stop(self):
        """Stop the smart contract management service"""
        self.is_running = False
        logger.info("Smart Contract Manager service stopped")
        
    async def _initialize_wallet(self):
        """Initialize wallet account from private key"""
        try:
            if settings.EXODUS_PRIVATE_KEY:
                self.wallet_account = Account.from_key(settings.EXODUS_PRIVATE_KEY)
                logger.info(f"Smart contract wallet initialized: {self.wallet_account.address}")
            else:
                logger.warning("No private key configured - smart contract functions limited")
                
        except Exception as e:
            logger.error(f"Error initializing smart contract wallet: {e}")
            
    async def _initialize_web3_connections(self):
        """Initialize Web3 connections to different networks"""
        networks = {
            "ethereum": settings.ETHEREUM_RPC_URL,
            "polygon": settings.POLYGON_RPC_URL,
            "bsc": settings.BSC_RPC_URL,
            "arbitrum": settings.ARBITRUM_RPC_URL
        }
        
        for network, rpc_url in networks.items():
            try:
                if rpc_url and "YOUR_PROJECT_ID" not in rpc_url:
                    w3 = Web3(Web3.HTTPProvider(rpc_url))
                    if w3.is_connected():
                        self.web3_connections[network] = w3
                        logger.info(f"Smart contract manager connected to {network} network")
                    else:
                        logger.warning(f"Failed to connect to {network}")
                        
            except Exception as e:
                logger.error(f"Error connecting to {network}: {e}")
                
    async def _load_active_contracts(self):
        """Load active smart contracts from database"""
        async with AsyncSessionLocal() as db:
            try:
                stmt = select(SmartContract).where(SmartContract.is_active == True)
                result = await db.execute(stmt)
                contracts = result.scalars().all()
                
                for contract in contracts:
                    self.active_contracts[contract.contract_address] = {
                        "name": contract.name,
                        "network": contract.network,
                        "abi": contract.abi,
                        "automation_rules": contract.automation_rules or {},
                        "last_interaction": contract.last_interaction
                    }
                    
                logger.info(f"Loaded {len(self.active_contracts)} active smart contracts")
                
            except Exception as e:
                logger.error(f"Error loading active contracts: {e}")
                
    async def _automation_loop(self):
        """Main automation loop for smart contracts"""
        while self.is_running:
            try:
                for contract_address, contract_data in self.active_contracts.items():
                    await self._process_contract_automation(contract_address, contract_data)
                    
            except Exception as e:
                logger.error(f"Error in smart contract automation loop: {e}")
                
            await asyncio.sleep(300)  # Check every 5 minutes
            
    async def _process_contract_automation(self, contract_address: str, contract_data: Dict[str, Any]):
        """Process automation rules for a specific contract"""
        try:
            automation_rules = contract_data.get("automation_rules", {})
            if not automation_rules:
                return
                
            network = contract_data["network"]
            w3 = self.web3_connections.get(network)
            if not w3:
                return
                
            # Create contract instance
            contract = w3.eth.contract(
                address=contract_address,
                abi=contract_data["abi"]
            )
            
            # Process different types of automation rules
            await self._process_yield_farming(contract, automation_rules.get("yield_farming"))
            await self._process_liquidity_management(contract, automation_rules.get("liquidity_management"))
            await self._process_profit_taking(contract, automation_rules.get("profit_taking"))
            await self._process_arbitrage(contract, automation_rules.get("arbitrage"))
            
        except Exception as e:
            logger.error(f"Error processing automation for {contract_address}: {e}")
            
    async def _process_yield_farming(self, contract, rules: Optional[Dict[str, Any]]):
        """Process yield farming automation"""
        if not rules or not rules.get("enabled"):
            return
            
        try:
            # Check if we should stake more tokens
            min_stake = rules.get("min_stake_amount", 0)
            max_stake = rules.get("max_stake_amount", float('inf'))
            
            # Get current stake
            current_stake = await self._get_current_stake(contract)
            
            # Get available balance
            available_balance = await self._get_available_balance(contract)
            
            # Determine if we should stake more
            if current_stake < min_stake and available_balance > 0:
                stake_amount = min(available_balance, max_stake - current_stake)
                if stake_amount > 0:
                    await self._execute_stake(contract, stake_amount)
                    
            # Check if we should harvest rewards
            if rules.get("auto_harvest", False):
                pending_rewards = await self._get_pending_rewards(contract)
                min_harvest = rules.get("min_harvest_amount", 0)
                
                if pending_rewards >= min_harvest:
                    await self._execute_harvest(contract)
                    
        except Exception as e:
            logger.error(f"Error in yield farming automation: {e}")
            
    async def _process_liquidity_management(self, contract, rules: Optional[Dict[str, Any]]):
        """Process liquidity pool management automation"""
        if not rules or not rules.get("enabled"):
            return
            
        try:
            # Auto-compound liquidity rewards
            if rules.get("auto_compound", False):
                rewards = await self._get_liquidity_rewards(contract)
                min_compound = rules.get("min_compound_amount", 0)
                
                if rewards >= min_compound:
                    await self._execute_compound(contract)
                    
            # Rebalance liquidity if needed
            if rules.get("auto_rebalance", False):
                await self._check_and_rebalance_liquidity(contract, rules)
                
        except Exception as e:
            logger.error(f"Error in liquidity management automation: {e}")
            
    async def _process_profit_taking(self, contract, rules: Optional[Dict[str, Any]]):
        """Process profit taking automation"""
        if not rules or not rules.get("enabled"):
            return
            
        try:
            # Check profit percentage
            current_value = await self._get_position_value(contract)
            initial_investment = rules.get("initial_investment", 0)
            
            if initial_investment > 0:
                profit_percentage = ((current_value - initial_investment) / initial_investment) * 100
                
                # Take profit if target reached
                profit_target = rules.get("profit_target_percentage", settings.PROFIT_TARGET_PERCENTAGE)
                if profit_percentage >= profit_target:
                    take_profit_percentage = rules.get("take_profit_percentage", 50)  # Take 50% by default
                    await self._execute_profit_taking(contract, take_profit_percentage)
                    
                # Stop loss if needed
                stop_loss = rules.get("stop_loss_percentage", settings.STOP_LOSS_PERCENTAGE)
                if profit_percentage <= -stop_loss:
                    await self._execute_stop_loss(contract)
                    
        except Exception as e:
            logger.error(f"Error in profit taking automation: {e}")
            
    async def _process_arbitrage(self, contract, rules: Optional[Dict[str, Any]]):
        """Process arbitrage opportunities"""
        if not rules or not rules.get("enabled"):
            return
            
        try:
            # Check for arbitrage opportunities between DEXes
            min_profit = rules.get("min_profit_percentage", 2.0)
            opportunities = await self._find_arbitrage_opportunities(contract, min_profit)
            
            for opportunity in opportunities:
                if opportunity["profit_percentage"] >= min_profit:
                    await self._execute_arbitrage(contract, opportunity)
                    
        except Exception as e:
            logger.error(f"Error in arbitrage automation: {e}")
            
    async def _get_current_stake(self, contract) -> float:
        """Get current stake amount"""
        try:
            # This would call the contract's balanceOf or similar function
            balance = contract.functions.balanceOf(self.wallet_account.address).call()
            return float(balance) / 1e18  # Assuming 18 decimals
        except:
            return 0.0
            
    async def _get_available_balance(self, contract) -> float:
        """Get available balance for staking"""
        try:
            # Get token balance that can be staked
            # This would depend on the specific token contract
            return 0.0  # Placeholder
        except:
            return 0.0
            
    async def _get_pending_rewards(self, contract) -> float:
        """Get pending rewards amount"""
        try:
            rewards = contract.functions.pendingRewards(self.wallet_account.address).call()
            return float(rewards) / 1e18
        except:
            return 0.0
            
    async def _execute_stake(self, contract, amount: float):
        """Execute staking transaction"""
        try:
            w3 = contract.w3
            
            # Build transaction
            function_call = contract.functions.stake(int(amount * 1e18))
            transaction = function_call.build_transaction({
                'from': self.wallet_account.address,
                'gas': settings.MAX_GAS_LIMIT,
                'gasPrice': w3.to_wei(settings.GAS_PRICE_GWEI, 'gwei'),
                'nonce': w3.eth.get_transaction_count(self.wallet_account.address),
            })
            
            # Sign and send transaction
            signed_txn = self.wallet_account.sign_transaction(transaction)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"Stake transaction sent: {tx_hash.hex()}")
            await self._save_contract_transaction(contract.address, "stake", amount, tx_hash.hex())
            
        except Exception as e:
            logger.error(f"Error executing stake: {e}")
            
    async def _execute_harvest(self, contract):
        """Execute harvest transaction"""
        try:
            w3 = contract.w3
            
            # Build transaction
            function_call = contract.functions.harvest()
            transaction = function_call.build_transaction({
                'from': self.wallet_account.address,
                'gas': settings.MAX_GAS_LIMIT,
                'gasPrice': w3.to_wei(settings.GAS_PRICE_GWEI, 'gwei'),
                'nonce': w3.eth.get_transaction_count(self.wallet_account.address),
            })
            
            # Sign and send transaction
            signed_txn = self.wallet_account.sign_transaction(transaction)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"Harvest transaction sent: {tx_hash.hex()}")
            await self._save_contract_transaction(contract.address, "harvest", 0, tx_hash.hex())
            
        except Exception as e:
            logger.error(f"Error executing harvest: {e}")
            
    async def _save_contract_transaction(self, contract_address: str, action: str, amount: float, tx_hash: str):
        """Save contract transaction to database"""
        async with AsyncSessionLocal() as db:
            try:
                # Update last interaction time
                stmt = update(SmartContract).where(
                    SmartContract.contract_address == contract_address
                ).values(last_interaction=datetime.utcnow())
                await db.execute(stmt)
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error saving contract transaction: {e}")
                
    async def add_contract(self, contract_address: str, name: str, network: str, abi: List[Dict], automation_rules: Dict[str, Any]) -> bool:
        """Add a new smart contract for automation"""
        async with AsyncSessionLocal() as db:
            try:
                # Check if contract already exists
                stmt = select(SmartContract).where(SmartContract.contract_address == contract_address)
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Update existing contract
                    stmt = update(SmartContract).where(
                        SmartContract.contract_address == contract_address
                    ).values(
                        name=name,
                        network=network,
                        abi=abi,
                        automation_rules=automation_rules,
                        is_active=True
                    )
                    await db.execute(stmt)
                else:
                    # Create new contract
                    smart_contract = SmartContract(
                        contract_address=contract_address,
                        name=name,
                        network=network,
                        abi=abi,
                        automation_rules=automation_rules,
                        is_active=True
                    )
                    db.add(smart_contract)
                    
                await db.commit()
                
                # Add to active contracts
                self.active_contracts[contract_address] = {
                    "name": name,
                    "network": network,
                    "abi": abi,
                    "automation_rules": automation_rules,
                    "last_interaction": None
                }
                
                logger.info(f"Added smart contract: {name} ({contract_address})")
                return True
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error adding smart contract: {e}")
                return False
                
    async def get_contract_status(self) -> Dict[str, Any]:
        """Get status of all managed contracts"""
        async with AsyncSessionLocal() as db:
            stmt = select(SmartContract).where(SmartContract.is_active == True)
            result = await db.execute(stmt)
            contracts = result.scalars().all()
            
            return {
                "is_running": self.is_running,
                "total_contracts": len(contracts),
                "contracts": [
                    {
                        "address": contract.contract_address,
                        "name": contract.name,
                        "network": contract.network,
                        "automation_rules": contract.automation_rules,
                        "last_interaction": contract.last_interaction.isoformat() if contract.last_interaction else None,
                        "created_at": contract.created_at.isoformat()
                    }
                    for contract in contracts
                ]
            }
            
    async def execute_manual_action(self, contract_address: str, action: str, params: Dict[str, Any]) -> Optional[str]:
        """Execute manual action on a smart contract"""
        if contract_address not in self.active_contracts:
            logger.error(f"Contract {contract_address} not found in active contracts")
            return None
            
        contract_data = self.active_contracts[contract_address]
        network = contract_data["network"]
        w3 = self.web3_connections.get(network)
        
        if not w3:
            logger.error(f"No connection to {network}")
            return None
            
        try:
            contract = w3.eth.contract(
                address=contract_address,
                abi=contract_data["abi"]
            )
            
            # Execute different actions based on type
            if action == "stake":
                amount = params.get("amount", 0)
                await self._execute_stake(contract, amount)
            elif action == "harvest":
                await self._execute_harvest(contract)
            elif action == "withdraw":
                amount = params.get("amount", 0)
                await self._execute_withdraw(contract, amount)
            else:
                logger.error(f"Unknown action: {action}")
                return None
                
            return "success"
            
        except Exception as e:
            logger.error(f"Error executing manual action {action}: {e}")
            return None
            
    async def _execute_withdraw(self, contract, amount: float):
        """Execute withdraw transaction"""
        try:
            w3 = contract.w3
            
            # Build transaction
            function_call = contract.functions.withdraw(int(amount * 1e18))
            transaction = function_call.build_transaction({
                'from': self.wallet_account.address,
                'gas': settings.MAX_GAS_LIMIT,
                'gasPrice': w3.to_wei(settings.GAS_PRICE_GWEI, 'gwei'),
                'nonce': w3.eth.get_transaction_count(self.wallet_account.address),
            })
            
            # Sign and send transaction
            signed_txn = self.wallet_account.sign_transaction(transaction)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"Withdraw transaction sent: {tx_hash.hex()}")
            await self._save_contract_transaction(contract.address, "withdraw", amount, tx_hash.hex())
            
        except Exception as e:
            logger.error(f"Error executing withdraw: {e}")