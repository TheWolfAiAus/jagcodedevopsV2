# Smart Contract ABIs

This directory contains ABI (Application Binary Interface) files for various smart contracts used in the DeFi and cryptocurrency ecosystem.

These files are essential for interacting with contracts on the blockchain and contain no mock or example data.

## Usage

The ABI files are used by the Web3.js or ethers.js libraries to format the contract calls correctly.

## Required ABIs

The following ABIs need to be placed in this directory:

- `erc20.json` - Standard ERC-20 token interface
- `uniswap_v2_pair.json` - Uniswap V2 Pair contract
- `uniswap_v2_factory.json` - Uniswap V2 Factory contract
- `uniswap_v3_pool.json` - Uniswap V3 Pool contract
- `aave_lending_pool.json` - Aave Lending Pool contract
- `compound_comptroller.json` - Compound Comptroller contract

## Obtaining ABIs

These ABIs can be obtained from:

1. Etherscan verified contracts
2. Official project repositories
3. Contract documentation

Please ensure you're using the correct ABI for the specific network (Ethereum mainnet, Polygon, etc.) you're connecting to.
