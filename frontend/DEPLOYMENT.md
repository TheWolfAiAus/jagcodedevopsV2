# 🚀 Frontend Deployment Guide

## **Option 1: Deploy to Appwrite Hosting (Recommended)**

### **Step 1: Build Your Frontend**
```bash
cd frontend
npm run build
```

### **Step 2: Set Up Appwrite Project**
1. **Go to [Appwrite Console](https://console.appwrite.io)**
2. **Select your project**: `68a36f6c002bfc1e6057`
3. **Go to Hosting section**

### **Step 3: Create Hosting**
1. **Click "Create Hosting"**
2. **Choose "Static Site"**
3. **Upload your build folder** (`frontend/dist` contents)
4. **Set custom domain** (optional)

### **Step 4: Configure Environment**
Create `.env` file in frontend root:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
VITE_API_URL=https://your-backend-domain.com
```

## **Option 2: Deploy to Vercel (Professional)**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Deploy**
```bash
cd frontend
vercel
```

### **Step 3: Configure Environment Variables**
In Vercel dashboard:
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_API_URL`

## **Option 3: Deploy to Netlify**

### **Step 1: Install Netlify CLI**
```bash
npm i -g netlify-cli
```

### **Step 2: Deploy**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## **Option 4: Deploy to Webflow**

### **Step 1: Build Static Files**
```bash
cd frontend
npm run build
```

### **Step 2: Import to Webflow**
1. **Webflow Designer** → Pages
2. **Import HTML** → Upload your built files
3. **Customize in Webflow Designer**

## **Environment Variables Setup**

### **Required Variables**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
VITE_API_URL=https://your-backend-domain.com
```

### **Optional Variables**
```env
VITE_APP_NAME=JagCodeDevOps
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
```

## **Appwrite Database Setup**

### **Create Database**
1. **Databases** → Create Database
2. **Name**: `jagcode_main`
3. **ID**: `jagcode_main`

### **Create Collections**

#### **Users Collection**
- **ID**: `users`
- **Permissions**: Read/Write for authenticated users
- **Attributes**:
  - `email` (string, required)
  - `name` (string, required)
  - `profileImage` (string)
  - `bio` (string)
  - `portfolioValue` (number)
  - `isVerified` (boolean)

#### **Crypto Data Collection**
- **ID**: `crypto_data`
- **Permissions**: Read for all, Write for authenticated users
- **Attributes**:
  - `name` (string, required)
  - `symbol` (string, required)
  - `price` (string, required)
  - `change` (string, required)
  - `marketCap` (string)
  - `volume` (string)

#### **NFT Collection**
- **ID**: `nft_collection`
- **Permissions**: Read for all, Write for authenticated users
- **Attributes**:
  - `name` (string, required)
  - `artist` (string, required)
  - `price` (string, required)
  - `image` (string, required)
  - `rarity` (string, required)
  - `description` (string)

#### **User Portfolios Collection**
- **ID**: `user_portfolios`
- **Permissions**: Read/Write for authenticated users
- **Attributes**:
  - `userId` (string, required)
  - `assetName` (string, required)
  - `symbol` (string, required)
  - `amount` (string, required)
  - `value` (string, required)
  - `change` (string, required)

## **Storage Buckets Setup**

### **Profile Images Bucket**
- **ID**: `profile_images`
- **Permissions**: Read for all, Write for authenticated users
- **File Size Limit**: 5MB
- **Allowed Extensions**: jpg, jpeg, png, gif

### **NFT Images Bucket**
- **ID**: `nft_images`
- **Permissions**: Read for all, Write for authenticated users
- **File Size Limit**: 10MB
- **Allowed Extensions**: jpg, jpeg, png, gif, webp

## **Custom Domain Setup**

### **Appwrite Hosting**
1. **Add Custom Domain** in hosting settings
2. **Update DNS records**:
   - **Type**: CNAME
   - **Name**: `www` or `@`
   - **Value**: `your-appwrite-hosting-url`

### **Vercel/Netlify**
1. **Add Custom Domain** in dashboard
2. **Update DNS records** as instructed

## **SSL Certificate**
- **Appwrite**: Automatic SSL
- **Vercel**: Automatic SSL
- **Netlify**: Automatic SSL
- **Webflow**: Automatic SSL

## **Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images
npm install -g sharp-cli
sharp --input input.jpg --output output.webp --quality 80
```

### **CDN Configuration**
- **Appwrite**: Built-in CDN
- **Vercel**: Edge Network
- **Netlify**: Global CDN
- **Webflow**: CDN included

## **Monitoring & Analytics**

### **Google Analytics**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Error Monitoring**
```bash
npm install @sentry/react
```

## **Troubleshooting**

### **Common Issues**
1. **Build Errors**: Check Node.js version (18+)
2. **Environment Variables**: Ensure VITE_ prefix
3. **CORS Issues**: Check backend CORS configuration
4. **Appwrite Connection**: Verify project ID and endpoint

### **Debug Mode**
```env
VITE_ENABLE_DEBUG_MODE=true
```

## **Next Steps**

1. **Choose deployment platform**
2. **Set up Appwrite database and storage**
3. **Configure environment variables**
4. **Deploy and test**
5. **Set up custom domain**
6. **Configure monitoring**

## **Support**

- **Appwrite Docs**: [docs.appwrite.io](https://docs.appwrite.io)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Webflow Docs**: [docs.webflow.com](https://docs.webflow.com)
