<template>
	<div class="container mx-auto">
		<!-- パンくずリスト -->
		<Breadcrumb :items="breadcrumbItems" />
		<div v-if="isLoading" class="flex justify-center items-center h-64">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
			></div>
		</div>
		<div v-else>
			<div class="flex justify-between items-center mb-4">
				<h1 class="text-3xl font-bold">エボリューション選手詳細</h1>
			</div>
			<div class="flex flex-col lg:flex-row gap-8">
				<div class="w-full lg:w-5/12">
					<!-- 基本情報カード -->
					<div
						class="bg-white rounded-lg shadow-lg p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]"
					>
						<div class="gap-6">
							<!-- 基本情報セクション -->
							<div class="">
								<!-- <h2 class="text-xl font-semibold mb-2">基本情報</h2> -->
								<div class="flex space-x-4 mb-2">
									<div>
										<dt class="text-sm font-medium text-gray-500">選手名</dt>
										<dd class="mt-1 font-semibold text-gray-900">
											{{ player.name }}
										</dd>
										<dt class="text-sm font-medium text-gray-500">
											ポジション
										</dt>
										<dd class="mt-1 font-semibold text-gray-900">
											{{ player.position }}
										</dd>
									</div>

									<div
										class="m-5 flex flex-col items-center py-2 px-16 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">OVR</span>
										<span class="font-bold text-gray-900">{{
											displayValues.overall
										}}</span>
									</div>
								</div>
							</div>

							<!-- エボリューション詳細 -->
							<div class="flex gap-2 mb-4">
								<input
									v-model="player.evolutionDetailUrl"
									type="text"
									class="w-1/2 px-3 py-2 border rounded-md"
									:class="{
										'bg-gray-100 text-gray-500 border-gray-300': isEditUrl,
										'bg-white text-gray-900 border-gray-400': !isEditUrl,
									}"
									placeholder="エボリューション詳細URL"
									:disabled="isEditUrl"
								/>
								<button
									v-if="!isEditUrl"
									@click="updateEvolutionDetailUrl"
									class="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
								>
									設定
								</button>
								<button
									v-if="isEditUrl"
									@click="copyEvolutionDetailUrl"
									class="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
								>
									リンクコピー
								</button>
								<button
									@click="toggleEditUrl"
									class="px-2 py-1 bg-gray-600 text-xs text-white rounded-md hover:bg-gray-700"
								>
									{{ isEditUrl ? '編集' : 'キャンセル' }}
								</button>
							</div>

							<!-- 能力値・レーダーチャートセクション -->
							<div class="mt-4">
								<!-- 数値表示 -->
								<div class="grid grid-cols-3 gap-2 mb-4">
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">PAC</span>
										<span class="font-bold text-gray-900">{{
											displayValues.pace
										}}</span>
									</div>
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">SHO</span>
										<span class="font-bold text-gray-900">{{
											displayValues.shooting
										}}</span>
									</div>
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">PAS</span>
										<span class="font-bold text-gray-900">{{
											displayValues.passing
										}}</span>
									</div>
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">DRI</span>
										<span class="font-bold text-gray-900">{{
											displayValues.dribbling
										}}</span>
									</div>
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">DEF</span>
										<span class="font-bold text-gray-900">{{
											displayValues.defending
										}}</span>
									</div>
									<div
										class="flex flex-col items-center p-1 bg-gray-50 rounded-lg"
									>
										<span class="text-xs font-medium text-gray-500">PHY</span>
										<span class="font-bold text-gray-900">{{
											displayValues.physical
										}}</span>
									</div>
								</div>
								<!-- レーダーチャート -->

								<PlayerEvolutionRadarChart :stats="activeStatus" />
							</div>
						</div>
					</div>
				</div>

				<div class="w-full lg:w-7/12">
					<!-- エボリューション履歴 -->
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<h2 class="text-xl font-semibold">エボリューション履歴</h2>
							<button
								@click="addNewEvolution"
								class="px-4 py-2 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									></path>
								</svg>
								<span>新規追加</span>
							</button>
						</div>
						<div class="space-y-12">
							<div
								v-for="(evolution, index) in player.evolutions"
								:key="evolution.id"
								class="relative"
							>
								<div
									class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
									@click="changeActiveStatus(index)"
									:class="{
										'border-2 border-blue-500': activeIndex === index,
									}"
									:style="{
										'background-color':
											activeIndex === index && !evolution.isEditing
												? '#e0f7fa'
												: '#ffffff',
									}"
								>
									<div class="flex justify-between items-start">
										<div class="flex-1">
											<template v-if="evolution.isEditing">
												<input
													v-model="evolution.evolutionName"
													type="text"
													class="w-full px-3 py-2 border rounded-md mb-2"
													placeholder="エボリューション名"
												/>
												<div class="grid grid-cols-3 md:grid-cols-7 gap-3">
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>OVR</span
														>
														<input
															v-model.number="evolution.overall"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>PAC</span
														>
														<input
															v-model.number="evolution.pace"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>SHO</span
														>
														<input
															v-model.number="evolution.shooting"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>PAS</span
														>
														<input
															v-model.number="evolution.passing"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>DRI</span
														>
														<input
															v-model.number="evolution.dribbling"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>DEF</span
														>
														<input
															v-model.number="evolution.defending"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
													<div
														class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
													>
														<span class="text-xs font-medium text-gray-500 mb-1"
															>PHY</span
														>
														<input
															v-model.number="evolution.physical"
															type="number"
															class="w-full px-2 py-1 border rounded-md text-center text-lg font-bold"
															min="0"
															max="99"
														/>
													</div>
												</div>
												<div class="flex justify-end space-x-2 mt-4">
													<button
														@click="saveEvolution(index)"
														class="px-4 py-2 bg-green-600 text-xs text-white rounded-md hover:bg-green-700"
													>
														保存
													</button>
													<button
														@click="cancelEvolution(index)"
														class="px-4 py-2 bg-red-600 text-xs text-white rounded-md hover:bg-red-700"
													>
														キャンセル
													</button>
												</div>
											</template>
											<template v-else>
												<h3 class="text-lg font-semibold text-gray-900">
													{{ evolution.evolutionName }}
												</h3>
											</template>
										</div>
										<div class="flex items-center space-x-4">
											<template v-if="!evolution.isEditing">
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>OVR</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.overall
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>PAC</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.pace
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>SHO</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.shooting
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>PAS</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.passing
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>DRI</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.dribbling
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>DEF</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.defending
													}}</span>
												</div>
												<div class="flex flex-col items-center">
													<span class="text-xs font-medium text-gray-500"
														>PHY</span
													>
													<span class="text-lg font-bold text-gray-900">{{
														evolution.physical
													}}</span>
												</div>
												<button
													v-if="
														index === 0 &&
														evolution.evolutionName !== '初期状態'
													"
													@click="editEvolution(index)"
													class="px-3 py-2 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
												>
													編集
												</button>
											</template>
										</div>
									</div>
								</div>
								<!-- 矢印アイコン -->
								<div
									v-if="index < player.evolutions.length - 1"
									class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
									style="top: calc(100% + 1.5rem)"
								>
									<div
										class="relative w-20 h-20 flex items-center justify-center"
									>
										<img
											src="~/assets/images/arrow-down.png"
											alt="下向き矢印"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_ENDPOINTS } from '~/constants/api';
import PlayerEvolutionRadarChart from '~/components/charts/PlayerEvolutionRadarChart.vue';
import Breadcrumb from '~/components/Breadcrumb.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useToggle } from '@vueuse/core';

const route = useRoute();
const toast = useToast();
const id = route.params.id;

interface Stats {
	overall: number;
	pace: number;
	shooting: number;
	passing: number;
	dribbling: number;
	defending: number;
	physical: number;
}

interface Evolution {
	id?: string;
	evolutionName: string;
	overall: number;
	pace: number;
	shooting: number;
	passing: number;
	dribbling: number;
	defending: number;
	physical: number;
	isEditing?: boolean;
}

interface Player {
	id: string;
	name: string;
	position: string;
	evolutionDetailUrl: string;
	stats: Stats;
	evolutions: Evolution[];
}

// パンくずリスト
const breadcrumbItems = [
	{
		name: 'EVO選手一覧',
		path: '/evolutions',
	},
	{
		name: 'EVO選手詳細',
	},
];

// ローディング状態
const isLoading = ref<boolean>(true);
// エボリューションURLの編集状態
const isEditUrl = ref<boolean>(true);
const oldEvolutionDetailUrl = ref<string>('');

// 選手データの初期値
const player = ref<Player>({
	id: '',
	name: '',
	position: '',
	evolutionDetailUrl: '',
	stats: {
		overall: 0,
		pace: 0,
		shooting: 0,
		passing: 0,
		dribbling: 0,
		defending: 0,
		physical: 0,
	},
	evolutions: [],
});

// アクティブインデックス
const activeIndex = ref<number>(0);

// アクティブステータス
const activeStatus = ref<Stats>({
	overall: 0,
	pace: 0,
	shooting: 0,
	passing: 0,
	dribbling: 0,
	defending: 0,
	physical: 0,
});

// 表示用の値
const displayValues = ref<Stats>({
	overall: 0,
	pace: 0,
	shooting: 0,
	passing: 0,
	dribbling: 0,
	defending: 0,
	physical: 0,
});

// エボリューションURLの編集トグル
const toggleEditUrl = () => {
	isEditUrl.value = !isEditUrl.value;
	if (isEditUrl.value) {
		// キャンセルされた場合、元のURLに戻す
		player.value.evolutionDetailUrl = oldEvolutionDetailUrl.value;
	} else {
		// 編集モードに入るときは、現在のURLを保存
		oldEvolutionDetailUrl.value = player.value.evolutionDetailUrl;
	}
};

// アニメーション更新関数
const isAnimating = ref(false);
const pendingIndex = ref<number | null>(null);
const debounceTimeout = ref<number | null>(null);

const changeActiveStatus = (index: number) => {
	if (index === activeIndex.value) return;

	// アニメーション中の場合
	if (isAnimating.value) {
		// 保留中のインデックスを更新
		pendingIndex.value = index;
		return;
	}

	// デバウンス処理
	if (debounceTimeout.value) {
		clearTimeout(debounceTimeout.value);
	}

	debounceTimeout.value = window.setTimeout(() => {
		// 新しいステータスを設定
		const newStatus = {
			overall: player.value.evolutions[index].overall,
			pace: player.value.evolutions[index].pace,
			shooting: player.value.evolutions[index].shooting,
			passing: player.value.evolutions[index].passing,
			dribbling: player.value.evolutions[index].dribbling,
			defending: player.value.evolutions[index].defending,
			physical: player.value.evolutions[index].physical,
		};

		// アクティブステータスを即座に更新
		activeStatus.value = newStatus;
		activeIndex.value = index;

		// アニメーション開始時間を記録
		const startTime = performance.now();
		const duration = 1000; // アニメーション時間（ミリ秒）

		// アニメーション開始
		isAnimating.value = true;

		// アニメーション更新関数
		const updateAnimation = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// イージング関数（スムーズな変化）
			const easedProgress =
				progress < 0.5
					? 2 * progress * progress
					: -1 + (4 - 2 * progress) * progress;

			// 各ステータスを同時に更新
			const stats = [
				'overall',
				'pace',
				'shooting',
				'passing',
				'dribbling',
				'defending',
				'physical',
			] as const;
			stats.forEach((stat) => {
				const startValue = displayValues.value[stat];
				const endValue = newStatus[stat];
				const currentValue = Math.round(
					startValue + (endValue - startValue) * easedProgress
				);
				displayValues.value[stat] = currentValue;
			});

			if (progress < 1) {
				requestAnimationFrame(updateAnimation);
			} else {
				// アニメーション終了時に最終値を設定
				activeStatus.value = newStatus;
				activeIndex.value = index;
				isAnimating.value = false;

				// 保留中のインデックスがある場合は、そのインデックスに対してアニメーションを開始
				if (pendingIndex.value !== null) {
					const nextIndex = pendingIndex.value;
					pendingIndex.value = null;
					changeActiveStatus(nextIndex);
				}
			}
		};

		// アニメーションを開始
		requestAnimationFrame(updateAnimation);
	}, 300); // 300ミリ秒のデバウンス時間
};

// 選手データをAPIから取得
const fetchPlayerData = async () => {
	try {
		const response = await axios.get(
			API_ENDPOINTS.EVOLUTIONS.GET_PLAYER(id as string)
		);

		const playerData = response.data.data;
		if (!playerData) {
			throw new Error('選手データが見つかりません');
		}

		// 初期値（エボリューション前）のデータを作成
		const initialEvolution = {
			id: 'initial',
			evolutionName: '初期状態',
			overall: playerData.stats.overall,
			pace: playerData.stats.pace,
			shooting: playerData.stats.shooting,
			passing: playerData.stats.passing,
			dribbling: playerData.stats.dribbling,
			defending: playerData.stats.defending,
			physical: playerData.stats.physical,
		};

		// エボリューション履歴の配列を作成（初期値を先頭に追加）
		const evolutions = [...playerData.evolutions, initialEvolution];

		player.value = {
			id: playerData.id,
			name: playerData.name,
			position: playerData.position,
			evolutionDetailUrl: playerData.evolutionDetailUrl,
			stats: {
				overall: playerData.stats.overall,
				pace: playerData.stats.pace,
				shooting: playerData.stats.shooting,
				passing: playerData.stats.passing,
				dribbling: playerData.stats.dribbling,
				defending: playerData.stats.defending,
				physical: playerData.stats.physical,
			},
			evolutions: evolutions,
		};

		// アクティブステータスを初期化
		activeStatus.value = {
			overall: evolutions ? evolutions[0].overall : playerData.stats.overall,
			pace: evolutions ? evolutions[0].pace : playerData.stats.pace,
			shooting: evolutions ? evolutions[0].shooting : playerData.stats.shooting,
			passing: evolutions ? evolutions[0].passing : playerData.stats.passing,
			dribbling: evolutions
				? evolutions[0].dribbling
				: playerData.stats.dribbling,
			defending: evolutions
				? evolutions[0].defending
				: playerData.stats.defending,
			physical: evolutions ? evolutions[0].physical : playerData.stats.physical,
		};

		// displayValuesを初期化
		displayValues.value = {
			overall: activeStatus.value.overall,
			pace: activeStatus.value.pace,
			shooting: activeStatus.value.shooting,
			passing: activeStatus.value.passing,
			dribbling: activeStatus.value.dribbling,
			defending: activeStatus.value.defending,
			physical: activeStatus.value.physical,
		};

		isLoading.value = false;
	} catch (error) {
		console.error('選手データ取得エラー:', error);
		isLoading.value = false;
	}
};

fetchPlayerData();

// 新規エボリューション追加
const addNewEvolution = () => {
	const newEvolution: Evolution = {
		// idは設定しない（新規であることを示す）
		evolutionName: '',
		overall: player.value.evolutions[0].overall,
		pace: player.value.evolutions[0].pace,
		shooting: player.value.evolutions[0].shooting,
		passing: player.value.evolutions[0].passing,
		dribbling: player.value.evolutions[0].dribbling,
		defending: player.value.evolutions[0].defending,
		physical: player.value.evolutions[0].physical,
		isEditing: true,
	};
	player.value.evolutions.unshift(newEvolution);
};

// エボリューション編集
const editEvolution = (index: number) => {
	player.value.evolutions[index].isEditing = true;
};

// エボリューション保存
const saveEvolution = async (index: number) => {
	try {
		const evolution = player.value.evolutions[index];
		const evolutionData = {
			evolutionName: evolution.evolutionName,
			stats: {
				overall: evolution.overall,
				pace: evolution.pace,
				shooting: evolution.shooting,
				passing: evolution.passing,
				dribbling: evolution.dribbling,
				defending: evolution.defending,
				physical: evolution.physical,
			},
		};

		let response;

		if (!evolution?.id) {
			// 新規作成の場合
			response = await axios.post(
				API_ENDPOINTS.EVOLUTIONS.CREATE_HISTORY(player.value.id),
				evolutionData
			);

			// レスポンスから返ってきたIDを設定
			player.value.evolutions[index].id = response.data.data.id;
		} else {
			// 更新の場合
			response = await axios.put(
				API_ENDPOINTS.EVOLUTIONS.UPDATE_HISTORY(evolution.id),
				evolutionData
			);
		}

		// 編集モードを解除
		player.value.evolutions[index].isEditing = false;

		// 成功メッセージ
		const action = evolution.id ? '更新' : '登録';
		toast.success(`エボリューション選手を${action}しました`);
	} catch (error) {
		console.error('エボリューション保存エラー:', error);
		toast.error('エボリューション選手の保存に失敗しました');
	}
};

// エボリューション詳細URLを更新
const updateEvolutionDetailUrl = async () => {
	console.log('updateEvolutionDetailUrl', player.value.evolutionDetailUrl);

	try {
		await axios.put(API_ENDPOINTS.EVOLUTIONS.UPDATE_URL(player.value.id), {
			evolutionDetailUrl: player.value.evolutionDetailUrl,
		});

		toast.success('エボリューション詳細URLを更新しました');
		isEditUrl.value = true; // 編集モードを終了
	} catch (error: any) {
		if (error.response?.status === 400) {
			toast.error('有効なURL形式ではありません');
		}
	}
};

// エボリューション詳細URLをコピー
const copyEvolutionDetailUrl = () => {
	navigator.clipboard.writeText(player.value.evolutionDetailUrl);
	toast.success('エボリューション詳細URLをコピーしました');
};

// エボリューションキャンセル
const cancelEvolution = (index: number) => {
	if (player.value.evolutions[index].id) {
		// 編集モードを解除
		player.value.evolutions[index].isEditing = false;
		return;
	}
	player.value.evolutions.splice(index, 1);
};
</script>
