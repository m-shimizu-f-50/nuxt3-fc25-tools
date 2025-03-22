const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// エボリューション選手一覧の取得
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM evolution_players ORDER BY created_at DESC'
    );

    res.json({ data: rows });
  } catch (error) {
    console.error('エボリューション選手一覧取得エラー:', error);
    res.status(500).json({
      message: 'エボリューション選手一覧の取得に失敗しました',
    });
  }
});

// エボリューション選手の登録
router.post('/', async (req, res) => {
  const { name, position, stats } = req.body;
  const id = uuidv4();

  try {
    await pool.query(
      `INSERT INTO evolution_players (
        id, name, position, overall, pace, shooting, passing, dribbling, defending, physical
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        position,
        stats.overall,
        stats.pace,
        stats.shooting,
        stats.passing,
        stats.dribbling,
        stats.defending,
        stats.physical,
      ]
    );

    const [newPlayer] = await pool.query(
      'SELECT * FROM evolution_players WHERE id = ?',
      [id]
    );

    res.status(201).json({
      message: 'エボリューション選手を登録しました',
      data: newPlayer[0],
    });
  } catch (error) {
    console.error('エボリューション選手登録エラー:', error);
    res.status(500).json({
      message: 'エボリューション選手の登録に失敗しました',
    });
  }
});

// エボリューション選手の詳細取得
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [player] = await pool.query(
      'SELECT * FROM evolution_players WHERE id = ?',
      [id]
    );

    if (!player[0]) {
      return res.status(404).json({
        message: 'エボリューション選手が見つかりません',
      });
    }

    res.json({ data: player[0] });
  } catch (error) {
    console.error('エボリューション選手詳細取得エラー:', error);
    res.status(500).json({
      message: 'エボリューション選手の詳細取得に失敗しました',
    });
  }
});

// エボリューション選手の更新
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position, stats } = req.body;

  try {
    await pool.query(
      `UPDATE evolution_players SET 
        name = ?, 
        position = ?, 
        overall = ?, 
        pace = ?, 
        shooting = ?, 
        passing = ?, 
        dribbling = ?, 
        defending = ?, 
        physical = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        position,
        stats.overall,
        stats.pace,
        stats.shooting,
        stats.passing,
        stats.dribbling,
        stats.defending,
        stats.physical,
        id,
      ]
    );

    const [updatedPlayer] = await pool.query(
      'SELECT * FROM evolution_players WHERE id = ?',
      [id]
    );

    res.json({
      message: 'エボリューション選手を更新しました',
      data: updatedPlayer[0],
    });
  } catch (error) {
    console.error('エボリューション選手更新エラー:', error);
    res.status(500).json({
      message: 'エボリューション選手の更新に失敗しました',
    });
  }
});

// エボリューション選手の削除
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM evolution_players WHERE id = ?', [id]);
    res.json({
      message: 'エボリューション選手を削除しました',
    });
  } catch (error) {
    console.error('エボリューション選手削除エラー:', error);
    res.status(500).json({
      message: 'エボリューション選手の削除に失敗しました',
    });
  }
});

module.exports = router; 