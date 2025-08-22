@echo off
REM 🚀 JagCodeDevOps Appwrite Deployment Script for Windows

echo 🚀 Starting JagCodeDevOps Appwrite Deployment...

REM Check if Appwrite CLI is installed
where appwrite >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Appwrite CLI...
    npm install -g appwrite-cli
)

REM Login to Appwrite (if not already logged in)
echo 🔐 Checking Appwrite authentication...
appwrite account get >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔑 Please login to Appwrite:
    appwrite login
)

REM Initialize Appwrite project (if not already initialized)
if not exist "appwrite.json" (
    echo 🏗️  Initializing Appwrite project...
    appwrite init project
) else (
    echo ✅ Appwrite project already initialized
)

REM Deploy Functions
echo 🔧 Deploying Appwrite Functions...

REM Build backend before deploying
echo 🔨 Building backend...
cd backend
npm install
npm run build
cd ..

REM Deploy backend function
echo 🚀 Deploying backend function...
cd functions
appwrite functions create --functionId backend-api --name "Backend API" --runtime node-18.0 --execute any --timeout 30 --enabled true --logging true --entrypoint "src/index.js" --commands "npm install && npm run build"

REM Deploy function code
appwrite functions createDeployment --functionId backend-api --entrypoint "src/index.js" --code . --activate true

cd ..

REM Deploy crypto tracker function
echo 🪙 Deploying crypto tracker function...
cd crypto-tracker
appwrite functions create --functionId crypto-tracker --name "Crypto Tracker" --runtime python-3.9 --execute any --timeout 60 --enabled true --logging true --entrypoint "main.py" --commands "pip install -r requirements.txt"

appwrite functions createDeployment --functionId crypto-tracker --entrypoint "main.py" --code . --activate true

cd ..

REM Deploy DeFi analyzer function
echo 📊 Deploying DeFi analyzer function...
cd defi-analyzer
appwrite functions create --functionId defi-analyzer --name "DeFi Analyzer" --runtime python-3.9 --execute any --timeout 60 --enabled true --logging true --entrypoint "main.py" --commands "pip install -r requirements.txt"

appwrite functions createDeployment --functionId defi-analyzer --entrypoint "main.py" --code . --activate true

cd ..

REM Deploy Database Schema
echo 🗄️  Setting up database...
appwrite databases create --databaseId jagcode_main --name "JagCode Main Database"

REM Create collections
echo 📚 Creating collections...

REM Users collection
appwrite databases createCollection --databaseId jagcode_main --collectionId users --name "Users" --permissions "read(\"any\") write(\"users\")" --enabled true

REM Deploy Frontend to Appwrite Hosting
echo 🌐 Deploying frontend to Appwrite Hosting...
cd frontend

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating frontend .env file...
    (
        echo VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
        echo VITE_APPWRITE_PROJECT_ID=68a36f6c002bfc1e6057
        echo VITE_API_URL=https://cloud.appwrite.io/v1/functions/backend-api/executions
    ) > .env
)

REM Build frontend
echo 🔨 Building frontend...
npm install
npm run build

REM Instructions for manual hosting upload
echo 🚀 Frontend build completed!
echo 📝 Please follow these steps:
echo 1. Go to Appwrite Console → Your Project → Hosting
echo 2. Create new hosting → Choose 'Static Site'
echo 3. Upload contents of 'frontend/dist' folder
echo 4. Set custom domain (optional)

cd ..

echo.
echo 🎉 Deployment process completed!
echo 📚 Your app functions are deployed to Appwrite
echo 🌐 Upload frontend/dist to Appwrite Hosting to complete deployment
echo ⚙️  Don't forget to configure environment variables in Appwrite Console
echo.
echo ✅ Next steps:
echo 1. Upload frontend build to Appwrite Hosting
echo 2. Configure custom domain (optional)
echo 3. Set up environment variables in functions
echo 4. Test all endpoints and functionality

pause