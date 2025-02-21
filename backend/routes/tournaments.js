const express = require('express');
const router = express.Router();
const db = require('../db'); // データベース接続を管理するモジュール
const { v4: uuidv4 } = require('uuid');

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
      t.start_date DESC, p.total_goals DESC;
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
					tournamentId: row.tournament_id, // UUIDをそのまま使用
					startDate: row.start_date,
					wins: row.wins,
					losses: row.losses,
					mvpName: row.mvp_name,
					players: [],
				};
			}
			if (row.player_id) { // プレイヤーが存在する場合のみ追加
				tournaments[row.tournament_id].players.push({
					playerId: row.player_id, // UUIDをそのまま使用
					playerName: row.player_name,
					totalGoals: Number(row.total_goals) || 0,
				});
			}
		});

		// オブジェクトを配列に変換
		const tournamentList = Object.values(tournaments);

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

	// 大会IDを生成
	const tournamentId = uuidv4();

	// 大会情報を登録
	const insertTournamentQuery = `
    INSERT INTO tournaments (
      id,
      start_date,
      wins,
      losses
    ) VALUES (?, ?, 0, 0)
  `;

	db.query(insertTournamentQuery, [tournamentId, startDate], (err, results) => {
		if (err) {
			console.error('大会登録エラー:', err);
			return res.status(500).json({ error: '大会登録エラー' });
		}

		// 選手情報を登録
		const insertPlayersQuery = `
      INSERT INTO players (
        id,
        tournament_id,
        name,
        position,
        team,
        is_starter,
        total_goals,
        total_assists
      ) VALUES ?
    `;

		// 選手データの配列を作成
		const playersValues = players.map(player => [
			uuidv4(), // 選手IDを生成
			tournamentId,
			player.name,
			player.position,
			player.team,
			player.isStarter,
			0, // total_goals の初期値
			0  // total_assists の初期値
		]);

		db.query(insertPlayersQuery, [playersValues], (err, results) => {
			if (err) {
				console.error('選手登録エラー:', err);
				return res.status(500).json({ error: '選手登録エラー' });
			}

			// 登録した大会情報を取得
			const selectQuery = `
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

			db.query(selectQuery, [tournamentId], (err, results) => {
				if (err) {
					console.error('大会詳細取得エラー:', err);
					return res.status(500).json({ error: '大会詳細取得エラー' });
				}

				// レスポンスデータの整形
				const tournament = {
					tournamentId: results[0].tournament_id,
					startDate: results[0].start_date,
					comment: results[0].comment,
					wins: results[0].wins,
					losses: results[0].losses,
					mvpPlayerId: results[0].mvp_player_id,
					players: results.map(row => ({
						playerId: row.player_id,
						playerName: row.player_name,
						position: row.position,
						team: row.team,
						isStarter: !!row.is_starter,
						totalGoals: row.total_goals,
						totalAssists: row.total_assists
					}))
				};

				res.status(201).json(tournament);
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

/*
 * 大会情報更新API
 * PUT /tournaments/:id
 * 大会情報と選手情報を更新
 */
router.put('/:id', (req, res) => {
	const tournamentId = req.params.id;
	const { startDate, comment, wins, losses, players } = req.body;

	// まず大会情報を更新
	const updateTournamentQuery = `
    UPDATE tournaments
    SET
      start_date = ?,
      comment = ?,
      wins = ?,
      losses = ?
    WHERE id = ?
  `;

	db.query(
		updateTournamentQuery,
		[startDate, comment, wins, losses, tournamentId],
		(err, results) => {
			if (err) {
				console.error('大会更新エラー:', err);
				return res.status(500).json({ error: '大会更新エラー' });
			}

			// 次に選手情報を更新
			const updatePlayersQuery = `
      UPDATE players
      SET
        name = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN '${p.playerName}'`)
						.join(' ')}
          ELSE name
        END,
        position = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN '${p.position}'`)
						.join(' ')}
          ELSE position
        END,
        team = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN '${p.team}'`)
						.join(' ')}
          ELSE team
        END,
        is_starter = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN ${p.isStarter ? 1 : 0}`)
						.join(' ')}
          ELSE is_starter
        END,
        total_goals = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN ${p.totalGoals}`)
						.join(' ')}
          ELSE total_goals
        END,
        total_assists = CASE id
          ${players
						.map((p) => `WHEN '${p.playerId}' THEN ${p.totalAssists}`)
						.join(' ')}
          ELSE total_assists
        END
      WHERE tournament_id = ?
    `;

			db.query(updatePlayersQuery, [tournamentId], (err, results) => {
				if (err) {
					console.error('選手更新エラー:', err);
					return res.status(500).json({ error: '選手更新エラー' });
				}

				// 更新後のデータを取得
				const selectQuery = `
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

				db.query(selectQuery, [tournamentId], (err, results) => {
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
							totalGoals: row.total_goals,
							totalAssists: row.total_assists,
						})),
					};

					res.status(200).json(tournament);
				});
			});
		}
	);
});

/*
 * 大会削除API
 * DELETE /tournaments/:id
 * 大会情報と選手情報を削除
 */
router.delete('/:id', (req, res) => {
	const tournamentId = req.params.id;

	// 大会に紐づく選手を先に削除
	const deletePlayersQuery = `
    DELETE FROM players
    WHERE tournament_id = ?
  `;

	db.query(deletePlayersQuery, [tournamentId], (err, results) => {
		if (err) {
			console.error('選手削除エラー:', err);
			return res.status(500).json({ error: '選手削除エラー' });
		}

		// 大会を削除
		const deleteTournamentQuery = `
      DELETE FROM tournaments
      WHERE id = ?
    `;

		db.query(deleteTournamentQuery, [tournamentId], (err, results) => {
			if (err) {
				console.error('大会削除エラー:', err);
				return res.status(500).json({ error: '大会削除エラー' });
			}

			if (results.affectedRows === 0) {
				return res.status(404).json({ message: '大会が見つかりません' });
			}

			res.status(200).json({ message: '大会を削除しました' });
		});
	});
});

module.exports = router;
