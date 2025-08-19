# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a hybrid Expo React Native application with Appwrite backend, Firebase Functions, and Python API routes. The project combines mobile app development with blockchain/crypto functionality, real-time data synchronization, and AI integrations.

**Key Technologies:**
- **Frontend**: Expo SDK 53, React Native, TypeScript, Expo Router (file-based routing)
- **Backend**: Appwrite (primary database & auth), Firebase Functions (Node.js/Express), Python FastAPI routes
- **Database**: Appwrite with real-time subscriptions
- **Platforms**: iOS, Android, Web (Webflow integration)
- **Real-time**: Appwrite real-time subscriptions for live data updates

## Common Development Commands

### Mobile Development
```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios  
npm run web

# Reset project (moves starter code to app-example/)
npm run reset-project

# Linting
npm run lint
```

### Firebase Functions
```bash
# Navigate to functions directory first
cd functions

# Build TypeScript
npm run build

# Local development with emulators
npm run serve

# Deploy to Firebase
npm run deploy
```

### Android Development
- Android previews auto-start via workspace hooks
- If tasks aren't found, rebuild environment: `IDX: Rebuild Environment`
- Manual command: `npm run android -- --tunnel`

## Architecture Overview

### Frontend Structure
The app follows Expo's file-based routing pattern with a well-organized component system:

- **`app/`** - File-based routes (expo-router)
  - `_layout.tsx` - Root navigation setup with theme provider
  - `(tabs)/` - Tab-based navigation structure
  - `+not-found.tsx` - 404 handling

- **`src/`** - Main application code with barrel exports
  - `components/` - Reusable UI components (ThemedText, ThemedView, etc.)
  - `hooks/` - React hooks (useColorScheme, useThemeColor)
  - `constants/` - App constants (Colors, etc.)
  - `routes/` - API route definitions and server-side logic

### Backend Architecture
The backend uses a hybrid approach with both Node.js and Python components:

#### Firebase Functions (`functions/`)
- Express.js server that dynamically loads route modules
- Handles routing for crypto, NFT, auth, user management APIs
- Fallback loading system for route modules
- Health check endpoint at `/_health`

#### Python API Routes (`src/routes/*.py`)
Key Python modules for specialized functionality:
- `asset_tracker.py` - Portfolio and asset balance tracking
- `automation.py` - Automated trading and processes  
- `crypto_miner.py` - Cryptocurrency mining operations
- `smart_contracts.py` - Blockchain smart contract interactions
- `wallet_manager.py` - Wallet connection and management
- `nft_hunter.py` - NFT discovery and tracking

#### Route Organization
- TypeScript routes in `src/routes/*.ts` - Express routers
- Python routes in `src/routes/*.py` - FastAPI routers
- `routersIndex.ts` - Centralized router exports
- Dynamic loading system supports both JS/TS and Python routes

### Database Integration
- **Appwrite**: Primary database with real-time subscriptions
- Configuration in `src/lib/appwrite.ts`
- Collections: users, portfolios, transactions, activity, settings
- Real-time service in `src/services/realTimeService.ts`

### Import System
Uses path aliasing for clean imports:
- `@/*` maps to `src/*` (configured in `metro.config.js` and `tsconfig.json`)
- Barrel exports in `src/*/index.ts` files for organized imports

Example:
```typescript
import { ThemedText, ThemedView } from '@/components';
import { useColorScheme } from '@/hooks';
```

## Key Development Patterns

### Component Organization
- Themed components (ThemedText, ThemedView) for consistent styling
- Platform-specific files (`.ios.tsx`, `.web.ts`) for platform differences
- UI components in `src/components/ui/` for specialized interface elements

### State Management
- React Navigation with theme support (dark/light mode)
- Color scheme detection with platform-specific hooks
- Haptic feedback integration for enhanced UX

### API Integration
- Hybrid backend supporting both Node.js Express and Python FastAPI
- Centralized error handling and logging
- Service injection pattern for wallet manager integration

### Real-time Features
- **Live Data Updates**: Appwrite real-time subscriptions for portfolio, transactions, and activity
- **Cross-platform Sync**: Changes on mobile instantly reflect on web dashboard
- **Connection Management**: Automatic reconnection with exponential backoff
- **Event-driven Architecture**: Real-time service emits events for UI updates

Example usage:
```typescript
import { getRealTimeService } from '@/services/realTimeService';

const realtimeService = getRealTimeService({
  onPortfolioUpdate: (portfolio) => {
    console.log('Portfolio updated:', portfolio.totalValue);
  },
  onTransactionUpdate: (transaction) => {
    console.log('New transaction:', transaction.type);
  }
});

await realtimeService.initialize(userId);
```

### Mobile-Specific Features
- Expo Router for navigation
- Platform-specific tab bar styling
- Adaptive icons and splash screens
- Edge-to-edge display support on Android

## Development Workflow

1. **Frontend Development**: Use `npm start` and select platform
2. **Backend Testing**: Use `cd functions && npm run serve` for local Firebase emulation
3. **Database**: Configure Appwrite environment variables (see `.env.example`)
4. **Real-time Features**: Enable real-time subscriptions in development
5. **Testing**: Both platforms support hot reload during development
6. **Building**: Run platform-specific build commands through Expo CLI

## Web Integration (Appwrite + Webflow)

The project includes a comprehensive web integration that bridges the mobile app with Webflow websites using Appwrite as the backend.

### Webflow Domains
- **Staging**: `jagecodedevops.webflow.io`
- **Production**: `jagcodedevops.xyz` and `www.jagcodedevops.xyz`

### Web SDK Usage
```javascript
// Initialize JagCode SDK in Webflow
window.jagcode = new JagCodeSDK();
await window.jagcode.init({
  projectId: 'your-appwrite-project-id',
  databaseId: 'your-database-id'
});

// Authentication
await window.jagcode.auth.signUp(email, password, name);
await window.jagcode.auth.signIn(email, password);

// Data operations
const portfolio = await window.jagcode.portfolio.get();
const transactions = await window.jagcode.transactions.list();
```

### Key Integration Files
- `web/sdk/jagcode-sdk.js` - Main JavaScript SDK for Webflow
- `web/webflow/embed-code.html` - Copy-paste embed code for Webflow
- `web/webflow/form-examples.html` - Complete form examples
- `src/routes/webflowIntegrationRoutes.ts` - API endpoints for web integration
- `src/services/appwriteService.ts` - Appwrite service layer
- `src/lib/appwrite.ts` - Appwrite client configuration

### Setup Process
1. **Appwrite Setup**: Create project and configure domains
2. **Environment Variables**: Configure `.env.local` with Appwrite credentials
3. **Firebase Functions**: Deploy updated functions with web integration routes
4. **Webflow Integration**: Add embed code to Webflow site settings
5. **Forms & UI**: Copy form examples and customize in Webflow

See `docs/APPWRITE_WEBFLOW_SETUP.md` for complete setup instructions.

### API Endpoints
Web integration adds these endpoints to Firebase Functions:
- `POST /api/webflow/auth/signup` - User registration
- `POST /api/webflow/auth/signin` - User login
- `GET /api/webflow/portfolio/:userId` - Get user portfolio
- `GET /api/webflow/transactions/:userId` - Get user transactions
- `POST /api/webflow/wallet/link/:userId` - Link wallet address
- `POST /api/webflow/sync/:userId` - Sync with Supabase data

## Repository Information
- **Remote**: https://github.com/TheWolfAiAus/jagcodedeveopsV2.git
- **IDE**: Configured for Google IDX development environment
- **Linting**: ESLint with Expo configuration
