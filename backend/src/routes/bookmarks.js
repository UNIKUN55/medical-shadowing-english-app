const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/bookmarks
 * ブックマーク一覧取得
 */
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      SELECT 
        b.id,
        b.word_id,
        w.word,
        w.meaning,
        w.word_type,
        b.scenario_id,
        s.title as scenario_title,
        s.sentence_en as example_sentence,
        b.created_at
      FROM bookmarks b
      JOIN words w ON b.word_id = w.id
      JOIN scenarios s ON b.scenario_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        bookmarks: result.rows.map(row => ({
          id: row.id,
          wordId: row.word_id,
          word: row.word,
          meaning: row.meaning,
          wordType: row.word_type,
          scenarioId: row.scenario_id,
          scenarioTitle: row.scenario_title,
          exampleSentence: row.example_sentence,
          createdAt: row.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'ブックマークの取得に失敗しました'
      }
    });
  }
});

/**
 * POST /api/bookmarks
 * ブックマーク追加
 */
router.post('/', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const { wordId, scenarioId } = req.body;

  // バリデーション
  if (!wordId || !scenarioId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'wordIdとscenarioIdは必須です'
      }
    });
  }

  try {
    // 単語の存在確認
    const wordCheck = await db.query(
      'SELECT * FROM words WHERE id = $1',
      [wordId]
    );

    if (wordCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORD_NOT_FOUND',
          message: '単語が見つかりません'
        }
      });
    }

    // シナリオの存在確認
    const scenarioCheck = await db.query(
      'SELECT sentence_en FROM scenarios WHERE id = $1',
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

    // 既存のブックマーク確認
    const existingBookmark = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND word_id = $2',
      [userId, wordId]
    );

    if (existingBookmark.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_BOOKMARKED',
          message: '既にブックマークされています'
        }
      });
    }

    // ブックマーク追加
    const result = await db.query(`
      INSERT INTO bookmarks (user_id, word_id, scenario_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [userId, wordId, scenarioId]);

    const word = wordCheck.rows[0];
    const exampleSentence = scenarioCheck.rows[0].sentence_en;

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        wordId: word.id,
        word: word.word,
        meaning: word.meaning,
        scenarioId,
        exampleSentence
      }
    });

  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'ブックマークの追加に失敗しました'
      }
    });
  }
});

/**
 * DELETE /api/bookmarks/:id
 * ブックマーク削除
 */
router.delete('/:id', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const bookmarkId = parseInt(req.params.id);

  if (isNaN(bookmarkId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: '無効なブックマークIDです'
      }
    });
  }

  try {
    // ブックマークの存在確認と所有者チェック
    const bookmarkCheck = await db.query(
      'SELECT id FROM bookmarks WHERE id = $1 AND user_id = $2',
      [bookmarkId, userId]
    );

    if (bookmarkCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKMARK_NOT_FOUND',
          message: 'ブックマークが見つかりません'
        }
      });
    }

    // 削除
    await db.query(
      'DELETE FROM bookmarks WHERE id = $1',
      [bookmarkId]
    );

    res.json({
      success: true,
      data: {
        id: bookmarkId,
        deleted: true
      }
    });

  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'ブックマークの削除に失敗しました'
      }
    });
  }
});

module.exports = router;