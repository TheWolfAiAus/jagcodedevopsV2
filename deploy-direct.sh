#!/bin/bash

echo "🚀 Direct Appwrite Deployment Script"
echo "====================================="

# Set your Appwrite details
PROJECT_ID="68a36f6c002bfc1e6057"
API_KEY="${APPWRITE_API_KEY}"
ENDPOINT="https://cloud.appwrite.io/v1"

echo "🔨 Building functions..."
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Function build failed!"
    exit 1
fi

echo "✅ Functions built successfully!"

echo "🌐 Building frontend..."
cd ../frontend-nextjs
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

echo ""
echo "🎉 BUILD COMPLETE!"
echo "=================="
echo ""
echo "📁 Built Files Ready:"
echo "   - Functions: functions/lib/index.js"
echo "   - Frontend: frontend-nextjs/out/"
echo ""
echo "🚀 Next Steps (Manual):"
echo "1. Go to: https://console.appwrite.io/console/project-$PROJECT_ID/functions"
echo "2. Create/Update backend-api function"
echo "3. Upload functions/lib/index.js as the function code"
echo "4. Go to: https://console.appwrite.io/console/project-$PROJECT_ID/hosting"
echo "5. Create static site and upload frontend-nextjs/out/ contents"
echo ""
echo "✨ Your crypto platform will be LIVE!"