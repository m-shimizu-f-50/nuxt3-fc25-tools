const express = require('express');
const router = express.Router();
const db = require('../db');

// ダッシュボード情報の取得
router.get('/', (req, res) => {
	const query = `
        WITH 
        -- 総試合数の計算
        total_matches AS (
            SELECT COUNT(*) * 15 as total_matches
            FROM tournaments
        ),
        -- 重複を除いた選手数の計算
        unique_players AS (
            SELECT DISTINCT name
            FROM players
        ),
        -- 総得点の計算
        total_goals AS (
            SELECT SUM(total_goals) as total_goals
            FROM players
        )
        SELECT 
            tm.total_matches,
            (SELECT COUNT(*) FROM unique_players) as total_players,
            tg.total_goals,
            ROUND(CAST(tg.total_goals AS FLOAT) / tm.total_matches, 2) as average_goals
        FROM total_matches tm
        CROSS JOIN total_goals tg
    `;

	db.query(query, (err, results) => {
		if (err) {
			console.error('ダッシュボード情報取得エラー:', err);
			return res.status(500).json({
				message: 'ダッシュボード情報の取得に失敗しました',
			});
		}

		// 結果を整形
		const dashboardData = {
			totalMatches: results[0].total_matches,
			totalPlayers: results[0].total_players,
			totalGoals: results[0].total_goals,
			averageGoals: results[0].average_goals
		};

		res.json({
			data: dashboardData,
			message: 'ダッシュボード情報の取得に成功しました'
		});
	});
});

module.exports = router;
