# 🚀 JagCodeDevOps Deployment Guide

## Quick Start

### Option 1: Full Appwrite Deployment (Recommended)
```bash
# Deploy everything to Appwrite
npm run deploy:all
```

### Option 2: Windows Users
```batch
# Run the Windows deployment script
npm run deploy:appwrite:win
```

### Option 3: Frontend Only
```bash
# Deploy just the frontend
npm run deploy:frontend
```

## Prerequisites

### 1. Install Appwrite CLI
```bash
npm install -g appwrite-cli
```

### 2. Login to Appwrite
```bash
appwrite login
```

### 3. Environment Setup
Create environment files with your Appwrite credentials:

**Backend (.env)**
```env
NODE_ENV=production
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
APPWRITE_API_KEY=your-api-key
```

**Frontend (.env)**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
VITE_API_URL=https://cloud.appwrite.io/v1/functions/backend-api/executions
```

## Deployment Architecture

### 🏗️ Infrastructure
- **Frontend**: Appwrite Hosting (Static Site)
- **Backend**: Appwrite Functions (Node.js)
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage Buckets
- **Crypto Services**: Appwrite Functions (Python)

### 📱 Services Deployed
1. **Frontend** → Appwrite Hosting
2. **Backend API** → Appwrite Function
3. **Crypto Tracker** → Appwrite Function  
4. **DeFi Analyzer** → Appwrite Function
5. **Database Collections** → Appwrite Database
6. **File Storage** → Appwrite Storage

## Manual Deployment Steps

### 1. Deploy Functions
```bash
# Backend API
cd functions
appwrite functions create \
  --functionId backend-api \
  --name "Backend API" \
  --runtime node-18.0 \
  --execute any
```

### 2. Deploy Database
```bash
# Create main database
appwrite databases create \
  --databaseId jagcode_main \
  --name "JagCode Main Database"
```

### 3. Deploy Storage
```bash
# Create storage buckets
appwrite storage createBucket \
  --bucketId profile_images \
  --name "Profile Images"
```

### 4. Deploy Frontend
```bash
cd frontend
npm run build
# Upload dist/ folder to Appwrite Hosting
```

## Environment Configuration

### Database Collections
- **users**: User profiles and authentication
- **crypto_data**: Cryptocurrency price data
- **nft_collection**: NFT marketplace data  
- **user_portfolios**: User investment portfolios

### Storage Buckets
- **profile_images**: User profile pictures (5MB limit)
- **nft_images**: NFT images (10MB limit)

### Function Environment Variables
Configure in Appwrite Console → Functions → Settings:

**Backend Function**
- `NODE_ENV=production`
- `APPWRITE_FUNCTION_ENDPOINT`
- `APPWRITE_FUNCTION_PROJECT_ID`

## Verification & Testing

### 1. Function Health Checks
```bash
# Test backend function
curl https://cloud.appwrite.io/v1/functions/backend-api/executions

# Test crypto tracker
curl https://cloud.appwrite.io/v1/functions/crypto-tracker/executions
```

### 2. Database Connectivity
- Verify collections are created
- Test read/write permissions
- Check indexes are active

### 3. Frontend Deployment
- Access your Appwrite Hosting URL
- Verify all pages load correctly
- Test API connectivity

## Custom Domain Setup

### 1. Appwrite Hosting Domain
1. Go to Appwrite Console → Hosting
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed

### 2. DNS Configuration
```
Type: CNAME
Name: app (or @)
Value: [your-appwrite-hosting-url]
```

## Monitoring & Logs

### Function Logs
- Appwrite Console → Functions → Logs
- Real-time function execution logs
- Error tracking and debugging

### Performance Monitoring
- Function execution times
- Database query performance
- Storage usage statistics

## Troubleshooting

### Common Issues

**Function Deployment Failed**
- Check Node.js/Python versions
- Verify all dependencies in package.json/requirements.txt
- Review function logs for errors

**Database Connection Issues**
- Verify project ID and API keys
- Check collection permissions
- Ensure database exists

**Frontend Build Errors**
- Update environment variables
- Check build dependencies
- Verify Vite configuration

**CORS Issues**
- Configure allowed origins in functions
- Update Appwrite CORS settings
- Check frontend API endpoints

### Debug Mode
Enable debug logging:
```env
VITE_ENABLE_DEBUG_MODE=true
```

## CI/CD Integration

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Appwrite
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install -g appwrite-cli
      - run: npm run deploy:all
```

## Cost Optimization

### Appwrite Pricing Considerations
- **Functions**: Based on execution time
- **Database**: Based on operations and storage
- **Storage**: Based on bandwidth and storage
- **Hosting**: Free tier available

### Optimization Tips
- Implement function caching
- Optimize database queries
- Use compression for images
- Monitor usage in Appwrite Console

## Support & Resources

- **Appwrite Documentation**: [docs.appwrite.io](https://docs.appwrite.io)
- **Community Support**: [discord.gg/appwrite](https://discord.gg/appwrite)
- **Function Examples**: Check `/functions` directory
- **API Reference**: Appwrite REST API docs

## Next Steps

1. ✅ Complete initial deployment
2. 🔧 Configure custom domain
3. 📊 Set up monitoring alerts
4. 🚀 Implement CI/CD pipeline
5. 📈 Monitor performance metrics

---

**Need Help?** Check the Appwrite Console logs or refer to the official documentation.