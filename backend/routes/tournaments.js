const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続を管理するモジュール

/*
 * 大会一覧取得API
 * GET /tournaments
 */
router.get('/', (req, res) => {
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

/*
 * 大会作成API
 * POST /tournaments/create
 */
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

/*
 * 大会詳細取得API
 * GET /tournaments/:id
 */
router.get('/:id', async (req, res) => {
	const tournamentId = req.params.id;

	// 大会情報と選手情報を結合して取得するクエリ
	const query = `
    SELECT 
      t.id as tournament_id,
      t.start_date,
      t.comment,
      t.wins,
      t.losses,
      t.mvp_player_id,
      p.id as player_id,
      p.name as player_name,
      p.position,
      p.team,
      p.is_starter,
      p.total_goals,
      p.total_assists
    FROM tournaments t
    LEFT JOIN players p ON t.id = p.tournament_id
    WHERE t.id = ?
  `;

	db.query(query, [tournamentId], (err, results) => {
		if (err) {
			console.error('大会詳細取得エラー:', err);
			return res.status(500).json({ error: '大会詳細取得エラー' });
		}

		if (results.length === 0) {
			return res.status(404).json({ message: '大会が見つかりません' });
		}

		// 大会データの整形
		const tournament = {
			tournamentId: results[0].tournament_id,
			startDate: results[0].start_date,
			comment: results[0].comment,
			wins: results[0].wins,
			losses: results[0].losses,
			mvpPlayerId: results[0].mvp_player_id,
			players: results.map((row) => ({
				playerId: row.player_id,
				playerName: row.player_name,
				position: row.position,
				team: row.team,
				isStarter: !!row.is_starter,
				totalGoals: Number(row.total_goals),
				totalAssists: Number(row.total_assists),
			})),
		};

		res.status(200).json(tournament);
	});
});

module.exports = router;
