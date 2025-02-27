<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_ENDPOINTS } from '~/constants/api';
import { formatDate } from '~/utils/date';
import axios from 'axios';
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
		totalAssists: number;
	}[];
}

const tournaments = ref<Tournament[]>([]);
const sortOrder = ref<'desc' | 'asc'>('desc'); // 並び替えの順序を管理

// 大会一覧を取得する関数
const fetchTournaments = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.TOURNAMENTS.LIST);
		const data = await response.json();
		tournaments.value = data;
		console.log('大会一覧:', tournaments.value);
		// 初期状態でも並び替えを適用
		sortTournaments();
	} catch (error) {
		console.error('大会一覧取得エラー:', error);
	}
};

// 並び替えの順序を変更する関数
const handleSortChange = (event: Event) => {
	const target = event.target as HTMLSelectElement;
	sortOrder.value = target.value as 'desc' | 'asc';
	sortTournaments();
};

// 大会を並び替える関数
const sortTournaments = () => {
	tournaments.value.sort((a, b) => {
		const dateA = new Date(a.startDate).getTime();
		const dateB = new Date(b.startDate).getTime();
		return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
	});
};

// 大会を削除する関数
const handleDeleteTournament = async (tournamentId: number) => {
	console.log('削除対象の大会ID:', tournamentId);
	// 削除確認
	if (
		!confirm(
			'この大会を削除してもよろしいですか？\n※この操作は取り消せません。'
		)
	) {
		return;
	}

	try {
		await axios.delete(API_ENDPOINTS.TOURNAMENTS.DELETE(String(tournamentId)));
		alert('大会を削除しました');
		// 削除成功後、該当の大会を配列から削除(フロント側でも削除)
		tournaments.value = tournaments.value.filter(
			(tournament) => tournament.tournamentId !== tournamentId
		);
		// 一覧画面へ遷移
		router.push('/tournaments');
	} catch (err) {
		console.error('Error deleting tournament:', err);
		alert('削除に失敗しました');
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
		.sort((a, b) => b.totalGoals - a.totalGoals)
		.slice(0, 3)
		.map((player) => `${player.playerName} (${player.totalGoals})`)
		.join(', ');

	return scorers || '-';
};

// アシスト者の名前をフォーマットする関数
const formatAssistList = (
	players: { playerName: string; totalAssists: number }[]
) => {
	const assists = players
		.filter((player) => player.totalAssists > 0)
		.sort((a, b) => b.totalAssists - a.totalAssists)
		.slice(0, 3)
		.map((player) => `${player.playerName} (${player.totalAssists})`)
		.join(', ');

	return assists || '-';
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
		<div class="flex justify-between items-center mb-4">
			<!-- 並び替えセレクトボックス -->
			<div class="relative">
				<label class="inline-flex items-center space-x-2">
					<span class="text-sm font-medium text-gray-700">並び替え：</span>
					<div class="relative">
						<select
							v-model="sortOrder"
							@change="handleSortChange"
							class="appearance-none bg-white pl-3 pr-10 py-2 text-sm leading-5 rounded-lg border border-gray-300 
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
							hover:border-gray-400 transition-colors duration-200
							shadow-sm"
						>
							<option value="desc">新しい順</option>
							<option value="asc">古い順</option>
						</select>
						<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
							<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
				</label>
			</div>
			<!-- 新規登録ボタン -->
			<button
				class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 
				focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
				shadow-sm"
				@click="$router.push('/tournaments/create')"
			>
				新規登録
			</button>
		</div>

		<!-- ローディング表示 -->
		<div v-if="!tournaments.length" class="text-center py-12">
			<div class="text-gray-500">データを読み込み中...</div>
		</div>
		<div v-else class="overflow-x-auto">
			<div class="inline-block min-w-full">
				<div class="overflow-hidden">
					<table class="min-w-full bg-white shadow-md rounded-lg">
						<thead
							class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal whitespace-nowrap"
						>
							<tr>
								<th class="py-3 px-6 text-left">対戦日時</th>
								<th class="py-3 px-6 text-center">勝敗 (15試合)</th>
								<th class="py-3 px-6 text-center">総得点</th>
								<th class="py-3 px-6 text-center min-w-[200px]">
									ゴール(上位３名)
								</th>
								<th class="py-3 px-6 text-center min-w-[200px]">
									アシスト(上位３名)
								</th>
								<th class="py-3 px-6 text-center">MVP</th>
								<th class="py-3 px-6 text-center">ランク</th>
								<th class="py-3 px-6 text-center">詳細</th>
							</tr>
						</thead>
						<tbody class="text-gray-700">
							<tr
								v-for="tournament in tournaments"
								:key="tournament.tournamentId"
								class="border-b whitespace-nowrap hover:bg-gray-50"
							>
								<td class="py-3 px-6">
									{{ formatDate(tournament.startDate) }}
								</td>
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
								<td class="py-3 px-6 text-center">
									{{ formatAssistList(tournament.players) }}
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
								<td class="py-4 px-6 text-center">
									<div class="flex justify-center space-x-2">
										<!-- 詳細ボタン -->
										<button
											class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
											@click="navigateToDetail(tournament.tournamentId)"
										>
											詳細
										</button>

										<!-- 削除ボタン -->
										<button
											class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
											@click="handleDeleteTournament(tournament.tournamentId)"
										>
											削除
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>
