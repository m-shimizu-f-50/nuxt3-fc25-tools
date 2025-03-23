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
		CREATE: `${BASE_URL}/api/evolutions/create`,
		LIST: `${BASE_URL}/api/evolutions`,
		DETAIL: (id: string) => `${BASE_URL}/api/evolutions/${id}`,
		UPDATE: (id: string) => `${BASE_URL}/api/evolutions/${id}`,
		DELETE: (id: string) => `${BASE_URL}/api/evolutions/${id}`,
		LATEST_PLAYERS: `${BASE_URL}/api/evolutions/latest/players`,
	},
} as const;
