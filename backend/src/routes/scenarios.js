const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/scenarios/categories
 * シーンカテゴリ一覧取得
 */
router.get('/categories', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        sc.id,
        sc.name_en,
        sc.name_ja,
        sc.description,
        sc.display_order,
        COUNT(s.id) as scenario_count
      FROM scene_categories sc
      LEFT JOIN scenarios s ON s.category_id = sc.id
      GROUP BY sc.id, sc.name_en, sc.name_ja, sc.description, sc.display_order
      ORDER BY sc.display_order
    `);
    
    res.json({
      success: true,
      data: {
        categories: result.rows.map(row => ({
          id: row.id,
          nameEn: row.name_en,
          nameJa: row.name_ja,
          description: row.description,
          displayOrder: row.display_order,
          scenarioCount: parseInt(row.scenario_count)
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'カテゴリの取得に失敗しました'
      }
    });
  }
});

/**
 * GET /api/scenarios
 * シナリオ一覧取得（進捗情報付き、カテゴリフィルタ対応）
 */
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const { category_id } = req.query;

  try {
    let query = `
      SELECT 
        s.id,
        s.title,
        s.sentence_en,
        s.sentence_ja,
        s.difficulty_level,
        s.category_id,
        sc.name_ja as category_name,
        p.best_score,
        CASE WHEN p.id IS NOT NULL THEN true ELSE false END as attempted
      FROM scenarios s
      LEFT JOIN scene_categories sc ON s.category_id = sc.id
      LEFT JOIN progress p ON s.id = p.scenario_id AND p.user_id = $1
    `;
    
    const params = [userId];
    
    if (category_id) {
      query += ' WHERE s.category_id = $2';
      params.push(category_id);
    }
    
    query += ' ORDER BY s.id';
    
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        scenarios: result.rows.map(row => ({
          id: row.id,
          title: row.title,
          sentenceEn: row.sentence_en,
          sentenceJa: row.sentence_ja,
          difficultyLevel: row.difficulty_level,
          categoryId: row.category_id,
          categoryName: row.category_name,
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