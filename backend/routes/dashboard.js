const express = require('express');
const router = express.Router();
const db = require('../db');

// ダッシュボード情報の取得
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

module.exports = router;
