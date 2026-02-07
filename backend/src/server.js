const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    version: '0.1.0'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ========================================
  🚀 Server is running!
  ========================================
  📍 URL: http://localhost:${PORT}
  🏥 Health: http://localhost:${PORT}/health
  🧪 Test: http://localhost:${PORT}/api/test
  ========================================
  `);
});