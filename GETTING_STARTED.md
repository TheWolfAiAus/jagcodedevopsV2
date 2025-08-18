# 🚀 Getting Started - Complete Setup Guide

This guide will walk you through setting up your JagCode app from scratch. No technical knowledge assumed!

## 📋 What You Have Now

You have a complete mobile and web app that includes:
- 📱 **Mobile App**: Works on iPhone, Android, and web browsers
- 🌐 **Web Dashboard**: A website that syncs with your mobile app
- ⚡ **Real-time Updates**: Changes on mobile instantly appear on web
- 🔐 **User Authentication**: Sign up, login, logout
- 💰 **Portfolio Tracking**: Track crypto/assets
- 💳 **Transaction History**: See all your transactions
- 🔗 **Wallet Integration**: Connect crypto wallets

## 🎯 Step 1: Install Required Software

### On Windows (what you have):

1. **Install Node.js**:
   - Go to [nodejs.org](https://nodejs.org)
   - Download "LTS" version (left button)
   - Run installer with default settings
   - Restart PowerShell when done

2. **Verify installation**:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers like `v18.17.0` or similar.

## 🎯 Step 2: Set Up Your Database (Appwrite)

### Create Appwrite Account:
1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up with your email
3. Click "Create Project"
4. Name it: `jagcodedeveops`
5. **SAVE YOUR PROJECT ID** - you'll need this later!

### Set Up Database Collections:
1. In Appwrite, go to "Databases"
2. Click "Create Database"
3. Name it: `main`
4. **SAVE YOUR DATABASE ID** - you'll need this!

Now create these collections (click "Create Collection" for each):

**Collection 1: users**
- Name: `users`
- Add these attributes (click "Add Attribute"):
  - `name` (String, size: 255, required)
  - `email` (Email, required)
  - `walletAddress` (String, size: 255, optional)
  - `portfolioValue` (Double, optional)
  - `createdAt` (DateTime, required)
  - `updatedAt` (DateTime, required)

**Collection 2: portfolios**
- Name: `portfolios`
- Add these attributes:
  - `userId` (String, size: 255, required)
  - `totalValue` (Double, required)
  - `assets` (String, size: 65535, optional) *this will store JSON*
  - `lastUpdated` (DateTime, required)

**Collection 3: transactions**
- Name: `transactions`
- Add these attributes:
  - `userId` (String, size: 255, required)
  - `type` (String, size: 50, required)
  - `amount` (Double, required)
  - `symbol` (String, size: 10, required)
  - `network` (String, size: 50, required)
  - `hash` (String, size: 255, optional)
  - `status` (String, size: 50, required)
  - `timestamp` (DateTime, required)

**Collection 4: activity**
- Name: `activity`
- Add these attributes:
  - `userId` (String, size: 255, required)
  - `type` (String, size: 50, required)
  - `description` (String, size: 500, required)
  - `metadata` (String, size: 65535, optional) *this will store JSON*
  - `timestamp` (DateTime, required)
  - `platform` (String, size: 20, required)

**Collection 5: settings**
- Name: `settings`
- Add these attributes:
  - `userId` (String, size: 255, required)
  - `theme` (String, size: 20, required)
  - `notifications` (String, size: 65535, required) *this will store JSON*
  - `privacy` (String, size: 65535, required) *this will store JSON*
  - `currency` (String, size: 10, required)
  - `language` (String, size: 10, required)
  - `updatedAt` (DateTime, required)

### Configure Authentication:
1. In Appwrite, go to "Auth"
2. Go to "Settings" tab
3. Enable "Email/Password"
4. Set "Session Length" to 365 days

### Add Your Domains:
1. Go to "Settings" → "Platforms"
2. Click "Add Platform" → "Web"
3. Add these platforms:
   - **Name**: Local Development, **Hostname**: `localhost`
   - **Name**: Webflow Staging, **Hostname**: `jagecodedevops.webflow.io`
   - **Name**: Production, **Hostname**: `jagcodedevops.xyz`
   - **Name**: Production WWW, **Hostname**: `www.jagcodedevops.xyz`

## 🎯 Step 3: Configure Your App

1. **Create your environment file**:
   ```powershell
   copy .env.example .env.local
   ```

2. **Edit the .env.local file**:
   Open `.env.local` in any text editor and replace these values:
   ```
   EXPO_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-actual-project-id-from-step-2
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-actual-database-id-from-step-2
   
   # Keep these as they are:
   EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
   EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID=portfolios
   EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID=transactions
   EXPO_PUBLIC_APPWRITE_ACTIVITY_COLLECTION_ID=activity
   EXPO_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID=settings
   
   # Real-time Features
   EXPO_PUBLIC_ENABLE_REALTIME=true
   EXPO_PUBLIC_REALTIME_HEARTBEAT=30000
   ```

## 🎯 Step 4: Install Dependencies and Run Your App

1. **Install app dependencies**:
   ```powershell
   npm install
   ```

2. **Install Expo CLI globally**:
   ```powershell
   npm install -g @expo/cli
   ```

3. **Start your app**:
   ```powershell
   npm start
   ```

4. **Choose how to run**:
   - Press `w` to open in web browser
   - Press `a` to run on Android (need Android Studio)
   - Press `i` to run on iOS (need Mac + Xcode)
   - Scan QR code with Expo Go app on your phone

## 🎯 Step 5: Test Your Mobile App

1. **Open the app** (web browser is easiest to start)
2. **Go to Dashboard tab** - you should see the dashboard
3. **Try signing up**:
   - Click sign up
   - Enter email, password, name
   - Should create account and log you in
4. **Check real-time status** - should show "Connected"

## 🎯 Step 6: Set Up Web Dashboard (Webflow)

### If you have Webflow access:

1. **Go to your Webflow project settings**
2. **Custom Code** → **Head Code**
3. **Paste this code** (replace YOUR_PROJECT_ID and YOUR_DATABASE_ID):
   ```html
   <script>
     window.JAGCODE_CONFIG = {
       endpoint: 'https://cloud.appwrite.io/v1',
       projectId: 'YOUR_PROJECT_ID_HERE',
       databaseId: 'YOUR_DATABASE_ID_HERE',
       environment: 'production'
     };
   </script>
   <script src="https://cdn.jsdelivr.net/gh/TheWolfAiAus/jagcodedeveopsV2@main/web/sdk/jagcode-sdk.js"></script>
   ```

4. **Add dashboard to a page**:
   - Copy content from `web/webflow/dashboard-layout.html`
   - Paste into a new Webflow page
   - Publish your site

### If you don't have Webflow access:
You can test the web dashboard locally:
1. Create a simple HTML file with the dashboard code
2. Open it in a web browser
3. It will connect to your Appwrite database

## 🎯 Step 7: Add Sample Data (Optional)

To see the app in action, you can add some test data:

1. **Sign up in the mobile app**
2. **Go to Appwrite Dashboard**
3. **Go to Databases** → **main** → **portfolios**
4. **Click "Add Document"**
5. **Add this data**:
   ```json
   {
     "userId": "your-user-id-from-users-collection",
     "totalValue": 1250.50,
     "assets": "[{\"symbol\":\"BTC\",\"amount\":0.05,\"valueUsd\":1000,\"network\":\"Bitcoin\"},{\"symbol\":\"ETH\",\"amount\":0.8,\"valueUsd\":250.50,\"network\":\"Ethereum\"}]",
     "lastUpdated": "2025-01-18T13:47:21.000Z"
   }
   ```

## 🎯 Troubleshooting Common Issues

### "npm: command not found"
- Node.js not installed properly
- Restart PowerShell after installing Node.js
- Try: `refreshenv` in PowerShell

### "Cannot connect to Appwrite"
- Check your Project ID and Database ID in `.env.local`
- Make sure Appwrite project has the correct domains
- Check if collections exist and have correct names

### "Real-time not working"
- Make sure `EXPO_PUBLIC_ENABLE_REALTIME=true` in `.env.local`
- Check Appwrite console for any errors
- Try refreshing the app

### App won't start
- Try: `npm install` again
- Clear cache: `npx expo start --clear`
- Check if ports are available (try different port)

## 🎯 Next Steps Once Running

1. **Customize the UI** - Change colors, fonts, layout
2. **Add more features** - Import your existing Python crypto code
3. **Deploy to app stores** - Build for iOS/Android
4. **Set up your domain** - Connect jagcodedevops.xyz
5. **Add real crypto data** - Connect to your existing APIs

## 📞 Need Help?

If you get stuck:
1. **Check the error messages** - they usually tell you what's wrong
2. **Try the troubleshooting section above**
3. **Make sure all IDs in .env.local are correct**
4. **Restart everything** - close terminals, restart app

## 🎉 Success Checklist

- [ ] Node.js installed and working
- [ ] Appwrite account created with project
- [ ] Database collections created
- [ ] .env.local file configured
- [ ] App dependencies installed
- [ ] App starts without errors
- [ ] Can sign up/login in the app
- [ ] Dashboard shows real-time status as "Connected"
- [ ] Can see portfolio/transaction sections (even if empty)

Once you check all these boxes, your app is fully set up and ready to customize!
