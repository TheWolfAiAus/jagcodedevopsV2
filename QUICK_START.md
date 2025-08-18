# ⚡ Quick Start Guide (You Have Node.js 24 ✅)

Since you already have Node.js 24, let's get your app running quickly!

## 🚀 What We're Going to Do

1. Set up Appwrite (your database) - **5 minutes**
2. Configure your app - **2 minutes** 
3. Run the app - **1 minute**
4. Test it works - **2 minutes**

**Total time: ~10 minutes**

## Step 1: Set Up Appwrite Database

### Create Account & Project:
1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up with email
3. Create Project → Name: `jagcodedeveops`
4. **Copy your Project ID** (you'll see it in the URL or dashboard)

### Create Database:
1. Click "Databases" 
2. "Create Database" → Name: `main`
3. **Copy your Database ID**

### Create Collections:
Click "Create Collection" 5 times and set these up:

**Collection 1:**
- Name: `users`
- Attributes: `name` (String, 255), `email` (Email), `walletAddress` (String, 255, optional), `portfolioValue` (Double, optional), `createdAt` (DateTime), `updatedAt` (DateTime)

**Collection 2:**
- Name: `portfolios`  
- Attributes: `userId` (String, 255), `totalValue` (Double), `assets` (String, 65535, optional), `lastUpdated` (DateTime)

**Collection 3:**
- Name: `transactions`
- Attributes: `userId` (String, 255), `type` (String, 50), `amount` (Double), `symbol` (String, 10), `network` (String, 50), `hash` (String, 255, optional), `status` (String, 50), `timestamp` (DateTime)

**Collection 4:**
- Name: `activity`
- Attributes: `userId` (String, 255), `type` (String, 50), `description` (String, 500), `metadata` (String, 65535, optional), `timestamp` (DateTime), `platform` (String, 20)

**Collection 5:**
- Name: `settings`
- Attributes: `userId` (String, 255), `theme` (String, 20), `notifications` (String, 65535), `privacy` (String, 65535), `currency` (String, 10), `language` (String, 10), `updatedAt` (DateTime)

### Enable Authentication:
1. Go to "Auth" → "Settings"
2. Enable "Email/Password"

### Add Domains:
1. "Settings" → "Platforms" → "Add Platform" → "Web"
2. Add: `localhost`, `jagecodedevops.webflow.io`, `jagcodedevops.xyz`, `www.jagcodedevops.xyz`

## Step 2: Configure Your App

1. **Create environment file:**
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. **Edit .env.local** (use Notepad or any text editor):
   Replace these two lines with your actual IDs:
   ```
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=paste-your-project-id-here
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=paste-your-database-id-here
   ```
   
   Leave everything else as-is.

## Step 3: Install & Run

```powershell
# Install dependencies
npm install

# Install Expo CLI
npm install -g @expo/cli

# Start the app
npm start
```

When it starts:
- Press `w` to open in web browser (easiest to test)

## Step 4: Test It Works

1. **In the browser**, you should see tabs at the bottom
2. **Click "Dashboard" tab**
3. **Try signing up**: Create an account with email/password
4. **Check the dashboard**: Should show "Connected" status and empty portfolio

## 🎉 Success!

If you can sign up and see the dashboard, everything is working!

## Next Steps:

1. **Add test data**: Go back to Appwrite → Databases → portfolios → Add Document:
   ```json
   {
     "userId": "your-user-id-from-users-table",
     "totalValue": 1250.50,
     "assets": "[{\"symbol\":\"BTC\",\"amount\":0.05,\"valueUsd\":1000,\"network\":\"Bitcoin\"}]",
     "lastUpdated": "2025-01-18T13:47:21.000Z"
   }
   ```

2. **Set up Webflow**: Add the dashboard to your website

## Having Issues?

**App won't start?**
```powershell
npx expo start --clear
```

**Can't connect to database?**
- Double-check Project ID and Database ID in `.env.local`
- Make sure collections are created with exact names

**Real-time not working?**
- Check `.env.local` has `EXPO_PUBLIC_ENABLE_REALTIME=true`

That's it! Your app should be running with real-time features, authentication, and a full dashboard. The web version will sync with mobile automatically.
