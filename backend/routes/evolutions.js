const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// エボリューション選手一覧の取得
router.get('/', (req, res) => {
	/**
	 * エボリューション選手一覧と各選手の最新エボリューション情報を取得するクエリ
	 *
	 * 1. メインクエリ（evolution_playersテーブル）
	 *    - 全てのエボリューション選手の基本情報を取得
	 *    - LEFT JOINで最新のエボリューション情報を結合
	 *
	 * 2. サブクエリ（evolutionsテーブル）
	 *    - ROW_NUMBER()で各選手ごとにエボリューションを時系列で番号付け
	 *    - PARTITION BY evolution_player_idで選手ごとにグループ化
	 *    - ORDER BY created_at DESCで新しい順にソート
	 *    - rn = 1で各選手の最新のエボリューションのみを取得
	 *
	 * 3. 結合条件
	 *    - ep.id = e.evolution_player_idで選手IDで結合
	 *    - e.rn = 1で最新のエボリューションのみを選択
	 *
	 * 4. ソート
	 *    - ORDER BY ep.created_at DESCで選手の登録日時が新しい順にソート
	 */
	const query = `
    SELECT 
        ep.*,  -- 選手の基本情報
        e.evolution_name,  -- 最新エボリューション名
        e.overall as evolution_overall,  -- 最新エボリューションの総合値
        e.pace as evolution_pace,  -- 最新エボリューションのスピード
        e.shooting as evolution_shooting,  -- 最新エボリューションのシュート
        e.passing as evolution_passing,  -- 最新エボリューションのパス
        e.dribbling as evolution_dribbling,  -- 最新エボリューションのドリブル
        e.defending as evolution_defending,  -- 最新エボリューションのディフェンス
        e.physical as evolution_physical,  -- 最新エボリューションのフィジカル
        e.created_at as evolution_created_at  -- 最新エボリューションの作成日時
    FROM evolution_players ep
    LEFT JOIN (
        SELECT 
            evolution_player_id,
            evolution_name,
            overall,
            pace,
            shooting,
            passing,
            dribbling,
            defending,
            physical,
            created_at,
            -- 各選手ごとにエボリューションを時系列で番号付け
            ROW_NUMBER() OVER (
                PARTITION BY evolution_player_id  -- 選手IDでグループ化
                ORDER BY created_at DESC  -- 作成日時の降順でソート
            ) as rn
        FROM evolutions
    ) e ON ep.id = e.evolution_player_id AND e.rn = 1  -- 最新のエボリューションのみを結合
    ORDER BY ep.created_at DESC  -- 選手の登録日時の降順でソート
`;

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
			latestEvolution: player.evolution_name
				? {
						overall: player.evolution_overall,
						pace: player.evolution_pace,
						shooting: player.evolution_shooting,
						passing: player.evolution_passing,
						dribbling: player.evolution_dribbling,
						defending: player.evolution_defending,
						physical: player.evolution_physical,
				  }
				: null,
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
		return value === undefined || value < 0 || value > 99;
	});

	if (invalidStats.length > 0) {
		return res.status(400).json({
			message: 'ステータス値が不正です',
			invalidFields: invalidStats,
			validRange: { min: 0, max: 99 },
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
router.get('/player/:id', async (req, res) => {
	const { id } = req.params;

	// 1. 選手の基本情報を取得
	db.query(
		`SELECT 
            id,
            name,
            position,
            overall,
            pace,
            shooting,
            passing,
            dribbling,
            defending,
            physical,
						evolution_detail_url
        FROM evolution_players 
        WHERE id = ?`,
		[id],
		(err, playerResults) => {
			if (err) {
				console.error('選手情報取得エラー:', err);
				return res.status(500).json({
					message: '選手の詳細情報の取得に失敗しました',
					error: err.message,
				});
			}

			if (!playerResults[0]) {
				return res.status(404).json({
					message: '選手が見つかりません',
				});
			}

			const player = playerResults[0];

			// 2. 選手のエボリューション履歴を取得
			db.query(
				`SELECT 
                    id,
                    evolution_name,
                    overall,
                    pace,
                    shooting,
                    passing,
                    dribbling,
                    defending,
                    physical
                FROM evolutions
                WHERE evolution_player_id = ?
                ORDER BY created_at DESC`,
				[id],
				(err, evolutionResults) => {
					if (err) {
						console.error('エボリューション履歴取得エラー:', err);
						return res.status(500).json({
							message: 'エボリューション履歴の取得に失敗しました',
							error: err.message,
						});
					}

					// 3. レスポンスデータを整形
					const response = {
						data: {
							id: player.id,
							name: player.name,
							position: player.position,
							evolutionDetailUrl: player.evolution_detail_url,
							stats: {
								overall: player.overall,
								pace: player.pace,
								shooting: player.shooting,
								passing: player.passing,
								dribbling: player.dribbling,
								defending: player.defending,
								physical: player.physical,
							},
							evolutions: evolutionResults
								? evolutionResults.map((evolution) => ({
										id: evolution.id,
										evolutionName: evolution.evolution_name,
										overall: evolution.overall,
										pace: evolution.pace,
										shooting: evolution.shooting,
										passing: evolution.passing,
										dribbling: evolution.dribbling,
										defending: evolution.defending,
										physical: evolution.physical,
								  }))
								: [],
						},
					};

					res.status(200).json(response);
				}
			);
		}
	);
});

// エボリューション選手の更新
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, position, stats, evolutionDetailUrl } = req.body;

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
								evolution_detail_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

		await db.query(updatePlayerQuery, [
			name,
			position,
			evolutionDetailUrl,
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

// エボリューション履歴の更新
// PUT /api/evolutions/:id/evolutions
router.put('/players/:id/history', (req, res) => {
	const { id } = req.params;
	const { evolutionName, stats } = req.body;

	// エボリューション履歴を更新するSQLクエリ
	const updateEvolutionQuery = `
		UPDATE evolutions SET 
				evolution_name = ?, 
				overall = ?, 
				pace = ?, 
				shooting = ?, 
				passing = ?, 
				dribbling = ?, 
				defending = ?, 
				physical = ?
		WHERE id = ?
	`;

	db.query(
		updateEvolutionQuery,
		[
			evolutionName,
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
				console.error('エボリューション履歴更新エラー:', err);
				return res.status(500).json({
					message: 'エボリューション履歴の更新に失敗しました',
					error: err.message,
				});
			}

			if (results.affectedRows === 0) {
				return res.status(404).json({
					message: 'エボリューション履歴が見つかりません',
				});
			}

			res.json({
				message: 'エボリューション履歴を更新しました',
			});
		}
	);
});

// エボリューション詳細URLの更新
router.put('/players/:id/url', (req, res) => {
	const { id } = req.params;
	const { evolutionDetailUrl } = req.body;

	// バリデーション
	if (!evolutionDetailUrl) {
		return res.status(400).json({
			message: 'エボリューション詳細URLが指定されていません',
		});
	}

	// URLの形式チェック（簡易的なバリデーション）
	const urlPattern = /^https?:\/\/.+|^\/.+$/;
	if (!urlPattern.test(evolutionDetailUrl)) {
		return res.status(400).json({
			message: '有効なURL形式ではありません',
		});
	}

	// エボリューション詳細URLを更新するSQLクエリ
	const updateUrlQuery = `
		UPDATE evolution_players SET 
				evolution_detail_url = ?,
				updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`;

	db.query(updateUrlQuery, [evolutionDetailUrl, id], (err, results) => {
		if (err) {
			console.error('エボリューション詳細URL更新エラー:', err);
			return res.status(500).json({
				message: 'エボリューション詳細URLの更新に失敗しました',
				error: err.message,
			});
		}

		if (results.affectedRows === 0) {
			return res.status(404).json({
				message: 'エボリューション選手が見つかりません',
			});
		}

		// 更新後のデータを取得
		db.query(
			'SELECT id, name, evolution_detail_url FROM evolution_players WHERE id = ?',
			[id],
			(err, results) => {
				if (err) {
					console.error('更新データ取得エラー:', err);
					return res.status(500).json({
						message: '更新データの取得に失敗しました',
						error: err.message,
					});
				}

				res.json({
					message: 'エボリューション詳細URLを更新しました',
					data: {
						id: results[0].id,
						name: results[0].name,
						evolutionDetailUrl: results[0].evolution_detail_url,
					},
				});
			}
		);
	});
});
module.exports = router;
