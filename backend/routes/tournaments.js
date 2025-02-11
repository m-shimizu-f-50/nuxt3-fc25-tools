const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続を管理するモジュール

// 大会一覧を取得
router.get('/', (req, res) => {
	// 暫定のクエリ
	const query = `
    SELECT
      t.id AS tournament_id,
      t.start_date,
      t.wins,
      t.losses,
      p.id AS player_id,
      p.name AS player_name,
      SUM(p.total_goals) AS total_goals,
      mvp.name AS mvp_name
    FROM
      tournaments t
    LEFT JOIN
      players p ON p.tournament_id = t.id
    LEFT JOIN
      players mvp ON t.mvp_player_id = mvp.id
    GROUP BY
      t.id, p.id, mvp.id
    ORDER BY
      t.id, p.total_goals DESC;
  `;

	db.query(query, (err, results) => {
		if (err) {
			console.error('大会一覧取得エラー:', err);
			return res.status(500).json({ error: '大会一覧取得エラー' });
		}
		// 大会ごとに選手をリスト化
		const tournaments = {};
		results.forEach((row) => {
			if (!tournaments[row.tournament_id]) {
				tournaments[row.tournament_id] = {
					startDate: row.start_date,
					wins: row.wins,
					losses: row.losses,
					mvpName: row.mvp_name,
					players: [],
				};
			}
			tournaments[row.tournament_id].players.push({
				playerId: Number(row.player_id),
				playerName: row.player_name,
				totalGoals: Number(row.total_goals),
			});
		});

		// オブジェクトを配列に変換
		const tournamentList = Object.keys(tournaments).map((id) => ({
			tournamentId: Number(id),
			startDate: tournaments[id].startDate,
			wins: tournaments[id].wins,
			losses: tournaments[id].losses,
			mvpName: tournaments[id].mvpName,
			players: tournaments[id].players,
		}));

		res.status(200).json(tournamentList);
	});
});

// 新しい大会を登録
router.post('/create', (req, res) => {
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
