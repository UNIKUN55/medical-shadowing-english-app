const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateToken } = require('../utils/jwt');
const admin = require('../config/firebase');

/**
 * POST /api/auth/google-login
 * Googleログイン
 */
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;

  // バリデーション
  if (!idToken) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'IDトークンが必要です'
      }
    });
  }

  try {
    // Firebase Admin SDKでIDトークンを検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // ユーザーが既に存在するかチェック
    const existingUser = await db.query(
      'SELECT id, email, google_id, display_name, photo_url FROM users WHERE google_id = $1',
      [uid]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // 既存ユーザー
      user = existingUser.rows[0];
    } else {
      // 新規ユーザー作成
      const result = await db.query(
        `INSERT INTO users (email, google_id, display_name, photo_url) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, google_id, display_name, photo_url`,
        [email, uid, name || email.split('@')[0], picture || null]
      );
      user = result.rows[0];
    }

    // JWTトークン生成
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          photoUrl: user.photo_url
        }
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'トークンの有効期限が切れています'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'サーバーエラーが発生しました'
      }
    });
  }
});

module.exports = router;