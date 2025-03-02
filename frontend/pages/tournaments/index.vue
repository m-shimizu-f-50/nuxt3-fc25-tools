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
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-bold text-gray-900">CF 対戦データ</h1>
			
			<!-- 操作エリア -->
			<div class="flex items-center space-x-6">
				<!-- 並び替えセレクトボックス -->
				<div class="flex items-center space-x-4">
					<label class="text-sm font-medium text-gray-700">並び替え：</label>
					<select
						v-model="sortOrder"
						@change="handleSortChange"
						class="block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm leading-6"
					>
						<option value="desc">新しい順</option>
						<option value="asc">古い順</option>
					</select>
				</div>

				<!-- 新規登録ボタン -->
				<button
					@click="$router.push('/tournaments/create')"
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					新規登録
				</button>
			</div>
		</div>

		<!-- テーブル -->
		<div class="mt-4 flow-root bg-white rounded-lg shadow">
			<div class="overflow-x-auto">
				<div class="inline-block min-w-full">
					<table class="min-w-full">
						<thead>
							<tr class="border-b border-gray-200 bg-gray-50">
								<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">対戦日時</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">勝敗 (15試合)</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[100px]">総得点</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ゴール(上位３名)</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">アシスト(上位３名)</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MVP</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ランク</th>
								<th scope="col" class="relative py-3.5 pl-3 pr-4">
									<span class="sr-only">操作</span>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="(tournament, index) in tournaments"
								:key="tournament.tournamentId"
								:class="[
									index === tournaments.length - 1 ? '' : 'border-b border-gray-100',
									'hover:bg-gray-50 transition-colors duration-200'
								]"
							>
								<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
									<span class="font-medium text-gray-900">{{ formatDate(tournament.startDate) }}</span>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									<div class="flex items-center space-x-2">
										<span class="font-medium text-gray-900">
											{{ tournament.wins }}勝{{ tournament.losses }}敗
										</span>
										<div class="flex items-center">
											<div class="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
												<div
													class="h-full bg-green-400 transition-all duration-300"
													:style="{
														width: `${computeWinRate(tournament.wins, tournament.losses)}`,
													}"
												></div>
											</div>
											<span class="ml-2 text-xs text-gray-500">
												{{ computeWinRate(tournament.wins, tournament.losses) }}
											</span>
										</div>
									</div>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-center min-w-[100px]">
									<span class="text-gray-900">
										{{
											tournament.players.reduce(
												(acc, player) => acc + player.totalGoals,
												0
											)
										}}
									</span>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									<span class="text-gray-900">{{ formatScorersList(tournament.players) }}</span>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									<span class="text-gray-900">{{ formatAssistList(tournament.players) }}</span>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									<span class="font-medium text-blue-500">{{ tournament.mvpName ?? '-' }}</span>
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									<span class="font-medium text-gray-900">
										{{
											tournament.wins === 0 && tournament.losses === 0
												? `-`
												: `Rank ${computeRank(tournament.wins)}`
										}}
									</span>
								</td>
								<td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
									<div class="flex justify-end space-x-2">
										<button
											@click="navigateToDetail(tournament.tournamentId)"
											class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										>
											詳細
										</button>
										<button
											@click="handleDeleteTournament(tournament.tournamentId)"
											class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
