const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateToken } = require('../utils/jwt');

/**
 * POST /api/auth/register
 * ユーザー登録（簡易版：メールアドレスのみ）
 */
router.post('/register', async (req, res) => {
  const { email } = req.body;

  // バリデーション
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: 'メールアドレスが不正です'
      }
    });
  }

  try {
    // 既存ユーザーチェック
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'このメールアドレスは既に登録されています'
        }
      });
    }

    // ユーザー作成
    const result = await db.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
      [email]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
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