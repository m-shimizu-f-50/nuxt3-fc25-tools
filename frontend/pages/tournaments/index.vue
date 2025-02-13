<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_ENDPOINTS } from '~/constants/api';
import { formatDate } from '~/utils/date';
import type { Router } from 'vue-router';

interface Tournament {
	tournamentId: number;
	startDate: string;
	wins: number;
	losses: number;
	mvpName: string;
	players: {
		playerId: number;
		playerName: string;
		totalGoals: number;
	}[];
}

const tournaments = ref<Tournament[]>([]);

// 大会一覧を取得する関数
const fetchTournaments = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.TOURNAMENTS.LIST);
		const data = await response.json();
		tournaments.value = data;
		console.log('大会一覧:', tournaments.value);
	} catch (error) {
		console.error('大会一覧取得エラー:', error);
	}
};

onMounted(() => {
	fetchTournaments();
});

// 勝率を計算する関数
const computeWinRate = (win: number, lose: number): string => {
	const total = win + lose;
	return total > 0 ? ((win / total) * 100).toFixed(1) + '%' : '0%';
};

// 勝利数に応じてランクを決定する関数
const computeRank = (win: number): number | string => {
	switch (true) {
		case win >= 15:
			return 1;
		case win >= 13:
			return 2;
		case win >= 11:
			return 3;
		case win >= 10:
			return 4;
		case win >= 9:
			return 5;
		case win >= 8:
			return 6;
		case win >= 7:
			return 7;
		case win >= 6:
			return 8;
		case win >= 4:
			return 9;
		case win < 4:
			return 10;
		default:
			return '-'; // こちらの処理は入らない想定
	}
};

// 得点者の名前をフォーマットする関数
const formatScorersList = (
	players: { playerName: string; totalGoals: number }[]
) => {
	const scorers = players
		.filter((player) => player.totalGoals > 0)
		.map((player) => `${player.playerName} (${player.totalGoals})`)
		.join(', ');

	return scorers || '-';
};

// 大会詳細ページに遷移する関数
const router: Router = useRouter();
const navigateToDetail = (tournamentId: number) => {
	router.push(`/tournaments/${tournamentId}`);
};
</script>

<template>
	<div class="container mx-auto p-4">
		<h1 class="text-2xl font-bold mb-4">CF 対戦データ</h1>
		<div class="flex justify-end mb-4">
			<button
				class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
				@click="$router.push('/tournaments/create')"
			>
				新規登録
			</button>
		</div>

		<!-- ローディング表示 -->
		<div v-if="!tournaments.length" class="text-center py-12">
			<div class="text-gray-500">データを読み込み中...</div>
		</div>
		<div v-else>
			<table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
				<thead
					class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal"
				>
					<tr>
						<th class="py-3 px-6 text-left">対戦日時</th>
						<th class="py-3 px-6 text-center">勝敗 (15試合)</th>
						<th class="py-3 px-6 text-center">総得点</th>
						<th class="py-3 px-6 text-center">得点者</th>
						<th class="py-3 px-6 text-center">MVP</th>
						<th class="py-3 px-6 text-center">ランク</th>
						<th class="py-3 px-6 text-center">詳細</th>
					</tr>
				</thead>
				<tbody class="text-gray-700">
					<tr
						v-for="tournament in tournaments"
						:key="tournament.tournamentId"
						class="border-b"
					>
						<td class="py-3 px-6">{{ formatDate(tournament.startDate) }}</td>
						<td class="py-3 px-6 text-center">
							<div class="flex justify-center">
								{{ tournament.wins }}勝 / {{ tournament.losses }}敗 ({{
									computeWinRate(tournament.wins, tournament.losses)
								}})
							</div>
						</td>
						<td class="py-3 px-6 text-center">
							{{
								tournament.players.reduce(
									(acc, player) => acc + player.totalGoals,
									0
								)
							}}
						</td>
						<td class="py-3 px-6 text-center">
							{{ formatScorersList(tournament.players) }}
						</td>
						<td class="py-3 px-6 text-center font-bold text-blue-500">
							{{ tournament.mvpName ?? '-' }}
						</td>
						<td class="py-3 px-6 text-center font-bold">
							{{
								tournament.wins === 0 && tournament.wins === 0
									? `-`
									: `Rank ${computeRank(tournament.wins)}`
							}}
						</td>
						<td class="py-3 px-6 text-center">
							<button
								class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
								@click="navigateToDetail(tournament.tournamentId)"
							>
								詳細
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
