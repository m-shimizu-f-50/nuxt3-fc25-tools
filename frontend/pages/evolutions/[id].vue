<template>
	<div class="container mx-auto px-4 py-8">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">エボリューション選手詳細</h1>
		</div>

		<!-- 基本情報カード -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
				<!-- 基本情報セクション -->
				<div class="lg:col-span-3">
					<h2 class="text-xl font-semibold mb-4">基本情報</h2>
					<div class="space-y-4">
						<div>
							<dt class="text-sm font-medium text-gray-500">選手名</dt>
							<dd class="mt-1 text-lg font-semibold text-gray-900">
								{{ player.name }}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">ポジション</dt>
							<dd class="mt-1 text-lg font-semibold text-gray-900">
								{{ player.position }}
							</dd>
						</div>
					</div>
				</div>

				<!-- 能力値・レーダーチャートセクション -->
				<div class="lg:col-span-9">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- 数値表示 -->
						<div class="grid grid-cols-3 gap-4">
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">OVR</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.overall
								}}</span>
							</div>
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">PAC</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.pace
								}}</span>
							</div>
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">SHO</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.shooting
								}}</span>
							</div>
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">PAS</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.passing
								}}</span>
							</div>
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">DEF</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.defending
								}}</span>
							</div>
							<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
								<span class="text-xs font-medium text-gray-500">PHY</span>
								<span class="text-xl font-bold text-gray-900">{{
									player.stats.physical
								}}</span>
							</div>
						</div>
						<!-- レーダーチャート -->
						<div class="w-full h-64">
							<Radar :data="chartData" :options="chartOptions" />
						</div>
					</div>
				</div>
			</div>
			<!-- <div>
					<h2 class="text-xl font-semibold mb-4">現在の能力値</h2>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">OVR</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.overall
							}}</span>
						</div>
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">PAC</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.pace
							}}</span>
						</div>
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">SHO</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.shooting
							}}</span>
						</div>
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">PAS</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.passing
							}}</span>
						</div>
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">DEF</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.defending
							}}</span>
						</div>
						<div class="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
							<span class="text-xs font-medium text-gray-500">PHY</span>
							<span class="text-xl font-bold text-gray-900">{{
								player.stats.physical
							}}</span>
						</div>
					</div>
				</div> -->
		</div>

		<!-- エボリューション履歴 -->
		<div class="space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-xl font-semibold">エボリューション履歴</h2>
				<button
					@click="addNewEvolution"
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
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
					:key="evolution.evolutionName"
					class="relative"
				>
					<div
						class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
					>
						<div class="flex justify-between items-start mb-4">
							<div class="flex-1">
								<template v-if="evolution.isEditing">
									<input
										v-model="evolution.evolutionName"
										type="text"
										class="w-full px-3 py-2 border rounded-md mb-4"
										placeholder="エボリューション名"
									/>
									<div class="grid grid-cols-3 md:grid-cols-6 gap-4">
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
												min="50"
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
												min="50"
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
												min="50"
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
												min="50"
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
												min="50"
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
												min="50"
												max="99"
											/>
										</div>
									</div>
									<div class="flex justify-end space-x-2 mt-4">
										<button
											@click="saveEvolution(index)"
											class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
										>
											保存
										</button>
										<button
											@click="cancelEvolution(index)"
											class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
										<span class="text-xs font-medium text-gray-500">OVR</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.overall
										}}</span>
									</div>
									<div class="flex flex-col items-center">
										<span class="text-xs font-medium text-gray-500">PAC</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.pace
										}}</span>
									</div>
									<div class="flex flex-col items-center">
										<span class="text-xs font-medium text-gray-500">SHO</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.shooting
										}}</span>
									</div>
									<div class="flex flex-col items-center">
										<span class="text-xs font-medium text-gray-500">PAS</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.passing
										}}</span>
									</div>
									<div class="flex flex-col items-center">
										<span class="text-xs font-medium text-gray-500">DEF</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.defending
										}}</span>
									</div>
									<div class="flex flex-col items-center">
										<span class="text-xs font-medium text-gray-500">PHY</span>
										<span class="text-lg font-bold text-gray-900">{{
											evolution.physical
										}}</span>
									</div>
									<button
										@click="editEvolution(index)"
										class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
						<div class="relative w-20 h-20 flex items-center justify-center">
							<img src="~/assets/images/arrow-down.png" alt="下向き矢印" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Radar } from 'vue-chartjs';
import {
	Chart as ChartJS,
	RadialLinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	RadialLinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend
);

const route = useRoute();
const id = route.params.id;

interface Stats {
	overall: number;
	pace: number;
	shooting: number;
	passing: number;
	defending: number;
	physical: number;
}

interface Evolution {
	evolutionName: string;
	overall: number;
	pace: number;
	shooting: number;
	passing: number;
	defending: number;
	physical: number;
	isEditing?: boolean;
}

interface Player {
	id: string;
	name: string;
	position: string;
	stats: Stats;
	evolutions: Evolution[];
}

// モックデータ
const player = ref<Player>({
	id: id as string,
	name: '山田太郎',
	position: 'FW',
	stats: {
		overall: 85,
		pace: 88,
		shooting: 90,
		passing: 82,
		defending: 75,
		physical: 80,
	},
	evolutions: [
		{
			evolutionName: 'エボリューション 3',
			overall: 85,
			pace: 88,
			shooting: 90,
			passing: 82,
			defending: 75,
			physical: 80,
		},
		{
			evolutionName: 'エボリューション 2',
			overall: 82,
			pace: 85,
			shooting: 87,
			passing: 80,
			defending: 73,
			physical: 78,
		},
		{
			evolutionName: 'エボリューション 1',
			overall: 80,
			pace: 83,
			shooting: 85,
			passing: 78,
			defending: 70,
			physical: 75,
		},
	],
});

// レーダーチャートのデータ
const chartData = computed(() => ({
	labels: ['OVR', 'PAC', 'SHO', 'PAS', 'DEF', 'PHY'],
	datasets: [
		{
			label: '現在の能力値',
			data: [
				player.value.stats.overall,
				player.value.stats.pace,
				player.value.stats.shooting,
				player.value.stats.passing,
				player.value.stats.defending,
				player.value.stats.physical,
			],
			backgroundColor: 'rgba(59, 130, 246, 0.2)',
			borderColor: 'rgb(59, 130, 246)',
			borderWidth: 2,
		},
	],
}));

// レーダーチャートのオプション
const chartOptions = {
	scales: {
		r: {
			beginAtZero: false,
			min: 50,
			max: 99,
			ticks: {
				stepSize: 10,
			},
			grid: {
				color: 'rgba(0, 0, 0, 0.1)',
			},
		},
	},
	plugins: {
		legend: {
			display: false,
		},
	},
};

// 新規エボリューション追加
const addNewEvolution = () => {
	const newEvolution: Evolution = {
		evolutionName: '新規エボリューション',
		overall: 50,
		pace: 50,
		shooting: 50,
		passing: 50,
		defending: 50,
		physical: 50,
		isEditing: true,
	};
	player.value.evolutions.unshift(newEvolution);
};

// エボリューション編集
const editEvolution = (index: number) => {
	player.value.evolutions[index].isEditing = true;
};

// エボリューション保存
const saveEvolution = (index: number) => {
	player.value.evolutions[index].isEditing = false;
	// TODO: APIを呼び出して保存
};

// エボリューションキャンセル
const cancelEvolution = (index: number) => {
	if (player.value.evolutions[index].evolutionName === '新規エボリューション') {
		player.value.evolutions.splice(index, 1);
	} else {
		player.value.evolutions[index].isEditing = false;
	}
};
</script>
