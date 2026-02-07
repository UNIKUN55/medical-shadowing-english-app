const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const scenariosRouter = require('./routes/scenarios');
const progressRouter = require('./routes/progress');
const bookmarksRouter = require('./routes/bookmarks');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// CORS設定
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
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

// Routes
app.use('/api/auth', authRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/progress', progressRouter);
app.use('/api/bookmarks', bookmarksRouter);

// Error handling middleware (最後に配置)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ========================================
  🚀 Server is running!
  ========================================
  📍 URL: http://localhost:${PORT}
  🏥 Health: http://localhost:${PORT}/health
  🧪 Test: http://localhost:${PORT}/api/test
  🔐 Auth: POST http://localhost:${PORT}/api/auth/register
  📚 Scenarios: GET http://localhost:${PORT}/api/scenarios
  📊 Progress: GET/POST http://localhost:${PORT}/api/progress
  ⭐ Bookmarks: GET/POST/DELETE http://localhost:${PORT}/api/bookmarks
  🌍 Environment: ${process.env.NODE_ENV}
  ========================================
  `);
});