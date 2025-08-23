const http = require('http');
const url = require('url');

const PORT = 5000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  res.setHeader('Content-Type', 'application/json');

  // Health check
  if (path === '/_health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'JagCodeDevOps Backend Running!'
    }));
    return;
  }

  // API Status
  if (path === '/api/status') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Backend is running perfectly!',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Crypto API
  if (path === '/api/crypto') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [
        { symbol: 'BTC', price: 65000, change: '+2.5%' },
        { symbol: 'ETH', price: 3200, change: '+1.8%' },
        { symbol: 'SOL', price: 180, change: '+4.2%' }
      ]
    }));
    return;
  }

  // Wolf AI API
  if (path === '/api/wolf') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Wolf AI is operational',
      status: 'active'
    }));
    return;
  }

  // Default 404
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Route not found',
    path: path
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/_health`);
  console.log(`🔗 API Status: http://localhost:${PORT}/api/status`);
  console.log(`💰 Crypto API: http://localhost:${PORT}/api/crypto`);
  console.log(`🐺 Wolf AI: http://localhost:${PORT}/api/wolf`);
});