const { verifyToken } = require('../utils/jwt');

/**
 * 認証ミドルウェア
 * リクエストのAuthorizationヘッダーからJWTトークンを検証
 */
function authenticate(req, res, next) {
  // Authorizationヘッダー取得
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: '認証トークンが必要です'
      }
    });
  }

  // "Bearer "を除いてトークンを取得
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無効なトークンです'
      }
    });
  }

  // リクエストオブジェクトにユーザー情報を追加
  req.user = decoded;
  next();
}

module.exports = { authenticate };