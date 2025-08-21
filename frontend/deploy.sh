#!/bin/bash

# 🚀 JagCodeDevOps Frontend Deployment Script

echo "🚀 Starting JagCodeDevOps Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the frontend directory${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo -e "${BLUE}📝 Creating .env file from example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual values${NC}"
    echo -e "${BLUE}📝 Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID${NC}"
    read -p "Press Enter after editing .env file..."
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to install dependencies${NC}"
    exit 1
fi

# Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Check build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Build output directory 'dist' not found${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Build output created in 'dist' directory${NC}"
echo -e "${BLUE}📊 Build size: $(du -sh dist | cut -f1)${NC}"

# Deployment options
echo -e "${YELLOW}🌐 Choose deployment option:${NC}"
echo "1) Deploy to Appwrite Hosting (Recommended)"
echo "2) Deploy to Vercel"
echo "3) Deploy to Netlify"
echo "4) Prepare for Webflow"
echo "5) Just build (no deployment)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Deploying to Appwrite Hosting...${NC}"
        echo -e "${YELLOW}📝 Instructions:${NC}"
        echo "1. Go to Appwrite Console → Your Project → Hosting"
        echo "2. Create new hosting → Choose 'Static Site'"
        echo "3. Upload contents of 'dist' folder"
        echo "4. Set custom domain (optional)"
        echo ""
        echo -e "${GREEN}✅ Your build is ready in the 'dist' folder${NC}"
        echo -e "${BLUE}📁 Upload the contents of 'dist' to Appwrite Hosting${NC}"
        ;;
    2)
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi
        vercel --prod
        ;;
    3)
        echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Netlify CLI...${NC}"
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    4)
        echo -e "${BLUE}🎨 Preparing for Webflow...${NC}"
        echo -e "${YELLOW}📝 Instructions:${NC}"
        echo "1. Go to Webflow Designer → Pages"
        echo "2. Import HTML → Upload contents of 'dist' folder"
        echo "3. Customize in Webflow Designer"
        echo ""
        echo -e "${GREEN}✅ Your build is ready in the 'dist' folder${NC}"
        echo -e "${BLUE}📁 Upload the contents of 'dist' to Webflow${NC}"
        ;;
    5)
        echo -e "${GREEN}✅ Build completed. No deployment selected.${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${BLUE}📚 Check DEPLOYMENT.md for detailed instructions${NC}"
echo -e "${BLUE}🔗 Your app should be live at the deployment URL${NC}"
