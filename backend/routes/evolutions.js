const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// エボリューション選手一覧の取得
router.get('/', (req, res) => {
	const query = 'SELECT * FROM evolution_players ORDER BY created_at DESC';

	db.query(query, (err, results) => {
		if (err) {
			console.error('エボリューション選手一覧取得エラー:', err);
			return res.status(500).json({
				message: 'エボリューション選手一覧の取得に失敗しました',
			});
		}

		res.json({ data: results });
	});
});

// エボリューション選手の登録
router.post('/create', (req, res) => {
	const { name, position, stats } = req.body;
	const id = uuidv4();

	// 必須項目のチェック
	if (!name || !position || !stats) {
		return res.status(400).json({
			message: '必須項目が不足しています',
			required: {
				name: !name,
				position: !position,
				stats: !stats
			}
		});
	}

	// ステータス値のバリデーション
	const statFields = ['overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
	const invalidStats = statFields.filter(field => {
		const value = stats[field];
		return value === undefined || value < 50 || value > 99;
	});

	if (invalidStats.length > 0) {
		return res.status(400).json({
			message: 'ステータス値が不正です',
			invalidFields: invalidStats,
			validRange: { min: 50, max: 99 }
		});
	}

	// 大会情報を登録
	const insertEvolutionQuery = `
    INSERT INTO evolution_players (
      id, name, position, overall, pace, shooting, passing, dribbling, defending, physical
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

	db.query(
		insertEvolutionQuery,
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
			stats.physical
		],
		(err, results) => {
			if (err) {
				console.error('エボリューション選手登録エラー:', err);
				return res.status(500).json({
					message: 'エボリューション選手の登録に失敗しました',
				});
			}

			// 登録したデータを取得
			db.query(
				'SELECT * FROM evolution_players WHERE id = ?',
				[id],
				(err, newPlayer) => {
					if (err) {
						console.error('登録データ取得エラー:', err);
						return res.status(500).json({
							message: '登録データの取得に失敗しました',
						});
					}

					res.status(201).json({
						message: 'エボリューション選手を登録しました',
						data: newPlayer[0],
					});
				}
			);
		}
	);
});

// エボリューション選手の詳細取得
router.get('/:id', (req, res) => {
	const { id } = req.params;

	db.query(
		'SELECT * FROM evolution_players WHERE id = ?',
		[id],
		(err, results) => {
			if (err) {
				console.error('エボリューション選手詳細取得エラー:', err);
				return res.status(500).json({
					message: 'エボリューション選手の詳細取得に失敗しました',
				});
			}

			if (!results[0]) {
				return res.status(404).json({
					message: 'エボリューション選手が見つかりません',
				});
			}

			res.json({ data: results[0] });
		}
	);
});

// エボリューション選手の更新
router.put('/:id', (req, res) => {
	const { id } = req.params;
	const { name, position, stats } = req.body;

	// 必須項目のチェック
	if (!name || !position || !stats) {
		return res.status(400).json({
			message: '必須項目が不足しています',
			required: {
				name: !name,
				position: !position,
				stats: !stats
			}
		});
	}

	// ステータス値のバリデーション
	const statFields = ['overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
	const invalidStats = statFields.filter(field => {
		const value = stats[field];
		return value === undefined || value < 50 || value > 99;
	});

	if (invalidStats.length > 0) {
		return res.status(400).json({
			message: 'ステータス値が不正です',
			invalidFields: invalidStats,
			validRange: { min: 50, max: 99 }
		});
	}

	const updateQuery = `
    UPDATE evolution_players SET 
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
    WHERE id = ?
  `;

	db.query(
		updateQuery,
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
		],
		(err, results) => {
			if (err) {
				console.error('エボリューション選手更新エラー:', err);
				return res.status(500).json({
					message: 'エボリューション選手の更新に失敗しました',
				});
			}

			if (results.affectedRows === 0) {
				return res.status(404).json({
					message: 'エボリューション選手が見つかりません',
				});
			}

			// 更新後のデータを取得
			db.query(
				'SELECT * FROM evolution_players WHERE id = ?',
				[id],
				(err, updatedPlayer) => {
					if (err) {
						console.error('更新データ取得エラー:', err);
						return res.status(500).json({
							message: '更新データの取得に失敗しました',
						});
					}

					res.json({
						message: 'エボリューション選手を更新しました',
						data: updatedPlayer[0],
					});
				}
			);
		}
	);
});

// エボリューション選手の削除
router.delete('/:id', (req, res) => {
	const { id } = req.params;

	db.query(
		'DELETE FROM evolution_players WHERE id = ?',
		[id],
		(err, results) => {
			if (err) {
				console.error('エボリューション選手削除エラー:', err);
				return res.status(500).json({
					message: 'エボリューション選手の削除に失敗しました',
				});
			}

			if (results.affectedRows === 0) {
				return res.status(404).json({
					message: 'エボリューション選手が見つかりません',
				});
			}

			res.json({
				message: 'エボリューション選手を削除しました',
			});
		}
	);
});

module.exports = router;
