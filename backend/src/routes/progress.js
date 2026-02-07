const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/progress
 * 自分の進捗一覧取得
 */
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      SELECT 
        p.scenario_id,
        p.best_score,
        p.attempt_count,
        p.last_attempted_at,
        s.title as scenario_title
      FROM progress p
      JOIN scenarios s ON p.scenario_id = s.id
      WHERE p.user_id = $1
      ORDER BY p.last_attempted_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        progress: result.rows.map(row => ({
          scenarioId: row.scenario_id,
          scenarioTitle: row.scenario_title,
          bestScore: row.best_score,
          attemptCount: row.attempt_count,
          lastAttemptedAt: row.last_attempted_at
        }))
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '進捗の取得に失敗しました'
      }
    });
  }
});

/**
 * POST /api/progress
 * 進捗保存・更新
 */
router.post('/', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const { scenarioId, score } = req.body;

  // バリデーション
  if (!scenarioId || score === undefined) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'scenarioIdとscoreは必須です'
      }
    });
  }

  if (score < 0 || score > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SCORE',
        message: 'スコアは0〜100の範囲で指定してください'
      }
    });
  }

  try {
    // シナリオの存在確認
    const scenarioCheck = await db.query(
      'SELECT id FROM scenarios WHERE id = $1',
      [scenarioId]
    );

    if (scenarioCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCENARIO_NOT_FOUND',
          message: 'シナリオが見つかりません'
        }
      });
    }

    // 既存の進捗確認
    const existingProgress = await db.query(
      'SELECT * FROM progress WHERE user_id = $1 AND scenario_id = $2',
      [userId, scenarioId]
    );

    let isNewRecord = false;
    let result;

    if (existingProgress.rows.length === 0) {
      // 新規作成
      result = await db.query(`
        INSERT INTO progress (user_id, scenario_id, best_score, attempt_count)
        VALUES ($1, $2, $3, 1)
        RETURNING *
      `, [userId, scenarioId, score]);
      isNewRecord = true;
    } else {
      // 更新
      const currentProgress = existingProgress.rows[0];
      const newBestScore = Math.max(currentProgress.best_score, score);
      isNewRecord = score > currentProgress.best_score;

      result = await db.query(`
        UPDATE progress 
        SET 
          best_score = $1,
          attempt_count = attempt_count + 1,
          last_attempted_at = NOW(),
          updated_at = NOW()
        WHERE user_id = $2 AND scenario_id = $3
        RETURNING *
      `, [newBestScore, userId, scenarioId]);
    }

    const progressData = result.rows[0];

    res.json({
      success: true,
      data: {
        scenarioId: progressData.scenario_id,
        bestScore: progressData.best_score,
        attemptCount: progressData.attempt_count,
        isNewRecord
      }
    });

  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '進捗の保存に失敗しました'
      }
    });
  }
});

module.exports = router;