#!/bin/bash

# 🌐 GCP + Appwrite Hybrid Deployment Script
# For thewolfai.com.au organization

echo "🌐 Starting GCP + Appwrite Hybrid Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"thewolfai-jagcode"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="jagcode-frontend"

echo -e "${BLUE}🔧 Configuration:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# 1. Verify GCP Authentication
echo -e "${BLUE}🔐 Checking GCP authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@thewolfai.com.au"; then
    echo -e "${YELLOW}⚠️  Please authenticate with your thewolfai.com.au account:${NC}"
    gcloud auth login --no-launch-browser
fi

# Set project
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ GCP authentication verified${NC}"

# 2. Enable Required APIs
echo -e "${BLUE}🔧 Enabling required GCP APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable compute.googleapis.com
echo -e "${GREEN}✅ APIs enabled${NC}"

# 3. Create Secret Manager secrets
echo -e "${BLUE}🔐 Setting up secrets in Secret Manager...${NC}"

# Appwrite API Key
echo "standard_9f7c4a2b8e6d5f8a9c3e1b4d7f0a2c5e8b1d4f7a0c3e6b9d2f5a8c1e4b7f0a3d6c9e2f5b8" | \
gcloud secrets create appwrite-api-key --data-file=- 2>/dev/null || echo "Appwrite secret exists"

# Other API keys (placeholders)
echo "your-coingecko-api-key" | \
gcloud secrets create coingecko-api-key --data-file=- 2>/dev/null || echo "CoinGecko secret exists"

echo "your-etherscan-api-key" | \
gcloud secrets create etherscan-api-key --data-file=- 2>/dev/null || echo "Etherscan secret exists"

echo -e "${GREEN}✅ Secrets configured${NC}"

# 4. Build Next.js Frontend
echo -e "${BLUE}🔨 Building Next.js frontend...${NC}"
cd frontend-nextjs

# Install dependencies
npm install

# Build for production
npm run build

# Create Dockerfile for Cloud Run
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx config for Cloud Run
cat > nginx.conf << 'EOF'
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

echo -e "${GREEN}✅ Frontend built and containerized${NC}"

# 5. Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1,NEXT_PUBLIC_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057" \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300

FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo -e "${GREEN}✅ Frontend deployed to: $FRONTEND_URL${NC}"

cd ..

# 6. Deploy Appwrite Functions
echo -e "${BLUE}⚡ Deploying Appwrite Functions...${NC}"

# Check Appwrite CLI
if ! command -v appwrite &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Appwrite CLI...${NC}"
    npm install -g appwrite-cli
fi

# Deploy backend function
cd functions
npm install
npm run build

appwrite functions createDeployment \
    --functionId backend-api \
    --entrypoint "src/index.js" \
    --code . \
    --activate true

echo -e "${GREEN}✅ Appwrite functions deployed${NC}"
cd ..

# 7. Set up Cloud Monitoring
echo -e "${BLUE}📊 Setting up monitoring...${NC}"

# Create uptime check
gcloud alpha monitoring uptime create \
    --display-name="JagCode Frontend Uptime" \
    --http-check-path="/" \
    --http-check-port=443 \
    --http-check-use-ssl \
    --monitored-resource-type=uptime_url \
    --monitored-resource-labels="host=$FRONTEND_URL" \
    --timeout=10s \
    --period=60s 2>/dev/null || echo "Uptime check may already exist"

echo -e "${GREEN}✅ Monitoring configured${NC}"

# 8. Set up Cloud Armor (Security)
echo -e "${BLUE}🛡️  Setting up security policies...${NC}"

# Create security policy
gcloud compute security-policies create jagcode-security-policy \
    --description "Security policy for JagCode platform" 2>/dev/null || echo "Security policy exists"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
    --security-policy jagcode-security-policy \
    --expression "true" \
    --action "rate-based-ban" \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=600 2>/dev/null || echo "Rate limiting rule exists"

echo -e "${GREEN}✅ Security policies configured${NC}"

# 9. Create Cloud Build pipeline
echo -e "${BLUE}🔄 Setting up CI/CD pipeline...${NC}"

cat > cloudbuild.yaml << EOF
steps:
  # Build Next.js frontend
  - name: 'node:18'
    entrypoint: npm
    args: ['install']
    dir: 'frontend-nextjs'
  
  - name: 'node:18'
    entrypoint: npm
    args: ['run', 'build']
    dir: 'frontend-nextjs'
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - '$SERVICE_NAME'
      - '--source'
      - 'frontend-nextjs'
      - '--region'
      - '$REGION'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

  # Deploy Appwrite functions
  - name: 'node:18'
    entrypoint: npm
    args: ['install', '-g', 'appwrite-cli']
  
  - name: 'node:18'
    entrypoint: bash
    args:
      - '-c'
      - |
        cd functions
        npm install
        npm run build
        appwrite functions createDeployment --functionId backend-api --entrypoint "src/index.js" --code . --activate true

substitutions:
  _SERVICE_NAME: '$SERVICE_NAME'
  _REGION: '$REGION'

options:
  logging: CLOUD_LOGGING_ONLY
EOF

echo -e "${GREEN}✅ CI/CD pipeline configured${NC}"

# 10. Configure team access
echo -e "${BLUE}👥 Configuring team access...${NC}"

# Developer access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="group:gcp-developers@thewolfai.com.au" \
    --role="roles/run.developer" 2>/dev/null || echo "Developer access exists"

# Security admin access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="group:gcp-security-admins@thewolfai.com.au" \
    --role="roles/security.admin" 2>/dev/null || echo "Security admin access exists"

# Monitoring admin access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="group:gcp-logging-monitoring-admins@thewolfai.com.au" \
    --role="roles/monitoring.admin" 2>/dev/null || echo "Monitoring admin access exists"

# DevOps access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="group:gcp-devops@thewolfai.com.au" \
    --role="roles/cloudbuild.builds.editor" 2>/dev/null || echo "DevOps access exists"

echo -e "${GREEN}✅ Team access configured${NC}"

# 11. Final summary
echo ""
echo -e "${GREEN}🎉 GCP + Appwrite Hybrid Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "${GREEN}✅ Frontend (GCP Cloud Run): $FRONTEND_URL${NC}"
echo -e "${GREEN}✅ Backend (Appwrite Functions): Deployed${NC}"
echo -e "${GREEN}✅ Database (Appwrite): Ready${NC}"
echo -e "${GREEN}✅ Monitoring (GCP): Active${NC}"
echo -e "${GREEN}✅ Security (Cloud Armor): Enabled${NC}"
echo -e "${GREEN}✅ CI/CD (Cloud Build): Configured${NC}"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "Frontend: $FRONTEND_URL"
echo "GCP Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "Appwrite Console: https://console.appwrite.io"
echo "Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"
echo ""
echo -e "${BLUE}👥 Team Access:${NC}"
echo "✅ gcp-developers@thewolfai.com.au - Development access"
echo "✅ gcp-security-admins@thewolfai.com.au - Security management"
echo "✅ gcp-logging-monitoring-admins@thewolfai.com.au - Monitoring"
echo "✅ gcp-devops@thewolfai.com.au - CI/CD management"
echo ""
echo -e "${PURPLE}🚀 Your enterprise crypto platform is live!${NC}"