@echo off
chcp 65001 >nul
echo 🚀 Starting JagCodeDevOps Frontend Deployment...

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo 📝 Creating .env file from example...
    copy env.example .env
    echo ⚠️  Please edit .env file with your actual values
    echo 📝 Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID
    pause
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Build the project
echo 🔨 Building project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Check build output
if not exist "dist" (
    echo ❌ Error: Build output directory 'dist' not found
    pause
    exit /b 1
)

echo 📁 Build output created in 'dist' directory

REM Deployment options
echo 🌐 Choose deployment option:
echo 1) Deploy to Appwrite Hosting (Recommended)
echo 2) Deploy to Vercel
echo 3) Deploy to Netlify
echo 4) Prepare for Webflow
echo 5) Just build (no deployment)

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🚀 Deploying to Appwrite Hosting...
    echo 📝 Instructions:
    echo 1. Go to Appwrite Console → Your Project → Hosting
    echo 2. Create new hosting → Choose 'Static Site'
    echo 3. Upload contents of 'dist' folder
    echo 4. Set custom domain (optional)
    echo.
    echo ✅ Your build is ready in the 'dist' folder
    echo 📁 Upload the contents of 'dist' to Appwrite Hosting
) else if "%choice%"=="2" (
    echo 🚀 Deploying to Vercel...
    call npm install -g vercel
    call vercel --prod
) else if "%choice%"=="3" (
    echo 🚀 Deploying to Netlify...
    call npm install -g netlify-cli
    call netlify deploy --prod --dir=dist
) else if "%choice%"=="4" (
    echo 🎨 Preparing for Webflow...
    echo 📝 Instructions:
    echo 1. Go to Webflow Designer → Pages
    echo 2. Import HTML → Upload contents of 'dist' folder
    echo 3. Customize in Webflow Designer
    echo.
    echo ✅ Your build is ready in the 'dist' folder
    echo 📁 Upload the contents of 'dist' to Webflow
) else if "%choice%"=="5" (
    echo ✅ Build completed. No deployment selected.
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment process completed!
echo 📚 Check DEPLOYMENT.md for detailed instructions
echo 🔗 Your app should be live at the deployment URL
pause
