# JagCodeDevOps Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables:**
   Set these in Vercel dashboard:
   - `APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057`  
   - `APPWRITE_DATABASE_ID=68a3b34a00375e270b14`
   - `APPWRITE_API_KEY=your-api-key`
   - `JWT_SECRET=your-jwt-secret`

### Option 2: Deploy to Appwrite Functions

1. **Install Appwrite CLI:**
   ```bash
   npm install -g appwrite-cli
   appwrite login
   ```

2. **Deploy Functions:**
   ```bash
   appwrite deploy
   ```

## 🏗️ Build Commands

### Production Build
```bash
# Build everything
npm run build

# Build specific parts
npm run build:backend
npm run build:frontend
npm run build:functions
```

### Development
```bash
# Start development servers
npm run dev

# Install all dependencies
npm run install:all
```

## 📦 Project Structure

```
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite frontend  
├── functions/        # Appwrite serverless functions
├── mobile/           # React Native app
├── sdk/              # SDK files
├── config/           # Configuration files
├── vercel.json       # Vercel deployment config
├── appwrite.json     # Appwrite deployment config
└── Dockerfile        # Docker container config
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `appwrite.json` - Appwrite functions and database schema
- `Dockerfile` - Docker container configuration
- `.env.production` - Production environment variables

## 🌐 Live URLs

After deployment, your app will be available at:
- **Vercel**: `https://your-project.vercel.app`
- **Appwrite**: Functions accessible via Appwrite dashboard

## 🔑 Required Environment Variables

### Backend
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID` 
- `APPWRITE_DATABASE_ID`
- `APPWRITE_API_KEY`
- `JWT_SECRET`

### Frontend
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`

## 💡 Deployment Tips

1. **Vercel** - Best for full-stack apps with API routes
2. **Appwrite** - Best for serverless functions and database
3. **Docker** - Best for custom hosting solutions

## 🔍 Troubleshooting

- Ensure all environment variables are set
- Check build logs for any missing dependencies
- Verify Appwrite database collections exist
- Test API endpoints after deployment