const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続を管理するモジュール

// 新しい大会と選手を登録するエンドポイント
router.post('/', (req, res) => {
	const { startDate, players } = req.body;

	// バリデーション
	if (!startDate || !players || players.length !== 18) {
		return res.status(400).json({ error: '必要なフィールドが不足しています' });
	}

	// トランザクションを開始
	db.beginTransaction((err) => {
		if (err) {
			console.error('トランザクション開始エラー:', err);
			return res.status(500).json({ error: 'トランザクション開始エラー' });
		}

		// 大会を登録
		const tournamentQuery = 'INSERT INTO tournaments (start_date) VALUES (?)';
		db.query(tournamentQuery, [startDate], (err, result) => {
			if (err) {
				console.error('大会登録エラー:', err);
				return db.rollback(() => {
					res.status(500).json({ error: '大会登録エラー' });
				});
			}

			const tournamentId = result.insertId;

			// 選手を登録
			const playerQuery = `
      INSERT INTO players (tournament_id, name, position, team, is_starter)
      VALUES ?
    `;
			const playerValues = players.map((player) => [
				tournamentId,
				player.name,
				player.position,
				player.team,
				player.isStarter,
			]);

			db.query(playerQuery, [playerValues], (err) => {
				if (err) {
					console.error('選手登録エラー:', err);
					return db.rollback(() => {
						res.status(500).json({ error: '選手登録エラー' });
					});
				}

				// トランザクションをコミット
				db.commit((err) => {
					if (err) {
						console.error('トランザクションコミットエラー:', err);
						return db.rollback(() => {
							res.status(500).json({ error: 'トランザクションコミットエラー' });
						});
					}
					res.status(201).json({ message: '大会と選手が登録されました' });
				});
			});
		});
	});
});

module.exports = router;
