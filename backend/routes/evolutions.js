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

		// 結果をオブジェクトの配列に変換
		const players = results.map((player) => ({
			id: player.id,
			name: player.name,
			position: player.position,
			stats: {
				overall: player.overall,
				pace: player.pace,
				shooting: player.shooting,
				passing: player.passing,
				dribbling: player.dribbling,
				defending: player.defending,
				physical: player.physical,
			},
			createdAt: player.created_at,
			updatedAt: player.updated_at,
		}));

		res.json(players);
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
				stats: !stats,
			},
		});
	}

	// ステータス値のバリデーション
	const statFields = [
		'overall',
		'pace',
		'shooting',
		'passing',
		'dribbling',
		'defending',
		'physical',
	];
	const invalidStats = statFields.filter((field) => {
		const value = stats[field];
		return value === undefined || value < 50 || value > 99;
	});

	if (invalidStats.length > 0) {
		return res.status(400).json({
			message: 'ステータス値が不正です',
			invalidFields: invalidStats,
			validRange: { min: 50, max: 99 },
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
			stats.physical,
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
router.get('/player/:id', (req, res) => {
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
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, position, stats } = req.body;

	try {
		// トランザクション開始
		await db.beginTransaction();

		// 1. 現在の選手データを取得
		const [currentPlayer] = await db.query(
			'SELECT * FROM evolution_players WHERE id = ?',
			[id]
		);

		if (!currentPlayer) {
			await db.rollback();
			return res.status(404).json({
				message: 'エボリューション選手が見つかりません',
			});
		}

		// 2. 選手データを更新
		const updatePlayerQuery = `
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

		await db.query(updatePlayerQuery, [
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
		]);

		// 3. エボリューション履歴を追加
		const insertEvolutionQuery = `
            INSERT INTO evolutions (
                id,
                evolution_player_id,
                evolution_name,
                overall,
                pace,
                shooting,
                passing,
                dribbling,
                defending,
                physical
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

		await db.query(insertEvolutionQuery, [
			id,
			`Evolution ${new Date().toISOString().split('T')[0]}`,
			stats.overall,
			stats.pace,
			stats.shooting,
			stats.passing,
			stats.dribbling,
			stats.defending,
			stats.physical,
		]);

		// トランザクションをコミット
		await db.commit();

		// 更新後のデータを取得
		const [updatedPlayer] = await db.query(
			'SELECT * FROM evolution_players WHERE id = ?',
			[id]
		);

		res.json({
			message: 'エボリューション選手を更新しました',
			data: updatedPlayer,
		});
	} catch (err) {
		// エラーが発生した場合はロールバック
		await db.rollback();
		console.error('エボリューション選手更新エラー:', err);
		return res.status(500).json({
			message: 'エボリューション選手の更新に失敗しました',
		});
	}
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

// エボリューション履歴の登録
// POST /api/evolutions/:id/evolutions
router.post('/players/:id/history', async (req, res) => {
	const { id } = req.params;
	const {
		evolutionName, // エボリューション名
		stats, // 選手のスタッツ
	} = req.body;

	//  evolutionIDを生成
	const evolutionId = uuidv4();

	// エボリューション履歴を登録するSQLクエリ
	const insertEvolutionQuery = `
    INSERT INTO evolutions (
        id,
        evolution_player_id,
        evolution_name,
        overall,
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	// エボリューション履歴の登録
	db.query(
		insertEvolutionQuery,
		[
			evolutionId,
			id,
			evolutionName,
			stats.overall,
			stats.pace,
			stats.shooting,
			stats.passing,
			stats.dribbling,
			stats.defending,
			stats.physical,
		],
		(err, results) => {
			if (err) {
				console.error('エボリューション履歴登録エラー:', err);
				// 重複登録の場合は409 Conflictを返す
				if (err.code === 'ER_DUP_ENTRY') {
					return res.status(409).json({
						message: 'このエボリューション履歴は既に登録されています',
					});
				}
				// その他のエラーの場合は500 Internal Server Errorを返す
				return res.status(500).json({
					message: 'エボリューション履歴の登録に失敗しました',
					error: err.message,
				});
			}

			// 登録したエボリューション履歴を取得するSQLクエリ
			db.query(
				`SELECT
						id,
						evolution_player_id,
						evolution_name,
						overall,
						pace,
						shooting,
						passing,
						dribbling,
						defending,
						physical,
						created_at
				FROM evolutions
				WHERE id = ?`,
				[evolutionId],
				(err, results) => {
					if (err) {
						console.error('エボリューション履歴取得エラー:', err);
						return res.status(500).json({
							message: 'エボリューション履歴の取得に失敗しました',
							error: err.message,
						});
					}

					if (results.length === 0) {
						return res.status(500).json({
							message: 'エボリューション履歴の取得に失敗しました',
						});
					}

					const newEvolution = results[0];

					res.status(201).json({
						message: 'エボリューション履歴を登録しました',
						data: {
							id: newEvolution.id,
							playerId: id,
							evolutionName: newEvolution.evolution_name,
							stats: {
								overall: newEvolution.overall,
								pace: newEvolution.pace,
								shooting: newEvolution.shooting,
								passing: newEvolution.passing,
								dribbling: newEvolution.dribbling,
								defending: newEvolution.defending,
								physical: newEvolution.physical,
							},
							createdAt: newEvolution.created_at,
						},
					});
				}
			);
		}
	);
});

module.exports = router;
