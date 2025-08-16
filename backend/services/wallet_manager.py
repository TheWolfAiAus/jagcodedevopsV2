import asyncio
import aiohttp
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from web3 import Web3
from eth_account import Account
import json

from ..core.config import settings
from ..core.database import AsyncSessionLocal, WalletTransaction, AssetBalance
from sqlalchemy import select, update

logger = logging.getLogger(__name__)

class WalletManager:
    """Exodus wallet integration and management service"""
    
    def __init__(self):
        self.is_running = False
        self.web3_connections: Dict[str, Web3] = {}
        self.wallet_account = None
        
    async def start(self):
        """Start the wallet management service"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Wallet Manager service started")
        
        # Initialize wallet account
        await self._initialize_wallet()
        
        # Initialize Web3 connections
        await self._initialize_web3_connections()
        
        # Start monitoring loop
        asyncio.create_task(self._monitoring_loop())
        
    async def stop(self):
        """Stop the wallet management service"""
        self.is_running = False
        logger.info("Wallet Manager service stopped")
        
    async def _initialize_wallet(self):
        """Initialize wallet account from private key"""
        try:
            if settings.EXODUS_PRIVATE_KEY:
                self.wallet_account = Account.from_key(settings.EXODUS_PRIVATE_KEY)
                logger.info(f"Wallet initialized: {self.wallet_account.address}")
            else:
                logger.warning("No private key configured - wallet functions limited")
                
        except Exception as e:
            logger.error(f"Error initializing wallet: {e}")
            
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
                        logger.info(f"Connected to {network} network")
                    else:
                        logger.warning(f"Failed to connect to {network}")
                        
            except Exception as e:
                logger.error(f"Error connecting to {network}: {e}")
                
    async def _monitoring_loop(self):
        """Monitor wallet balances and transactions"""
        while self.is_running:
            try:
                # Update balances for all networks
                await self._update_all_balances()
                
                # Check for new transactions
                await self._check_new_transactions()
                
            except Exception as e:
                logger.error(f"Error in wallet monitoring loop: {e}")
                
            await asyncio.sleep(60)  # Update every minute
            
    async def _update_all_balances(self):
        """Update balances for all networks and tokens"""
        if not settings.EXODUS_WALLET_ADDRESS:
            return
            
        for network, w3 in self.web3_connections.items():
            try:
                # Get native token balance
                balance_wei = w3.eth.get_balance(settings.EXODUS_WALLET_ADDRESS)
                balance_eth = w3.from_wei(balance_wei, 'ether')
                
                # Get token symbol for network
                token_symbol = self._get_native_token_symbol(network)
                
                # Save balance to database
                await self._save_balance(
                    network=network,
                    token_address=None,  # Native token
                    token_symbol=token_symbol,
                    balance=float(balance_eth)
                )
                
                # Get ERC-20 token balances (common tokens)
                await self._update_token_balances(network, w3)
                
            except Exception as e:
                logger.error(f"Error updating balances for {network}: {e}")
                
    def _get_native_token_symbol(self, network: str) -> str:
        """Get native token symbol for network"""
        symbols = {
            "ethereum": "ETH",
            "polygon": "MATIC",
            "bsc": "BNB",
            "arbitrum": "ETH"
        }
        return symbols.get(network, "ETH")
        
    async def _update_token_balances(self, network: str, w3: Web3):
        """Update ERC-20 token balances"""
        # Common token contracts for each network
        token_contracts = {
            "ethereum": {
                "USDC": "0xA0b86a33E6441b8C4505E2c4b5b5b5b5b5b5b5b5",  # Example
                "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            },
            "polygon": {
                "USDC": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                "WMATIC": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
            },
            "bsc": {
                "USDT": "0x55d398326f99059fF775485246999027B3197955",
                "WBNB": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
            }
        }
        
        contracts = token_contracts.get(network, {})
        
        for token_symbol, contract_address in contracts.items():
            try:
                balance = await self._get_erc20_balance(w3, contract_address, settings.EXODUS_WALLET_ADDRESS)
                if balance > 0:
                    await self._save_balance(
                        network=network,
                        token_address=contract_address,
                        token_symbol=token_symbol,
                        balance=balance
                    )
                    
            except Exception as e:
                logger.error(f"Error getting {token_symbol} balance on {network}: {e}")
                
    async def _get_erc20_balance(self, w3: Web3, contract_address: str, wallet_address: str) -> float:
        """Get ERC-20 token balance"""
        # Standard ERC-20 ABI for balanceOf and decimals
        erc20_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            }
        ]
        
        contract = w3.eth.contract(address=contract_address, abi=erc20_abi)
        balance_raw = contract.functions.balanceOf(wallet_address).call()
        decimals = contract.functions.decimals().call()
        
        return balance_raw / (10 ** decimals)
        
    async def _save_balance(self, network: str, token_address: Optional[str], token_symbol: str, balance: float):
        """Save balance to database"""
        async with AsyncSessionLocal() as db:
            try:
                # Check if balance record exists
                stmt = select(AssetBalance).where(
                    AssetBalance.wallet_address == settings.EXODUS_WALLET_ADDRESS,
                    AssetBalance.network == network,
                    AssetBalance.token_symbol == token_symbol
                )
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Update existing balance
                    stmt = update(AssetBalance).where(
                        AssetBalance.id == existing.id
                    ).values(
                        balance=balance,
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
                else:
                    # Create new balance record
                    asset_balance = AssetBalance(
                        wallet_address=settings.EXODUS_WALLET_ADDRESS,
                        token_address=token_address,
                        token_symbol=token_symbol,
                        balance=balance,
                        network=network
                    )
                    db.add(asset_balance)
                    
                await db.commit()
                
            except Exception as e:
                await db.rollback()
                logger.error(f"Error saving balance: {e}")
                
    async def _check_new_transactions(self):
        """Check for new transactions"""
        if not settings.EXODUS_WALLET_ADDRESS:
            return
            
        for network, w3 in self.web3_connections.items():
            try:
                # Get latest block
                latest_block = w3.eth.get_block('latest')
                
                # Check transactions in recent blocks (last 10 blocks)
                for block_num in range(max(0, latest_block.number - 10), latest_block.number + 1):
                    block = w3.eth.get_block(block_num, full_transactions=True)
                    
                    for tx in block.transactions:
                        if (tx['to'] == settings.EXODUS_WALLET_ADDRESS or 
                            tx['from'] == settings.EXODUS_WALLET_ADDRESS):
                            await self._process_transaction(network, tx)
                            
            except Exception as e:
                logger.error(f"Error checking transactions for {network}: {e}")
                
    async def _process_transaction(self, network: str, tx):
        """Process and save transaction"""
        async with AsyncSessionLocal() as db:
            try:
                # Check if transaction already exists
                stmt = select(WalletTransaction).where(
                    WalletTransaction.tx_hash == tx['hash'].hex()
                )
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if not existing:
                    # Determine transaction type
                    tx_type = "receive" if tx['to'] == settings.EXODUS_WALLET_ADDRESS else "send"
                    
                    # Create transaction record
                    wallet_tx = WalletTransaction(
                        tx_hash=tx['hash'].hex(),
                        from_address=tx['from'],
                        to_address=tx['to'],
                        value=float(Web3.from_wei(tx['value'], 'ether')),
                        token_symbol=self._get_native_token_symbol(network),
                        gas_used=tx.get('gas'),
                        gas_price=float(Web3.from_wei(tx['gasPrice'], 'gwei')) if tx.get('gasPrice') else None,
                        block_number=tx['blockNumber'],
                        transaction_type=tx_type,
                        status="confirmed"
                    )
                    db.add(wallet_tx)
                    await db.commit()
                    
                    logger.info(f"New {tx_type} transaction: {tx['hash'].hex()}")
                    
            except Exception as e:
                await db.rollback()
                logger.error(f"Error processing transaction: {e}")
                
    async def send_transaction(self, to_address: str, amount: float, token_symbol: str, network: str = "ethereum") -> Optional[str]:
        """Send transaction from Exodus wallet"""
        if not self.wallet_account:
            logger.error("Wallet not initialized")
            return None
            
        w3 = self.web3_connections.get(network)
        if not w3:
            logger.error(f"No connection to {network}")
            return None
            
        try:
            # Get nonce
            nonce = w3.eth.get_transaction_count(self.wallet_account.address)
            
            # Build transaction
            if token_symbol == self._get_native_token_symbol(network):
                # Native token transfer
                transaction = {
                    'to': to_address,
                    'value': w3.to_wei(amount, 'ether'),
                    'gas': 21000,
                    'gasPrice': w3.to_wei(settings.GAS_PRICE_GWEI, 'gwei'),
                    'nonce': nonce,
                }
            else:
                # ERC-20 token transfer (simplified)
                logger.error("ERC-20 transfers not implemented yet")
                return None
                
            # Sign transaction
            signed_txn = self.wallet_account.sign_transaction(transaction)
            
            # Send transaction
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error sending transaction: {e}")
            return None
            
    async def get_wallet_status(self) -> Dict[str, Any]:
        """Get current wallet status and balances"""
        async with AsyncSessionLocal() as db:
            # Get all balances
            stmt = select(AssetBalance).where(
                AssetBalance.wallet_address == settings.EXODUS_WALLET_ADDRESS
            )
            result = await db.execute(stmt)
            balances = result.scalars().all()
            
            # Get recent transactions
            stmt = select(WalletTransaction).where(
                (WalletTransaction.from_address == settings.EXODUS_WALLET_ADDRESS) |
                (WalletTransaction.to_address == settings.EXODUS_WALLET_ADDRESS)
            ).order_by(WalletTransaction.timestamp.desc()).limit(10)
            result = await db.execute(stmt)
            transactions = result.scalars().all()
            
            return {
                "wallet_address": settings.EXODUS_WALLET_ADDRESS,
                "is_connected": len(self.web3_connections) > 0,
                "networks": list(self.web3_connections.keys()),
                "balances": [
                    {
                        "network": balance.network,
                        "token_symbol": balance.token_symbol,
                        "balance": balance.balance,
                        "balance_usd": balance.balance_usd,
                        "last_updated": balance.last_updated.isoformat()
                    }
                    for balance in balances
                ],
                "recent_transactions": [
                    {
                        "tx_hash": tx.tx_hash,
                        "from_address": tx.from_address,
                        "to_address": tx.to_address,
                        "value": tx.value,
                        "token_symbol": tx.token_symbol,
                        "transaction_type": tx.transaction_type,
                        "status": tx.status,
                        "timestamp": tx.timestamp.isoformat()
                    }
                    for tx in transactions
                ]
            }
            
    async def transfer_to_exodus(self, amount: float, token_symbol: str, network: str = "ethereum") -> Optional[str]:
        """Transfer assets to Exodus wallet (if using different address)"""
        # This would be used if the system uses a different address and needs to transfer to Exodus
        # For now, we assume the system IS the Exodus wallet
        logger.info(f"Transfer to Exodus requested: {amount} {token_symbol} on {network}")
        return None