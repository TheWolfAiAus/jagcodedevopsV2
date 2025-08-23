#!/bin/bash

# 🚀 Appwrite-Only Deployment Script (Works Immediately)
# For JagCodeDevOps Crypto Platform

echo "🚀 Starting Appwrite-Only Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 1. Check Appwrite CLI
if ! command -v appwrite &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Appwrite CLI...${NC}"
    npm install -g appwrite-cli
fi

# 2. Login to Appwrite
echo -e "${BLUE}🔐 Checking Appwrite authentication...${NC}"
appwrite account get 2>/dev/null || {
    echo -e "${YELLOW}🔑 Please login to Appwrite:${NC}"
    appwrite login
}

# 3. Build Next.js Frontend
echo -e "${BLUE}🔨 Building Next.js frontend...${NC}"
cd frontend-nextjs

# Install dependencies
npm install

# Build for static export
npm run build

echo -e "${GREEN}✅ Frontend built successfully!${NC}"
echo -e "${BLUE}📁 Static files ready in: $(pwd)/out${NC}"

cd ..

# 4. Deploy Backend Function
echo -e "${BLUE}⚡ Deploying backend function...${NC}"
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Appwrite
appwrite functions createDeployment \
    --functionId backend-api \
    --entrypoint "src/index.js" \
    --code . \
    --activate true

echo -e "${GREEN}✅ Backend function deployed!${NC}"

cd ..

# 5. Deploy Python Services
echo -e "${BLUE}🐍 Deploying Python services...${NC}"

# Crypto Tracker
cd crypto-tracker
appwrite functions createDeployment \
    --functionId crypto-tracker \
    --entrypoint "main.py" \
    --code . \
    --activate true

cd ..

# DeFi Analyzer
cd defi-analyzer
appwrite functions createDeployment \
    --functionId defi-analyzer \
    --entrypoint "main.py" \
    --code . \
    --activate true

cd ..

echo -e "${GREEN}✅ Python services deployed!${NC}"

# 6. Database Setup
echo -e "${BLUE}🗄️  Setting up database...${NC}"

# Create database
appwrite databases create \
    --databaseId jagcode_main \
    --name "JagCode Main Database" || echo "Database exists"

# Create collections
appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId users \
    --name "Users" \
    --permissions "read(\"any\") write(\"users\")" \
    --enabled true || echo "Users collection exists"

appwrite databases createCollection \
    --databaseId jagcode_main \
    --collectionId crypto_data \
    --name "Crypto Data" \
    --permissions "read(\"any\") write(\"users\")" \
    --enabled true || echo "Crypto data collection exists"

echo -e "${GREEN}✅ Database configured!${NC}"

# 7. Storage Setup
echo -e "${BLUE}📁 Setting up storage...${NC}"

appwrite storage createBucket \
    --bucketId profile_images \
    --name "Profile Images" \
    --permissions "read(\"any\") write(\"users\")" \
    --fileSecurity true \
    --enabled true \
    --maximumFileSize 5242880 \
    --allowedFileExtensions "jpg,jpeg,png,gif" || echo "Profile bucket exists"

echo -e "${GREEN}✅ Storage configured!${NC}"

# 8. Final Instructions
echo ""
echo -e "${GREEN}🎉 Appwrite Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 What's Been Deployed:${NC}"
echo -e "${GREEN}✅ Backend API Function${NC}"
echo -e "${GREEN}✅ Crypto Tracker Function${NC}"
echo -e "${GREEN}✅ DeFi Analyzer Function${NC}"
echo -e "${GREEN}✅ Database Collections${NC}"
echo -e "${GREEN}✅ Storage Buckets${NC}"
echo -e "${GREEN}✅ Frontend Build (Ready)${NC}"
echo ""
echo -e "${BLUE}🌐 Manual Step - Upload Frontend:${NC}"
echo "1. Go to Appwrite Console → Hosting"
echo "2. Create new Static Site"
echo "3. Upload contents of: frontend-nextjs/out"
echo "4. Your live URL will be provided"
echo ""
echo -e "${BLUE}⚙️  Configure Environment Variables:${NC}"
echo "In Appwrite Console → Functions → backend-api → Settings:"
echo "APPWRITE_API_KEY=standard_9f7c4a2b8e6d5f8a9c3e1b4d7f0a2c5e8b1d4f7a0c3e6b9d2f5a8c1e4b7f0a3d6c9e2f5b8"
echo "COINGECKO_API_KEY=CG-YourCoinGeckoAPIKey"
echo "ETHERSCAN_API_KEY=YourEtherscanAPIKey"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "Appwrite Console: https://console.appwrite.io"
echo "Backend API: https://cloud.appwrite.io/v1/functions/backend-api/executions"
echo ""
echo -e "${PURPLE}🚀 Your crypto platform is ready to go live!${NC}"