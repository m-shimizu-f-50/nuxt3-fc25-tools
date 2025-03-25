<template>
	<div class="container mx-auto px-4 py-8">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">エボリューション選手一覧</h1>
			<button
				@click="navigateTo('/evolutions/new')"
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				新規選手登録
			</button>
		</div>

		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							選手名
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							ポジション
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							エヴォリューション回数
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							操作
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					<tr v-for="player in players" :key="player.id">
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{{ player.name }}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{{ player.position }}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{{ player.trainingCount }}回
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
							<div class="flex space-x-4">
								<button
									@click="navigateTo(`/evolution/${player.id}`)"
									class="text-blue-600 hover:text-blue-900"
								>
									詳細
								</button>
								<button
									@click="navigateTo(`/evolution/${player.id}/training/new`)"
									class="text-green-600 hover:text-green-900"
								>
									トレーニング
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { API_ENDPOINTS } from '~/constants/api';
import { ref, onMounted } from 'vue';

interface Player {
	id: string;
	name: string;
	position: string;
	trainingCount: number;
}

// モックデータ
const players = ref<Player[]>([
	{
		id: '1',
		name: '山田太郎',
		position: 'FW',
		trainingCount: 5,
	},
	{
		id: '2',
		name: '鈴木一郎',
		position: 'MF',
		trainingCount: 3,
	},
	{
		id: '3',
		name: '佐藤花子',
		position: 'DF',
		trainingCount: 2,
	},
]);

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString('ja-JP');
};

const evolutionPlayers = ref<any[]>([]);

// 大会一覧を取得する関数
const fetchEvolutionPlayers = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.EVOLUTIONS.LIST);
		const data = await response.json();
		evolutionPlayers.value = data;
		console.log('エヴォリューション一覧:', evolutionPlayers.value);
	} catch (error) {
		console.error('エヴォリューション一覧一覧取得エラー:', error);
	}
};

onMounted(() => {
	fetchEvolutionPlayers();
});
</script>
