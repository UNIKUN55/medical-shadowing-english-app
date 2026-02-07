/**
 * エラーハンドリングミドルウェア
 * すべてのエラーを統一的に処理
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // JWT関連エラー
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無効なトークンです'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'トークンの有効期限が切れています'
      }
    });
  }

  // PostgreSQL Unique制約違反
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: '既に存在します'
      }
    });
  }

  // デフォルトエラー
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'サーバーエラーが発生しました'
    }
  });
}

module.exports = { errorHandler };