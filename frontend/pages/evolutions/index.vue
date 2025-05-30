<template>
	<div class="container mx-auto p-4">
		<!-- パンくずリスト -->
		<Breadcrumb :items="breadcrumbItems" />
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">エボリューション選手一覧</h1>
		</div>

		<!-- 操作エリア -->
		<div class="flex justify-between items-center mb-6 space-x-4">
			<!-- 検索フィールド -->
			<input
				type="text"
				v-model="searchQuery"
				placeholder="選手名で検索"
				class="w-full md:w-96 px-4 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
			/>

			<div class="flex space-x-4">
				<!-- 並び替えセレクトボックス -->
				<div class="flex items-center space-x-1">
					<label class="text-sm font-medium text-gray-700"
						>並び替え（OVR）：</label
					>
					<select
						v-model="sortOrder"
						@change="handleSortChange"
						class="block w-40 rounded-md border-0 py-2 pl-2 pr-10 text-gray-900 bg-white ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm leading-6"
					>
						<option value="desc">高い順</option>
						<option value="asc">低い順</option>
					</select>
				</div>

				<!-- 新規登録ボタン -->
				<button
					@click="navigateTo('/evolutions/new')"
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					新規選手登録
				</button>
			</div>
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
							stats
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							操作
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					<tr v-for="player in filteredPlayers" :key="player.id">
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{{ player.name }}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{{ player.position }}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							<div class="flex items-center space-x-6">
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">OVR</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.overall
											: player.stats.overall
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">PAC</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.pace
											: player.stats.pace
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">SHO</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.shooting
											: player.stats.shooting
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">PAS</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.passing
											: player.stats.passing
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">DRI</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.dribbling
											: player.stats.dribbling
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">DEF</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.defending
											: player.stats.defending
									}}</span>
								</div>
								<div class="flex flex-col items-center">
									<span class="text-xs font-medium text-gray-500">PHY</span>
									<span class="text-base font-semibold text-gray-900">{{
										player.latestEvolution
											? player.latestEvolution.physical
											: player.stats.physical
									}}</span>
								</div>
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
							<div class="flex space-x-4">
								<button
									@click="navigateTo(`/evolutions/${player.id}`)"
									class="text-blue-600 hover:text-blue-900"
								>
									詳細
								</button>
								<button
									@click="onDeletePlayer(player.id)"
									class="text-red-600 hover:text-green-900"
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
</template>

<script setup lang="ts">
import { API_ENDPOINTS } from '~/constants/api';
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useDebounceFn } from '@vueuse/core';

interface Player {
	id: string;
	name: string;
	position: string;
	stats: {
		overall: number;
		pace: number;
		shooting: number;
		passing: number;
		dribbling: number;
		defending: number;
		physical: number;
	};
	latestEvolution: {
		overall: number;
		pace: number;
		shooting: number;
		passing: number;
		dribbling: number;
		defending: number;
		physical: number;
	};
}

const evolutionPlayers = ref<Player[]>([]);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const sortOrder = ref<'desc' | 'asc'>('desc'); // 並び替えの順序を管理
const toast = useToast();

// パンくずリスト
const breadcrumbItems = [
	{
		name: 'EVO選手一覧',
	},
];

// デバウンス処理
const updateDebouncedQuery = useDebounceFn((value: string) => {
	debouncedSearchQuery.value = value;
}, 300);

// 検索クエリの変更を監視
watch(searchQuery, (newValue) => {
	updateDebouncedQuery(newValue);
});

// 検索結果をフィルタリング
const filteredPlayers = computed(() => {
	if (!debouncedSearchQuery.value) return evolutionPlayers.value;

	const query = debouncedSearchQuery.value.toLowerCase();
	return evolutionPlayers.value.filter((player) =>
		player.name.toLowerCase().includes(query)
	);
});

// 大会一覧を取得する関数
const fetchEvolutionPlayers = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.EVOLUTIONS.LIST);
		const data = await response.json();
		evolutionPlayers.value = data;
		sortEvolutionPlayers();
	} catch (error) {
		console.error('エヴォリューション一覧一覧取得エラー:', error);
	}
};

fetchEvolutionPlayers();

// 並び替えの順序を変更する関数
const handleSortChange = (event: Event) => {
	const target = event.target as HTMLSelectElement;
	sortOrder.value = target.value as 'desc' | 'asc';
	sortEvolutionPlayers();
};

// エボリューション一覧を並び替える関数
const sortEvolutionPlayers = () => {
	evolutionPlayers.value.sort((a, b) => {
		const dateA = new Date(a.latestEvolution.overall).getTime();
		const dateB = new Date(b.latestEvolution.overall).getTime();
		return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
	});
};

const onDeletePlayer = async (id: string) => {
	if (confirm('本当に削除しますか？')) {
		try {
			const response = await fetch(`${API_ENDPOINTS.EVOLUTIONS.LIST}/${id}`, {
				method: 'DELETE',
			});
			if (response.ok) {
				toast.success(`エボリューション選手を削除しました`);
				fetchEvolutionPlayers();
			} else {
				toast.error('選手の削除に失敗しました');
			}
		} catch (error) {
			console.error('選手削除エラー:', error);
		}
	}
};
</script>
