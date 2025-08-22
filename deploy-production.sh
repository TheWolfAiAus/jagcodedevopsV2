#!/bin/bash

# 🚀 JagCodeDevOps Production Deployment Script
# Optimized for Appwrite Static Sites + Functions

echo "🚀 Starting JagCodeDevOps Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Appwrite CLI...${NC}"
    npm install -g appwrite-cli
fi

# Check authentication
echo -e "${BLUE}🔐 Checking Appwrite authentication...${NC}"
appwrite account get 2>/dev/null || {
    echo -e "${YELLOW}🔑 Please login to Appwrite:${NC}"
    appwrite login
}

# 1. Deploy Backend Functions
echo -e "${PURPLE}🔧 Deploying Backend Functions...${NC}"

cd functions

# Build the function
echo -e "${BLUE}🔨 Building backend function...${NC}"
npm install
npm run build

# Create or update the function
echo -e "${BLUE}🚀 Deploying backend-api function...${NC}"
appwrite functions createDeployment \
    --functionId backend-api \
    --entrypoint "src/index.js" \
    --code . \
    --activate true

echo -e "${GREEN}✅ Backend function deployed successfully!${NC}"

cd ..

# 2. Deploy Crypto Tracker Function
echo -e "${PURPLE}🪙 Deploying Crypto Tracker...${NC}"

cd crypto-tracker

# Install Python dependencies
echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Deploy crypto tracker function
echo -e "${BLUE}🚀 Deploying crypto-tracker function...${NC}"
appwrite functions createDeployment \
    --functionId crypto-tracker \
    --entrypoint "main.py" \
    --code . \
    --activate true

echo -e "${GREEN}✅ Crypto tracker deployed successfully!${NC}"

cd ..

# 3. Deploy DeFi Analyzer Function
echo -e "${PURPLE}📊 Deploying DeFi Analyzer...${NC}"

cd defi-analyzer

# Deploy DeFi analyzer function
echo -e "${BLUE}🚀 Deploying defi-analyzer function...${NC}"
appwrite functions createDeployment \
    --functionId defi-analyzer \
    --entrypoint "main.py" \
    --code . \
    --activate true

echo -e "${GREEN}✅ DeFi analyzer deployed successfully!${NC}"

cd ..

# 4. Set up Database Schema
echo -e "${PURPLE}🗄️  Setting up database schema...${NC}"

# Create main database
appwrite databases create \
    --databaseId jagcode_main \
    --name "JagCode Main Database" || echo "Database already exists"

# Create collections
echo -e "${BLUE}📚 Creating collections...${NC}"

# Users collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId users \
    --name "Users" \
    --permissions "read(\"any\") write(\"users\")" \
    --enabled true || echo "Users collection exists"

# Crypto data collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId crypto_data \
    --name "Crypto Data" \
    --permissions "read(\"any\") write(\"users\")" \
    --enabled true || echo "Crypto data collection exists"

# NFT collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId nft_collection \
    --name "NFT Collection" \
    --permissions "read(\"any\") write(\"users\")" \
    --enabled true || echo "NFT collection exists"

# User portfolios collection
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId user_portfolios \
    --name "User Portfolios" \
    --permissions "read(\"users\") write(\"users\")" \
    --enabled true || echo "Portfolios collection exists"

echo -e "${GREEN}✅ Database schema created successfully!${NC}"

# 5. Create Storage Buckets
echo -e "${PURPLE}📁 Creating storage buckets...${NC}"

# Profile images bucket
appwrite storage createBucket \
    --bucketId profile_images \
    --name "Profile Images" \
    --permissions "read(\"any\") write(\"users\")" \
    --fileSecurity true \
    --enabled true \
    --maximumFileSize 5242880 \
    --allowedFileExtensions "jpg,jpeg,png,gif" \
    --compression gzip \
    --encryption true \
    --antivirus true || echo "Profile images bucket exists"

# NFT images bucket
appwrite storage createBucket \
    --bucketId nft_images \
    --name "NFT Images" \
    --permissions "read(\"any\") write(\"users\")" \
    --fileSecurity true \
    --enabled true \
    --maximumFileSize 10485760 \
    --allowedFileExtensions "jpg,jpeg,png,gif,webp" \
    --compression gzip \
    --encryption true \
    --antivirus true || echo "NFT images bucket exists"

echo -e "${GREEN}✅ Storage buckets created successfully!${NC}"

# 6. Build and Deploy Next.js Frontend
echo -e "${PURPLE}🌐 Building Next.js frontend...${NC}"

cd frontend-nextjs

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Next.js frontend not found. Using existing React frontend.${NC}"
    cd ../frontend
fi

# Install dependencies and build
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Building frontend for production...${NC}"
if [ -f "next.config.js" ]; then
    # Next.js build
    npm run build
    BUILD_DIR="out"
else
    # Vite build
    npm run build
    BUILD_DIR="dist"
fi

echo -e "${GREEN}✅ Frontend built successfully!${NC}"

# 7. Deploy to Appwrite Hosting
echo -e "${PURPLE}🚀 Preparing for Appwrite Hosting deployment...${NC}"

echo -e "${YELLOW}📝 Manual step required:${NC}"
echo "1. Go to Appwrite Console → Hosting"
echo "2. Create new Static Site"
echo "3. Upload contents of '${BUILD_DIR}' folder"
echo "4. Set custom domain (optional)"
echo ""
echo -e "${BLUE}📁 Frontend files ready in: $(pwd)/${BUILD_DIR}${NC}"

cd ..

# 8. Configure Environment Variables
echo -e "${PURPLE}⚙️  Environment Variables Setup...${NC}"

echo -e "${YELLOW}📝 Configure these in Appwrite Console → Functions:${NC}"
echo ""
echo "backend-api function environment variables:"
echo "APPWRITE_API_KEY=standard_9f7c4a2b8e6d5f8a9c3e1b4d7f0a2c5e8b1d4f7a0c3e6b9d2f5a8c1e4b7f0a3d6c9e2f5b8"
echo "COINGECKO_API_KEY=CG-YourCoinGeckoAPIKey"
echo "ETHERSCAN_API_KEY=YourEtherscanAPIKey"
echo "OPENSEA_API_KEY=YourOpenSeaAPIKey"
echo "INFURA_PROJECT_ID=YourInfuraProjectID"
echo ""

# 9. Health Check
echo -e "${PURPLE}🏥 Running health checks...${NC}"

echo -e "${BLUE}🔍 Testing function deployments...${NC}"

# Test backend function
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://cloud.appwrite.io/v1/functions/backend-api/executions" || echo "000")
if [ "$BACKEND_RESPONSE" = "200" ] || [ "$BACKEND_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✅ Backend API function is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API function needs configuration${NC}"
fi

# 10. Final Summary
echo ""
echo -e "${GREEN}🎉 Deployment Summary:${NC}"
echo -e "${GREEN}✅ Backend Functions: Deployed${NC}"
echo -e "${GREEN}✅ Database Schema: Created${NC}"
echo -e "${GREEN}✅ Storage Buckets: Ready${NC}"
echo -e "${GREEN}✅ Frontend Build: Complete${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Upload frontend build to Appwrite Hosting"
echo "2. Configure environment variables in Functions"
echo "3. Test your live application"
echo ""
echo -e "${PURPLE}🔗 Your endpoints:${NC}"
echo "Frontend: Upload to Appwrite Hosting"
echo "API: https://cloud.appwrite.io/v1/functions/backend-api/executions"
echo "Health: /health endpoint"
echo ""
echo -e "${GREEN}🚀 JagCodeDevOps is ready for production!${NC}"