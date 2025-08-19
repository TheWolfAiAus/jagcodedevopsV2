# Appwrite Functions Setup Guide for JagCode Crypto Dashboard

This guide will help you set up your crypto dashboard to work with Appwrite Functions instead of a separate Python backend server.

## Overview

Your crypto dashboard has been updated to use Appwrite Functions for all backend operations. This eliminates the need to run a separate Python FastAPI server and provides a serverless, managed backend solution.

## Step 1: Create Appwrite Project

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Create a new project or use an existing one
3. Note your Project ID (you'll need this for configuration)

## Step 2: Create Appwrite Functions

You need to create the following functions in your Appwrite project:

### Required Functions:

1. **nft-hunter** - Handles NFT hunting operations
2. **automation** - Manages automation engine
3. **crypto-miner** - Controls crypto mining operations
4. **asset-tracker** - Tracks portfolio and assets
5. **wallet-manager** - Manages wallet operations
6. **profit-reporting** - Generates profit reports

### Creating Functions:

For each function above:

1. Go to Appwrite Console → Functions
2. Click "Create Function"
3. Choose your runtime (Node.js 18 or Python 3.9)
4. Set the function name (e.g., "nft-hunter")
5. Configure execution settings:
   - Timeout: 900 seconds (15 minutes)
   - Memory: 512MB (or higher based on needs)

## Step 3: Deploy Function Code

For each function, you'll need to deploy the corresponding route code from your `src/routes/` directory:

### Function Code Structure:

Create an `index.js` or `main.py` file for each function that imports and handles the routes:

#### Example for NFT Hunter Function (Node.js):
```javascript
// For nft-hunter function
const express = require('express');
const { nftHunterRoutes } = require('./nft_hunter'); // Your Python route converted to JS

module.exports = async ({ req, res }) => {
  const app = express();
  
  // Add your NFT hunter routes
  app.use('/nft-hunter', nftHunterRoutes);
  
  return app(req, res);
};
```

#### Example for NFT Hunter Function (Python):
```python
# For nft-hunter function
from appwrite.client import Client
from src.routes.nft_hunter import router as nft_hunter_router

def main(req, res):
    # Initialize your NFT hunter logic here
    # Handle the incoming request and route to appropriate handler
    pass
```

## Step 4: Configure Environment Variables

For each function, set up the required environment variables:

### Common Environment Variables:
- `APPWRITE_PROJECT_ID` - Your project ID
- `APPWRITE_API_KEY` - API key for server operations
- `DATABASE_URL` - Your database connection string
- `REDIS_URL` - Redis connection for caching
- `OPENAI_API_KEY` - For AI features
- `WEB3_PROVIDER_URL` - Ethereum/blockchain provider
- `PRIVATE_KEY` - Wallet private key (encrypted)

### NFT Hunter Specific:
- `OPENSEA_API_KEY` - OpenSea API access
- `ALCHEMY_API_KEY` - Alchemy for blockchain data
- `MORALIS_API_KEY` - Moralis for NFT data

### Crypto Miner Specific:
- `MINING_POOL_URLS` - Mining pool configurations
- `WALLET_ADDRESSES` - Mining reward addresses

## Step 5: Update Dashboard Configuration

Update your dashboard configuration files with your Appwrite Function URLs:

### 1. Update `web/sdk/jagcode-dashboard-config.js`:

```javascript
// In your dashboard initialization
const config = new JagCodeDashboardConfig();
await config.init({
  appwrite: {
    projectId: 'YOUR_PROJECT_ID',
    databaseId: 'YOUR_DATABASE_ID',
    functionsEndpoint: 'https://cloud.appwrite.io/v1/projects/YOUR_PROJECT_ID/functions'
  }
});
```

### 2. Update Function Endpoints:

The dashboard now expects these function endpoints:
- `/nft-hunter/executions` - NFT Hunter operations
- `/automation/executions` - Automation engine
- `/crypto-miner/executions` - Crypto mining
- `/asset-tracker/executions` - Asset tracking
- `/wallet-manager/executions` - Wallet management
- `/profit-reporting/executions` - Profit reports

## Step 6: Database Setup

Create the required databases and collections in Appwrite:

### Collections to Create:
1. `users` - User accounts and profiles
2. `portfolios` - Portfolio data
3. `transactions` - Transaction history
4. `activity` - Activity logs
5. `settings` - User settings
6. `watchlists` - Crypto watchlists
7. `alerts` - Price and portfolio alerts
8. `trading_pairs` - Trading pair configurations

### Collection Permissions:
- Set appropriate read/write permissions for each collection
- Use user-based permissions for personal data
- Set server permissions for system operations

## Step 7: Authentication Setup

Configure Appwrite Authentication:

1. Go to Auth → Settings
2. Enable required auth methods:
   - Email/Password
   - OAuth providers (Google, GitHub, etc.)
   - Anonymous sessions (for testing)

## Step 8: API Keys and Security

1. Generate an API key for server operations:
   - Go to Overview → Integrations → API Keys
   - Create new key with required scopes
   - Add to function environment variables

2. Configure CORS settings:
   - Add your domain to allowed origins
   - Set appropriate headers for API access

## Step 9: Testing Your Setup

### Test Function Deployment:

1. Deploy each function with test code
2. Use Appwrite Console to execute functions
3. Check logs for any errors

### Test Dashboard Integration:

1. Open your dashboard
2. Check browser console for connection errors
3. Test each feature (NFT Hunter, Mining, etc.)
4. Verify API calls are reaching functions

## Step 10: Monitoring and Logs

### Function Monitoring:
- Use Appwrite Console → Functions → Logs
- Monitor execution times and errors
- Set up alerts for function failures

### Dashboard Monitoring:
- Check browser network tab for API calls
- Monitor JavaScript console for errors
- Use dashboard's built-in system status

## Configuration Example

Here's a complete configuration example:

```javascript
// web/dashboard-init.js
window.JAGCODE_DASHBOARD_CONFIG = {
  appwrite: {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID',
    databaseId: 'YOUR_DATABASE_ID',
    functionsEndpoint: 'https://cloud.appwrite.io/v1/projects/YOUR_PROJECT_ID/functions'
  },
  apis: {
    // Your external API configurations remain the same
    coingecko: { baseUrl: 'https://api.coingecko.com/api/v3', key: null },
    // ... other APIs
  }
};

// Initialize dashboard
const config = new JagCodeDashboardConfig();
config.init(window.JAGCODE_DASHBOARD_CONFIG).then(() => {
  console.log('Dashboard ready with Appwrite Functions!');
});
```

## Troubleshooting

### Common Issues:

1. **Function timeout errors**:
   - Increase timeout in function settings
   - Optimize code for better performance

2. **CORS errors**:
   - Add your domain to Appwrite CORS settings
   - Check function response headers

3. **Authentication errors**:
   - Verify API keys are correct
   - Check user permissions for collections

4. **Network errors**:
   - Verify function URLs are correct
   - Check if functions are deployed and active

### Debug Mode:

Enable debug mode in your dashboard:

```javascript
const config = new JagCodeDashboardConfig();
config.set('debug', true);
```

This will provide detailed logging for troubleshooting.

## Next Steps

1. Deploy your functions one by one
2. Test each feature thoroughly
3. Set up monitoring and alerts
4. Consider implementing rate limiting
5. Add error handling and retry logic
6. Set up automated deployments

Your crypto dashboard is now ready to run entirely on Appwrite's managed infrastructure without needing a separate backend server!
