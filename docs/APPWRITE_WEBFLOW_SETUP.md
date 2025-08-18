# Appwrite + Webflow Integration Setup Guide

This guide walks you through integrating your JagCode mobile app with Appwrite backend and Webflow frontend.

## Prerequisites

1. **Appwrite Cloud Account**: Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Webflow Account**: Access to `jagecodedevops.webflow.io`
3. **Custom Domain**: `jagcodedevops.xyz` and `www.jagcodedevops.xyz` configured
4. **Firebase Project**: Existing Firebase Functions deployment

## Step 1: Create Appwrite Project

1. **Create New Project**:
   - Login to Appwrite Console
   - Create new project: `jagcodedeveops`
   - Note your Project ID

2. **Configure Platforms**:
   - Go to Settings → Platforms
   - Add Web Platform:
     - **Name**: Webflow Staging
     - **Hostname**: `jagecodedevops.webflow.io`
   - Add another Web Platform:
     - **Name**: Production
     - **Hostname**: `jagcodedevops.xyz`
   - Add another Web Platform:
     - **Name**: Production WWW
     - **Hostname**: `www.jagcodedevops.xyz`

3. **Generate API Keys**:
   - Go to Settings → API Keys
   - Create key for "Web SDK"
   - Note the API Key

## Step 2: Create Database Collections

Create the following collections in your Appwrite database:

### Users Collection (`users`)
```json
{
  "name": "string (required)",
  "email": "email (required, unique)",
  "walletAddress": "string (optional)",
  "portfolioValue": "double (optional)",
  "createdAt": "datetime (required)",
  "updatedAt": "datetime (required)"
}
```

### Portfolios Collection (`portfolios`)
```json
{
  "userId": "string (required)",
  "totalValue": "double (required)",
  "assets": "array (optional)",
  "lastUpdated": "datetime (required)"
}
```

### Transactions Collection (`transactions`)
```json
{
  "userId": "string (required)",
  "type": "enum[send,receive,swap,mine] (required)",
  "amount": "double (required)",
  "symbol": "string (required)",
  "network": "string (required)",
  "hash": "string (optional)",
  "status": "enum[pending,confirmed,failed] (required)",
  "timestamp": "datetime (required)"
}
```

## Step 3: Configure Authentication

1. **Enable Auth Methods**:
   - Go to Auth → Settings
   - Enable "Email/Password"
   - Enable "Anonymous" (optional)
   - Set session length as needed

2. **Configure OAuth** (optional):
   - Enable Google OAuth
   - Enable GitHub OAuth
   - Add redirect URLs for your domains

## Step 4: Set Environment Variables

Create `.env.local` file in your project:

```bash
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_URL=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id-here

# Collection IDs
EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
EXPO_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID=portfolios
EXPO_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID=transactions

# Domain Configuration
WEBFLOW_STAGING_DOMAIN=jagecodedevops.webflow.io
PRODUCTION_DOMAIN=jagcodedevops.xyz
PRODUCTION_DOMAIN_WWW=www.jagcodedevops.xyz

# Existing Firebase Config (keep existing values)
FIREBASE_PROJECT_ID=your-existing-firebase-project
# ... other Firebase config
```

## Step 5: Deploy Updated Firebase Functions

1. **Build and Deploy**:
   ```bash
   cd functions
   npm run build
   npm run deploy
   ```

2. **Verify Deployment**:
   - Test endpoint: `https://your-firebase-functions-url/api/webflow/health`
   - Should return: `{"status": "healthy", "service": "webflow-integration"}`

## Step 6: Configure CORS

### Appwrite CORS
1. Go to Settings → API → CORS
2. Add these origins:
   - `https://jagecodedevops.webflow.io`
   - `https://jagcodedevops.xyz`
   - `https://www.jagcodedevops.xyz`
   - `http://localhost:3000` (for development)

### Firebase Functions CORS
The webflow integration routes already include CORS middleware for your domains.

## Step 7: Embed Code in Webflow

### For Staging (jagecodedevops.webflow.io)

1. Go to Webflow Site Settings → Custom Code → Head Code
2. Add this code:

```html
<script>
  window.JAGCODE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_ACTUAL_PROJECT_ID',
    databaseId: 'YOUR_ACTUAL_DATABASE_ID',
    environment: 'staging',
    apiBaseUrl: 'https://YOUR_FIREBASE_FUNCTIONS_URL',
    domains: {
      webflow: 'jagecodedevops.webflow.io',
      production: 'jagcodedevops.xyz'
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/TheWolfAiAus/jagcodedeveopsV2@main/web/sdk/jagcode-sdk.js"></script>
```

### For Production (jagcodedevops.xyz)

Use the same code but change `environment: 'production'` and use production project ID.

## Step 8: Add Forms to Webflow

Copy the form examples from `/web/webflow/form-examples.html` and customize them in your Webflow designer:

### Key HTML Attributes to Add:
- `data-auth="login-form"` - Login forms (hidden when authenticated)
- `data-auth="authenticated"` - Content visible only when logged in
- `data-user="name"` - Elements that should show the user's name
- Form IDs: `jagcode-login-form`, `jagcode-signup-form`, etc.

## Step 9: Test Integration

### Test Sequence:
1. **SDK Loading**: Check browser console for "JagCode SDK initialized successfully"
2. **User Registration**: Test signup form
3. **User Login**: Test login form
4. **Data Loading**: Verify portfolio and transaction data loads
5. **Wallet Integration**: Test wallet address linking

### Debug Common Issues:

**SDK Not Loading**:
- Check network tab for script loading errors
- Verify GitHub repository is public
- Check console for JavaScript errors

**Authentication Failures**:
- Verify Appwrite project ID and database ID
- Check CORS configuration
- Verify collection permissions

**Data Not Loading**:
- Check Appwrite database collections exist
- Verify collection IDs match configuration
- Check browser network tab for API errors

## Step 10: Data Synchronization

To sync existing data from your mobile app:

1. **Export from Supabase**: Create export scripts for existing user data
2. **Import to Appwrite**: Use Appwrite's REST API or SDK to import data
3. **Set up Real-time Sync**: Create background jobs to keep data in sync

Example sync function:
```typescript
// Add to your Firebase Functions
export const syncSupabaseToAppwrite = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    // Sync logic here
  });
```

## Step 11: Production Deployment

1. **Test on Staging**: Thoroughly test on `jagecodedevops.webflow.io`
2. **Update Production Config**: Deploy production embed code to `jagcodedevops.xyz`
3. **Monitor**: Set up error tracking and monitoring
4. **Backup**: Export Appwrite data regularly

## Troubleshooting

### Common Error Messages:

**"Failed to load resource"**: 
- Check if GitHub repository is public
- Verify the JavaScript file path is correct

**"User not authenticated"**:
- Check if cookies are enabled
- Verify domain configuration in Appwrite

**"CORS policy blocked"**:
- Add domains to Appwrite CORS settings
- Check Firebase Functions CORS configuration

### Support Resources:
- **Appwrite Documentation**: [appwrite.io/docs](https://appwrite.io/docs)
- **Webflow Custom Code**: [webflow.com/help](https://webflow.com/help)
- **Project Repository**: Contact development team

## Security Considerations

1. **API Keys**: Never expose secret API keys in frontend code
2. **Rate Limiting**: Monitor API usage and implement rate limiting
3. **Data Validation**: Validate all user input on backend
4. **HTTPS Only**: Ensure all domains use HTTPS
5. **Regular Updates**: Keep SDK and dependencies updated

---

**Next Steps**: After successful integration, consider adding advanced features like real-time subscriptions, push notifications, and blockchain wallet integration.
