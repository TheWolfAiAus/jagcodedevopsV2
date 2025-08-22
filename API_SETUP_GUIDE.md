# 🔑 API Keys and Secrets Setup Guide

## Required API Keys for Full Functionality

### 🏗️ Core Infrastructure

**Appwrite (Required)**
- Project ID: `68a36f6c002bfc1e6057` (already configured)
- Server API Key: Get from Appwrite Console → Settings → API Keys
- Database ID: `jagcode_main`

### ⛓️ Blockchain APIs

**Etherscan (Required for Ethereum)**
```
Sign up: https://etherscan.io/apis
Free tier: 100,000 calls/day
API Key format: ETHERSCAN_API_KEY=YourEtherscanAPIKey
```

**Infura (Required for Web3)**
```
Sign up: https://infura.io/
Free tier: 100,000 requests/day
Project ID: INFURA_PROJECT_ID=YourInfuraProjectID
Project Secret: INFURA_PROJECT_SECRET=YourInfuraProjectSecret
```

**Alchemy (Alternative to Infura)**
```
Sign up: https://alchemy.com/
Free tier: 300M compute units/month
API Key: ALCHEMY_API_KEY=YourAlchemyAPIKey
```

### 💰 Cryptocurrency Data

**CoinGecko (Required for Price Data)**
```
Sign up: https://www.coingecko.com/en/api
Free tier: 30 calls/minute
API Key: COINGECKO_API_KEY=CG-YourCoinGeckoAPIKey
```

**CoinMarketCap (Alternative)**
```
Sign up: https://coinmarketcap.com/api/
Free tier: 10,000 calls/month
API Key: COINMARKETCAP_API_KEY=YourCoinMarketCapAPIKey
```

### 🖼️ NFT Marketplace APIs

**OpenSea (Required for NFT Data)**
```
Sign up: https://docs.opensea.io/reference/api-overview
Free tier: Rate limited
API Key: OPENSEA_API_KEY=YourOpenSeaAPIKey
```

**Reservoir (Advanced NFT Analytics)**
```
Sign up: https://reservoir.tools/
Free tier: 100,000 requests/month
API Key: RESERVOIR_API_KEY=YourReservoirAPIKey
```

### 🔄 DeFi Protocol Integration

**The Graph (Subgraph Queries)**
```
Free to use for public subgraphs
Uniswap V3: https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3
Already configured in environment
```

**Moralis (Web3 Data)**
```
Sign up: https://moralis.io/
Free tier: 40,000 requests/month
API Key: MORALIS_API_KEY=YourMoralisAPIKey
```

### 💳 Payment Processing

**Stripe (Required for Payments)**
```
Sign up: https://stripe.com/
Test keys for development
Live keys for production
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey
```

### 🤖 AI Integration

**OpenAI (For AI Features)**
```
Sign up: https://platform.openai.com/
Pay-per-use pricing
API Key: OPENAI_API_KEY=sk-YourOpenAIAPIKey
```

### 📧 Communication

**SendGrid (Email Service)**
```
Sign up: https://sendgrid.com/
Free tier: 100 emails/day
API Key: SENDGRID_API_KEY=SG.YourSendGridAPIKey
```

**Discord (Bot Integration)**
```
Create bot: https://discord.com/developers/applications
Bot Token: DISCORD_BOT_TOKEN=YourDiscordBotToken
```

### 📊 Analytics

**Google Analytics 4**
```
Setup: https://analytics.google.com/
Measurement ID: GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**Sentry (Error Monitoring)**
```
Sign up: https://sentry.io/
Free tier: 5,000 errors/month
DSN: SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

## 🚀 Quick Setup Instructions

### 1. Priority APIs (Get These First)
1. **Appwrite** - Core backend
2. **CoinGecko** - Crypto prices
3. **Infura** - Ethereum access
4. **OpenSea** - NFT data

### 2. Environment Configuration

**For Development:**
```bash
cp .env.production .env.local
# Edit .env.local with your API keys
```

**For Appwrite Functions:**
Set environment variables in Appwrite Console:
1. Go to Functions → backend-api → Settings
2. Add each environment variable
3. Redeploy function

### 3. Validation Script

Create a validation endpoint to test all APIs:
```bash
curl https://your-appwrite-function-url/api/validate-keys
```

## 🔒 Security Best Practices

### API Key Storage
- ✅ Use Appwrite Function environment variables
- ✅ Never commit keys to code
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly

### Access Restrictions
- ✅ Restrict API keys by domain/IP when possible
- ✅ Use minimum required permissions
- ✅ Monitor API usage and set alerts

## 💡 Cost Optimization

### Free Tier Limits
- **CoinGecko**: 30 calls/minute (sufficient for most use)
- **Infura**: 100k requests/day (good for medium traffic)
- **OpenSea**: Rate limited but free
- **Etherscan**: 100k calls/day

### Caching Strategy
- Cache crypto prices for 1-5 minutes
- Cache NFT metadata for 1 hour
- Cache blockchain data for 10 minutes
- Use Appwrite Database as cache layer

## 🧪 Testing Configuration

### API Health Check Endpoints
```
GET /api/health/crypto     - Test CoinGecko
GET /api/health/blockchain - Test Infura/Alchemy
GET /api/health/nft        - Test OpenSea
GET /api/health/all        - Test all APIs
```

### Local Development
```bash
npm run dev
# Visit http://localhost:3000/api/health/all
```

## 📞 Support Contacts

- **Appwrite**: Discord community
- **CoinGecko**: api@coingecko.com
- **Infura**: support@infura.io
- **OpenSea**: developer-support@opensea.io

## 🎯 Recommended Starting Configuration

For immediate deployment, get these 4 keys:
1. **Appwrite API Key** (from console)
2. **CoinGecko API Key** (free, instant)
3. **Infura Project ID** (free, instant)
4. **OpenSea API Key** (free, may require approval)

This will enable 80% of the application functionality.