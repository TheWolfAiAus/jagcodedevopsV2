#!/bin/bash

echo "🚀 Installing all necessary packages for JagCodeDevOps project..."

# Backend packages
echo "📦 Installing backend packages..."
cd backend

# Core backend dependencies
npm install express@^4.18.2 \
cors@^2.8.5 \
helmet@^7.1.0 \
morgan@^1.10.0 \
dotenv@^16.3.1 \
bcryptjs@^2.4.3 \
jsonwebtoken@^9.0.2 \
express-rate-limit@^7.1.5 \
express-validator@^7.0.1 \
multer@^1.4.5-lts.1 \
sharp@^0.33.0 \
node-cron@^3.0.3 \
axios@^1.6.2 \
socket.io@^4.7.4 \
redis@^4.6.10 \
mongoose@^8.0.3 \
appwrite@^16.0.2 \
web3@^4.3.0 \
ethers@^6.9.0 \
crypto-js@^4.2.0 \
jsforce@^1.11.1 \
ws@^8.14.2 \
uuid@^9.0.0 \
lodash@^4.17.21 \
moment@^2.29.4 \
chalk@^5.3.0 \
nodemailer@^6.9.7 \
winston@^3.11.0

# Development dependencies  
npm install --save-dev @types/express@^4.17.21 \
@types/cors@^2.8.17 \
@types/morgan@^1.9.9 \
@types/bcryptjs@^2.4.6 \
@types/jsonwebtoken@^9.0.5 \
@types/multer@^1.4.11 \
@types/node@^20.10.4 \
@types/node-cron@^3.0.11 \
@types/ws@^8.5.10 \
@types/crypto-js@^4.2.2 \
@types/lodash@^4.14.202 \
@types/uuid@^9.0.7 \
@types/nodemailer@^6.4.14 \
typescript@^5.3.3 \
ts-node-dev@^2.0.0 \
eslint@^8.55.0 \
@typescript-eslint/parser@^6.14.0 \
@typescript-eslint/eslint-plugin@^6.14.0 \
prettier@^3.1.1 \
jest@^29.7.0 \
@types/jest@^29.5.8 \
@types/supertest@^2.0.16 \
supertest@^6.3.3

cd ..

# Frontend packages
echo "📱 Installing frontend packages..."
cd frontend

# Core React dependencies
npm install react@^18.2.0 \
react-dom@^18.2.0 \
react-router-dom@^6.20.1 \
react-query@^3.39.3 \
@tanstack/react-query@^5.8.4 \
axios@^1.6.2 \
@reduxjs/toolkit@^1.9.7 \
react-redux@^8.1.3 \
redux-persist@^6.0.0 \
formik@^2.4.5 \
yup@^1.3.3 \
react-hook-form@^7.48.2 \
@hookform/resolvers@^3.3.2

# UI/UX libraries
npm install @mui/material@^5.14.20 \
@emotion/react@^11.11.1 \
@emotion/styled@^11.11.0 \
@mui/icons-material@^5.14.19 \
@mui/x-date-pickers@^6.18.2 \
@mui/x-data-grid@^6.18.2 \
react-beautiful-dnd@^13.1.1 \
framer-motion@^10.16.5 \
react-spring@^9.7.3 \
lottie-react@^2.4.0

# Charts and visualization
npm install recharts@^2.8.0 \
chart.js@^4.4.0 \
react-chartjs-2@^5.2.0 \
d3@^7.8.5 \
@types/d3@^7.4.3 \
plotly.js@^2.27.1 \
react-plotly.js@^2.6.0

# Utility libraries
npm install lodash@^4.17.21 \
moment@^2.29.4 \
date-fns@^2.30.0 \
uuid@^9.0.0 \
classnames@^2.3.2 \
react-helmet-async@^1.3.0 \
react-hot-toast@^2.4.1 \
react-loading-skeleton@^3.3.1

# Crypto & Web3 libraries
npm install web3@^4.3.0 \
ethers@^6.9.0 \
@web3-react/core@^6.1.9 \
@web3-react/injected-connector@^6.0.7 \
@web3-react/walletconnect-connector@^6.2.13

# Development dependencies
npm install --save-dev @types/react@^18.2.42 \
@types/react-dom@^18.2.17 \
@types/lodash@^4.14.202 \
@types/uuid@^9.0.7 \
@types/d3@^7.4.3 \
@vitejs/plugin-react@^4.2.0 \
vite@^5.0.5 \
typescript@^5.3.3 \
eslint@^8.55.0 \
@typescript-eslint/parser@^6.14.0 \
@typescript-eslint/eslint-plugin@^6.14.0 \
eslint-plugin-react@^7.33.2 \
eslint-plugin-react-hooks@^4.6.0 \
prettier@^3.1.1

cd ..

# React Native packages
echo "📱 Installing React Native packages..."

# Core React Native dependencies
npm install react-native@^0.72.7 \
@react-native-community/netinfo@^10.0.0 \
@react-native-async-storage/async-storage@^1.19.5 \
react-native-gesture-handler@^2.14.0 \
react-native-reanimated@^3.6.0 \
react-native-safe-area-context@^4.7.4 \
react-native-screens@^3.27.0 \
@react-navigation/native@^6.1.9 \
@react-navigation/stack@^6.3.20 \
@react-navigation/bottom-tabs@^6.5.11 \
@react-navigation/drawer@^6.6.6

# React Native UI components
npm install react-native-elements@^3.4.3 \
react-native-vector-icons@^10.0.2 \
react-native-paper@^5.11.3 \
react-native-super-grid@^4.9.7 \
react-native-snap-carousel@^3.9.1

# React Native utilities
npm install react-native-device-info@^10.11.0 \
react-native-keychain@^8.1.3 \
react-native-biometrics@^3.0.1 \
react-native-camera@^4.2.1 \
react-native-image-picker@^7.0.3 \
react-native-permissions@^4.0.5

# Functions (Firebase)
echo "🔥 Installing Firebase Functions packages..."
cd functions

npm install firebase-functions@^4.5.0 \
firebase-admin@^11.11.1 \
express@^4.18.2 \
cors@^2.8.5 \
helmet@^7.1.0

npm install --save-dev typescript@^5.3.3 \
@types/express@^4.17.21

cd ..

# Root level packages
echo "📦 Installing root level packages..."

# Development tools
npm install --save-dev \
concurrently@^8.2.2 \
cross-env@^7.0.3 \
nodemon@^3.0.2 \
prettier@^3.1.1 \
eslint@^8.55.0 \
husky@^8.0.3 \
lint-staged@^15.2.0

# Expo packages
npm install @expo/cli@^0.16.0 \
expo@^49.0.21 \
expo-router@^2.0.14 \
expo-constants@^14.4.2 \
expo-status-bar@^1.6.0 \
expo-splash-screen@^0.20.5

echo "✅ All packages installed successfully!"

# Build TypeScript projects
echo "🔨 Building TypeScript projects..."

cd backend
npm run build
cd ..

cd functions  
npm run build
cd ..

echo "🎉 Project setup complete! All packages installed and built successfully."
echo ""
echo "Available commands:"
echo "  Backend:     cd backend && npm run dev"  
echo "  Frontend:    cd frontend && npm run dev"
echo "  Functions:   cd functions && npm run serve"
echo "  React Native: npm run start"
echo ""
echo "🚀 Your JAG-OPS system is ready to launch!"