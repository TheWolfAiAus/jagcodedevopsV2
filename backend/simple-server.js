const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:4173",
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/_health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'JagCodeDevOps Backend Running!'
  });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running perfectly!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/crypto', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { symbol: 'BTC', price: 65000, change: '+2.5%' },
      { symbol: 'ETH', price: 3200, change: '+1.8%' },
      { symbol: 'SOL', price: 180, change: '+4.2%' }
    ]
  });
});

app.get('/api/wolf', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Wolf AI is operational',
    status: 'active'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/_health`);
  console.log(`🔗 API Status: http://localhost:${PORT}/api/status`);
});