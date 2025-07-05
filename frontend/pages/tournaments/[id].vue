<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { API_ENDPOINTS } from '~/constants/api';
import { useToast } from 'vue-toastification';

interface Player {
	playerId: string;
	playerName: string;
	position: 'GK' | 'DF' | 'MF' | 'FW';
	team: string;
	isStarter: boolean;
	totalGoals: number;
	totalAssists: number;
}

interface Tournament {
	tournamentId: string;
	startDate: string;
	comment: string | null;
	wins: number;
	losses: number;
	mvpPlayerId: string | null;
	players: Player[];
}

const route = useRoute();
const tournament = ref<Tournament | null>(null); // 大会データ
const editableTournament = ref<Tournament | null>(null); // 編集用の大会データ
const loading = ref(true);
const error = ref<string | null>(null);
const isEditing = ref(false);
const isSaving = ref(false);
const displayPlayers = ref<Player[]>([]); // 表示用の選手データをrefで管理
const toast = useToast();

// パンくずリスト
const breadcrumbItems = [
	{
		name: '大会一覧',
		path: '/tournaments',
	},
	{
		name: '大会詳細',
	},
];

// 編集モードの切り替え
const toggleEditMode = () => {
	if (isEditing.value) {
		// 編集モードを終了する前に確認
		if (confirm('編集内容を破棄してよろしいですか？')) {
			isEditing.value = false;
			// 編集内容を元に戻す
			editableTournament.value = JSON.parse(JSON.stringify(tournament.value));
			// 表示用の選手データを更新
			displayPlayers.value = tournament.value?.players || [];
		}
	} else {
		isEditing.value = true;
		// 編集用のデータを複製
		editableTournament.value = JSON.parse(JSON.stringify(tournament.value));
		// 表示用の選手データを更新
		displayPlayers.value = editableTournament.value?.players || [];
	}
};

// 更新処理
const handleUpdate = async () => {
	if (!editableTournament.value) return;

	try {
		// 通信中フラグを立てる
		isSaving.value = true;

		// 表示用の選手データを編集用のデータに反映
		editableTournament.value.players = displayPlayers.value;
		const formattedStartDate = formatDate(editableTournament.value.startDate);

		// バリデーション
		const errors: string[] = [];

		// 選手のバリデーション
		const playerNames = displayPlayers.value.map((p) => p.playerName.trim());
		const duplicateNames = playerNames.filter(
			(name, index) => playerNames.indexOf(name) !== index
		);

		if (duplicateNames.length > 0) {
			errors.push(
				`以下の選手名が重複しています：${Array.from(
					new Set(duplicateNames)
				).join(', ')}`
			);
		}

		// スターター11人、ベンチ7人の構成チェック
		const starters = displayPlayers.value.filter((p) => p.isStarter);
		const bench = displayPlayers.value.filter((p) => !p.isStarter);

		if (starters.length !== 11) {
			errors.push(
				`スターティングメンバーは11人である必要があります（現在：${starters.length}人）`
			);
		}

		if (bench.length !== 7) {
			errors.push(
				`ベンチメンバーは7人である必要があります（現在：${bench.length}人）`
			);
		}

		// エラーがある場合は更新を中止
		if (errors.length > 0) {
			alert(errors.join('\n'));
			return;
		}

		const response = await fetch(
			API_ENDPOINTS.TOURNAMENTS.UPDATE(route.params.id as string),
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					startDate: formattedStartDate,
					comment: editableTournament.value.comment,
					wins: editableTournament.value.wins,
					losses: editableTournament.value.losses,
					mvpPlayerId: editableTournament.value.mvpPlayerId,
					players: displayPlayers.value.map((player) => ({
						playerId: player.playerId,
						playerName: player.playerName,
						position: player.position,
						team: player.team,
						isStarter: player.isStarter,
						totalGoals: player.totalGoals,
						totalAssists: player.totalAssists,
					})),
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		tournament.value = data;
		if (tournament.value?.players) {
			displayPlayers.value = tournament.value.players;
		}
		isEditing.value = false;
		toast.success('大会情報を更新しました');
	} catch (error) {
		console.error('Error updating tournament:', error);
		toast.error('大会情報を更新できませんでした');
	} finally {
		isSaving.value = false;
	}
};

// 大会詳細を取得する関数
const fetchTournament = async () => {
	try {
		const response = await fetch(
			API_ENDPOINTS.TOURNAMENTS.DETAIL(route.params.id as string)
		);
		const data = await response.json();
		tournament.value = data;

		if (tournament.value?.players) {
			displayPlayers.value = tournament.value.players;
		}
	} catch (error) {
		console.error('大会詳細取得エラー:', error);
	} finally {
		loading.value = false;
	}
};

// 日付データをフォーマット
// 日付をJSTとして処理し、YYYY-MM-DD形式に変換
const formatDate = (dateString: string | undefined) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// 選手をポジションとスターター状態でソート
const sortPlayers = (players: Player[] | undefined): Player[] => {
	if (!players) return [];
	const positionOrder = { GK: 4, DF: 3, MF: 2, FW: 1 };
	return [...players].sort((a, b) => {
		if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
		return positionOrder[a.position] - positionOrder[b.position];
	});
};

// 選手整頓ボタンのハンドラー
const handleSort = () => {
	displayPlayers.value = sortPlayers(displayPlayers.value);
};

// 勝率を計算
const winRate = computed(() => {
	if (!tournament.value) return 0;
	const total = tournament.value.wins + tournament.value.losses;
	return total === 0 ? 0 : Math.round((tournament.value.wins / total) * 100);
});

// 大会が終了しているかどうかを判定するcomputed
const isTournamentFinished = computed(() => {
	if (!tournament.value?.startDate) return false;

	const tournamentDate = new Date(tournament.value.startDate);
	const currentDate = new Date();

	// 大会開始日から4日後の日付を計算
	const finishDate = new Date(tournamentDate);
	finishDate.setDate(finishDate.getDate() + 4);

	return currentDate > finishDate;
});

onMounted(() => {
	fetchTournament();
});
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<!-- パンくずリスト -->
		<Breadcrumb :items="breadcrumbItems" />
		<!-- ヘッダー -->
		<header class="bg-white shadow">
			<div
				class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
			>
				<h1 class="text-3xl font-bold text-gray-900">大会詳細</h1>
				<div class="flex space-x-4">
					<template v-if="!isTournamentFinished">
						<button
							v-if="!isEditing"
							@click="toggleEditMode"
							class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
						>
							編集する
						</button>
						<div v-else class="flex space-x-2">
							<button
								@click="handleUpdate"
								:disabled="isSaving"
								class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								{{ isSaving ? '更新中...' : '更新する' }}
							</button>
							<button
								@click="toggleEditMode"
								:disabled="isSaving"
								class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								キャンセル
							</button>
						</div>
					</template>
					<template v-else>
						<button
							disabled
							class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
						>
							CF終了
						</button>
					</template>
					<NuxtLink
						to="/tournaments"
						class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						一覧に戻る
					</NuxtLink>
				</div>
			</div>
		</header>

		<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			<!-- ローディング -->
			<div v-if="loading" class="flex justify-center items-center h-64">
				<div
					class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
				></div>
			</div>

			<!-- エラー -->
			<div v-else-if="error" class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">エラー</h3>
						<div class="mt-2 text-sm text-red-700">
							{{ error }}
						</div>
					</div>
				</div>
			</div>

			<!-- 大会情報 -->
			<div v-else class="space-y-6">
				<!-- 基本情報カード -->
				<div class="bg-white shadow overflow-hidden sm:rounded-lg">
					<div class="px-4 py-5 sm:px-6">
						<h2 class="text-lg leading-6 font-medium text-gray-900">
							基本情報
						</h2>
					</div>
					<div class="border-t border-gray-200">
						<dl>
							<div
								class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
							>
								<dt class="text-sm font-medium text-gray-500">開催日</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{{
										formatDate(
											isEditing
												? editableTournament?.startDate
												: tournament?.startDate
										)
									}}
								</dd>
							</div>
							<div
								class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
							>
								<dt class="text-sm font-medium text-gray-500">成績</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									<div v-if="!isEditing" class="flex items-center space-x-4">
										<span class="font-semibold">
											{{ tournament?.wins }}勝{{ tournament?.losses }}敗
										</span>
										<div class="flex items-center">
											<div
												class="h-2 w-24 bg-gray-200 rounded-full overflow-hidden"
											>
												<div
													class="h-full bg-green-500"
													:style="{ width: `${winRate}%` }"
												></div>
											</div>
											<span class="ml-2 text-sm text-gray-600"
												>{{ winRate }}%</span
											>
										</div>
									</div>
									<div v-else class="flex items-center space-x-4">
										<div class="flex items-center space-x-2">
											<input
												v-model.number="editableTournament.wins"
												type="number"
												min="0"
												class="block w-20 p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<span>勝</span>
										</div>
										<div class="flex items-center space-x-2">
											<input
												v-model.number="editableTournament.losses"
												type="number"
												min="0"
												class="block w-20 p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
											<span>敗</span>
										</div>
									</div>
								</dd>
							</div>
							<div
								class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
							>
								<dt class="text-sm font-medium text-gray-500">コメント</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									<template v-if="!isEditing">
										{{ tournament?.comment || '（なし）' }}
									</template>
									<textarea
										v-else
										v-model="editableTournament.comment"
										rows="3"
										class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									></textarea>
								</dd>
							</div>
							<div
								class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
							>
								<dt class="text-sm font-medium text-gray-500">MVP選手</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									<template v-if="!isEditing">
										{{
											displayPlayers.find(
												(p) => p.playerId === tournament?.mvpPlayerId
											)?.playerName || '（未選択）'
										}}
									</template>
									<select
										v-else
										v-model="editableTournament.mvpPlayerId"
										class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									>
										<option value="">選手を選択</option>
										<option
											v-for="player in displayPlayers"
											:key="player.playerId"
											:value="player.playerId"
										>
											{{ player.playerName }} ({{ player.position }})
										</option>
									</select>
								</dd>
							</div>
						</dl>
					</div>
				</div>

				<!-- 選手一覧 -->
				<div class="bg-white shadow overflow-hidden sm:rounded-lg">
					<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
						<h2 class="text-lg leading-6 font-medium text-gray-900">
							選手一覧
						</h2>
						<button
							v-if="isEditing"
							@click="handleSort"
							class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							選手を整頓
						</button>
					</div>
					<div class="flex flex-col">
						<div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div
								class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
							>
								<div
									class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
								>
									<table class="min-w-full divide-y divide-gray-200">
										<thead class="bg-gray-50">
											<tr>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													選手名
												</th>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													ポジション
												</th>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													所属
												</th>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													得点
												</th>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													アシスト
												</th>
												<th
													scope="col"
													class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													スタメン
												</th>
											</tr>
										</thead>
										<tbody class="bg-white divide-y divide-gray-200">
											<tr
												v-for="player in displayPlayers"
												:key="player.playerId"
												:class="{ 'bg-indigo-50': player.isStarter }"
											>
												<td class="px-6 py-4 whitespace-nowrap">
													<div
														v-if="!isEditing"
														class="text-sm font-medium text-gray-900"
													>
														{{ player.playerName }}
													</div>
													<input
														v-else
														v-model="player.playerName"
														type="text"
														class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													/>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<template v-if="!isEditing">
														<span
															class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
															:class="{
																'bg-red-100 text-red-800':
																	player.position === 'FW',
																'bg-green-100 text-green-800':
																	player.position === 'MF',
																'bg-blue-100 text-blue-800':
																	player.position === 'DF',
																'bg-yellow-100 text-yellow-800':
																	player.position === 'GK',
															}"
														>
															{{ player.position }}
														</span>
													</template>
													<select
														v-else
														v-model="player.position"
														class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													>
														<option value="GK">GK</option>
														<option value="DF">DF</option>
														<option value="MF">MF</option>
														<option value="FW">FW</option>
													</select>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<div v-if="!isEditing" class="text-sm text-gray-500">
														{{ player.team }}
													</div>
													<input
														v-else
														v-model="player.team"
														type="text"
														class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													/>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<div v-if="!isEditing" class="text-sm text-gray-900">
														{{ player.totalGoals }}
													</div>
													<input
														v-else
														v-model.number="player.totalGoals"
														type="number"
														min="0"
														class="block w-20 p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													/>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<div v-if="!isEditing" class="text-sm text-gray-900">
														{{ player.totalAssists }}
													</div>
													<input
														v-else
														v-model.number="player.totalAssists"
														type="number"
														min="0"
														class="block w-20 p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													/>
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<template v-if="!isEditing">
														<span
															class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
															:class="{
																'bg-green-100 text-green-800': player.isStarter,
																'bg-red-100 text-red-800': !player.isStarter,
															}"
														>
															{{ player.isStarter ? 'スタメン' : 'ベンチ' }}
														</span>
													</template>
													<select
														v-else
														v-model="player.isStarter"
														class="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													>
														<option :value="true">スタメン</option>
														<option :value="false">ベンチ</option>
													</select>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>
