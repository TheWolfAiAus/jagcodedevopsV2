#!/bin/bash

# 🚀 JagCodeDevOps Appwrite Deployment Script

echo "🚀 Starting JagCodeDevOps Appwrite Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Appwrite CLI...${NC}"
    npm install -g appwrite-cli
fi

# Login to Appwrite (if not already logged in)
echo -e "${BLUE}🔐 Checking Appwrite authentication...${NC}"
appwrite account get 2>/dev/null || {
    echo -e "${YELLOW}🔑 Please login to Appwrite:${NC}"
    appwrite login
}

# Initialize Appwrite project (if not already initialized)
if [ ! -f "appwrite.json" ]; then
    echo -e "${BLUE}🏗️  Initializing Appwrite project...${NC}"
    appwrite init project
else
    echo -e "${GREEN}✅ Appwrite project already initialized${NC}"
fi

# Deploy Functions
echo -e "${BLUE}🔧 Deploying Appwrite Functions...${NC}"

# Build backend before deploying
echo -e "${BLUE}🔨 Building backend...${NC}"
cd backend
npm install
npm run build
cd ..

# Deploy backend function
echo -e "${BLUE}🚀 Deploying backend function...${NC}"
cd functions
appwrite functions create \
    --functionId backend-api \
    --name "Backend API" \
    --runtime node-18.0 \
    --execute any \
    --timeout 30 \
    --enabled true \
    --logging true \
    --entrypoint "src/index.js" \
    --commands "npm install && npm run build"

# Deploy function code
appwrite functions createDeployment \
    --functionId backend-api \
    --entrypoint "src/index.js" \
    --code . \
    --activate true

cd ..

# Deploy crypto tracker function
echo -e "${BLUE}🪙 Deploying crypto tracker function...${NC}"
cd crypto-tracker
appwrite functions create \
    --functionId crypto-tracker \
    --name "Crypto Tracker" \
    --runtime python-3.9 \
    --execute any \
    --timeout 60 \
    --enabled true \
    --logging true \
    --entrypoint "main.py" \
    --commands "pip install -r requirements.txt"

appwrite functions createDeployment \
    --functionId crypto-tracker \
    --entrypoint "main.py" \
    --code . \
    --activate true

cd ..

# Deploy DeFi analyzer function
echo -e "${BLUE}📊 Deploying DeFi analyzer function...${NC}"
cd defi-analyzer
appwrite functions create \
    --functionId defi-analyzer \
    --name "DeFi Analyzer" \
    --runtime python-3.9 \
    --execute any \
    --timeout 60 \
    --enabled true \
    --logging true \
    --entrypoint "main.py" \
    --commands "pip install -r requirements.txt"

appwrite functions createDeployment \
    --functionId defi-analyzer \
    --entrypoint "main.py" \
    --code . \
    --activate true

cd ..

# Deploy Database Schema
echo -e "${BLUE}🗄️  Setting up database...${NC}"
appwrite databases create \
    --databaseId jagcode_main \
    --name "JagCode Main Database"

# Create collections
echo -e "${BLUE}📚 Creating collections...${NC}"

# Users collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId users \
    --name "Users" \
    --permissions read\(\"any\"\) write\(\"users\"\) \
    --enabled true

# Add user attributes
appwrite databases createStringAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key email \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key name \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key profileImage \
    --size 2048 \
    --required false

appwrite databases createStringAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key bio \
    --size 1000 \
    --required false

appwrite databases createFloatAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key portfolioValue \
    --required false

appwrite databases createBooleanAttribute \
    --databaseId jagcode_main \
    --collectionId users \
    --key isVerified \
    --required false

# Crypto data collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId crypto_data \
    --name "Crypto Data" \
    --permissions read\(\"any\"\) write\(\"users\"\) \
    --enabled true

# NFT collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId nft_collection \
    --name "NFT Collection" \
    --permissions read\(\"any\"\) write\(\"users\"\) \
    --enabled true

# User portfolios collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId user_portfolios \
    --name "User Portfolios" \
    --permissions read\(\"users\"\) write\(\"users\"\) \
    --enabled true

# Create Storage Buckets
echo -e "${BLUE}📁 Creating storage buckets...${NC}"

appwrite storage createBucket \
    --bucketId profile_images \
    --name "Profile Images" \
    --permissions read\(\"any\"\) write\(\"users\"\) \
    --fileSecurity true \
    --enabled true \
    --maximumFileSize 5242880 \
    --allowedFileExtensions jpg,jpeg,png,gif \
    --compression gzip \
    --encryption true \
    --antivirus true

appwrite storage createBucket \
    --bucketId nft_images \
    --name "NFT Images" \
    --permissions read\(\"any\"\) write\(\"users\"\) \
    --fileSecurity true \
    --enabled true \
    --maximumFileSize 10485760 \
    --allowedFileExtensions jpg,jpeg,png,gif,webp \
    --compression gzip \
    --encryption true \
    --antivirus true

# Deploy Frontend to Appwrite Hosting
echo -e "${BLUE}🌐 Deploying frontend to Appwrite Hosting...${NC}"
cd frontend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env file...${NC}"
    cat > .env << EOF
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
VITE_API_URL=https://cloud.appwrite.io/v1/functions/backend-api/executions
EOF
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm install
npm run build

# Deploy to Appwrite Hosting
echo -e "${BLUE}🚀 Deploying to Appwrite Hosting...${NC}"
echo -e "${YELLOW}📝 Please follow these steps:${NC}"
echo "1. Go to Appwrite Console → Your Project → Hosting"
echo "2. Create new hosting → Choose 'Static Site'"
echo "3. Upload contents of 'frontend/dist' folder"
echo "4. Set custom domain (optional)"

cd ..

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${BLUE}📚 Your app functions are deployed to Appwrite${NC}"
echo -e "${BLUE}🌐 Upload frontend/dist to Appwrite Hosting to complete deployment${NC}"
echo -e "${YELLOW}⚙️  Don't forget to configure environment variables in Appwrite Console${NC}"
echo ""
echo -e "${GREEN}✅ Next steps:${NC}"
echo "1. Upload frontend build to Appwrite Hosting"
echo "2. Configure custom domain (optional)"
echo "3. Set up environment variables in functions"
echo "4. Test all endpoints and functionality"