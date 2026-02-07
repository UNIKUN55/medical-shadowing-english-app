const jwt = require('jsonwebtoken');

/**
 * JWTトークンを生成
 * @param {number} userId - ユーザーID
 * @param {string} email - メールアドレス
 * @returns {string} JWTトークン
 */
function generateToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d' // 7日間有効
    }
  );
}

/**
 * JWTトークンを検証
 * @param {string} token - JWTトークン
 * @returns {object|null} デコードされたペイロード or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { 
  generateToken, 
  verifyToken 
};