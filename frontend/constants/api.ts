const BASE_URL =
	process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8890';

export const API_ENDPOINTS = {
	TOURNAMENTS: {
		CREATE: `${BASE_URL}/api/tournaments/create`,
		LIST: `${BASE_URL}/api/tournaments`,
		DETAIL: (id: string) => `${BASE_URL}/api/tournaments/${id}`,
		UPDATE: (id: string) => `${BASE_URL}/api/tournaments/${id}`,
		DELETE: (id: string) => `${BASE_URL}/api/tournaments/${id}`,
		LATEST_PLAYERS: `${BASE_URL}/api/tournaments/latest/players`,
	},
	EVOLUTIONS: {
		// エボリューションの作成
		CREATE: `${BASE_URL}/api/evolutions/create`,
		// エボリューションの一覧取得
		LIST: `${BASE_URL}/api/evolutions`,
		// エボリューション履歴の追加
		CREATE_HISTORY: (playerId: string) =>
			`${BASE_URL}/api/evolutions/players/${playerId}/history`,
		// エボリューションの更新
		UPDATE: (evolutionId: string) =>
			`${BASE_URL}/api/evolutions/${evolutionId}`,
		// プレイヤーのエボリューション履歴取得
		GET_EVOLUTIONS: (playerId: string) =>
			`${BASE_URL}/api/evolutions/players/${playerId}/history`,
		// エボリューションの削除
		DELETE: (evolutionId: string) =>
			`${BASE_URL}/api/evolutions/${evolutionId}`,
	},
} as const;
