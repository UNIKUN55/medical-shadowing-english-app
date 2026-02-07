const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/scenarios
 * シナリオ一覧取得（進捗情報付き）
 */
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId;

  try {
    // シナリオ一覧と進捗を結合して取得
    const result = await db.query(`
      SELECT 
        s.id,
        s.title,
        s.difficulty_level,
        p.best_score,
        CASE WHEN p.id IS NOT NULL THEN true ELSE false END as attempted
      FROM scenarios s
      LEFT JOIN progress p ON s.id = p.scenario_id AND p.user_id = $1
      ORDER BY s.id
    `, [userId]);

    res.json({
      success: true,
      data: {
        scenarios: result.rows.map(row => ({
          id: row.id,
          title: row.title,
          difficultyLevel: row.difficulty_level,
          bestScore: row.best_score,
          attempted: row.attempted
        }))
      }
    });

  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'シナリオの取得に失敗しました'
      }
    });
  }
});

/**
 * GET /api/scenarios/:id
 * シナリオ詳細取得（単語・熟語含む）
 */
router.get('/:id', authenticate, async (req, res) => {
  const scenarioId = parseInt(req.params.id);

  if (isNaN(scenarioId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: '無効なシナリオIDです'
      }
    });
  }

  try {
    // シナリオ基本情報取得
    const scenarioResult = await db.query(
      'SELECT * FROM scenarios WHERE id = $1',
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCENARIO_NOT_FOUND',
          message: 'シナリオが見つかりません'
        }
      });
    }

    const scenario = scenarioResult.rows[0];

    // 単語・熟語情報取得
    const wordsResult = await db.query(`
      SELECT 
        w.id,
        w.word,
        w.word_type,
        w.meaning,
        sw.position
      FROM scenario_words sw
      JOIN words w ON sw.word_id = w.id
      WHERE sw.scenario_id = $1
      ORDER BY sw.position
    `, [scenarioId]);

    res.json({
      success: true,
      data: {
        id: scenario.id,
        title: scenario.title,
        sentenceEn: scenario.sentence_en,
        sentenceJa: scenario.sentence_ja,
        difficultyLevel: scenario.difficulty_level,
        words: wordsResult.rows.map(row => ({
          id: row.id,
          word: row.word,
          wordType: row.word_type,
          meaning: row.meaning,
          position: row.position
        }))
      }
    });

  } catch (error) {
    console.error('Get scenario detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'シナリオ詳細の取得に失敗しました'
      }
    });
  }
});

module.exports = router;