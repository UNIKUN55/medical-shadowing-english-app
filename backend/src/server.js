const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRouter = require('./routes/auth');
const scenariosRouter = require('./routes/scenarios');
const progressRouter = require('./routes/progress');
const bookmarksRouter = require('./routes/bookmarks');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// レート制限の設定（DoS攻撃対策）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分間で最大100リクエスト
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'リクエストが多すぎます。しばらくしてから再度お試しください。'
    }
  },
  standardHeaders: true, // `RateLimit-*` ヘッダーを返す
  legacyHeaders: false, // `X-RateLimit-*` ヘッダーを無効化
});

// 認証エンドポイント用（ブルートフォース攻撃対策）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 10, // 15分間で最大10回
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'ログイン試行回数が多すぎます。15分後に再度お試しください。'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS設定（改善版）
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:5173', 'http://localhost:3000'], // 開発環境も制限
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// 全APIエンドポイントにレート制限を適用
app.use('/api/', limiter);

// 認証エンドポイントにはさらに厳しい制限
app.use('/api/auth', authLimiter);

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
  🛡️  Rate Limiting: Enabled
  ========================================
  `);
});