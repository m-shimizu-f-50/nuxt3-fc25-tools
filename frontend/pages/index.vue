<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-3xl font-bold mb-8">ダッシュボード</h1>

		<!-- 統計カード -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-2">総試合数</h3>
				<p class="text-3xl font-bold text-blue-600">{{ dashboardData.totalMatches }}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-2">総プレイヤー数</h3>
				<p class="text-3xl font-bold text-green-600">{{ dashboardData.totalPlayers }}</p></p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-2">平均得点</h3>
				<p class="text-3xl font-bold text-purple-600">{{ dashboardData.averageGoals }}</p>
			</div>
		</div>

		<!-- グラフセクション -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-4">勝率推移</h3>
				<div class="h-64">
					<WinRateChart />
				</div>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-4">平均得点推移</h3>
				<div class="h-64">
					<AverageScoreChart />
				</div>
			</div>
		</div>

		<!-- ランキングセクション -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-4">最多得点者 TOP 10</h3>
				<div class="space-y-4">
					<div
						v-for="i in 10"
						:key="i"
						class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
					>
						<div class="flex items-center">
							<span
								class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3"
								>{{ i }}</span
							>
							<span>プレイヤー{{ i }}</span>
						</div>
						<span class="font-semibold">{{ 20 - i }}得点</span>
					</div>
				</div>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold mb-4">最多アシスト TOP 10</h3>
				<div class="space-y-4">
					<div
						v-for="i in 10"
						:key="i"
						class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
					>
						<div class="flex items-center">
							<span
								class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3"
								>{{ i }}</span
							>
							<span>プレイヤー{{ i }}</span>
						</div>
						<span class="font-semibold">{{ 15 - i }}アシスト</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import WinRateChart from '~/components/charts/WinRateChart.vue';
import AverageScoreChart from '~/components/charts/AverageScoreChart.vue';
import { API_ENDPOINTS } from '~/constants/api';
import { ref } from 'vue';

interface DashboardData {
	totalMatches: number;
	totalPlayers: number;
	totalGoals: string;
	averageGoals: number;
}
const dashboardData = ref<DashboardData>();

// ダッシュボードデータの取得
const fetchDashboardData = async () => {
	try {
		const response = await fetch(API_ENDPOINTS.DASHBOARD.GET_SUMMARY);
		const data = await response.json();

		console.log('ダッシュボードデータ:', data);
		dashboardData.value = {
			totalMatches: data.totalMatches,
			totalPlayers: data.totalPlayers,
			totalGoals: data.totalGoals,
			averageGoals: data.averageGoals,
		};
	} catch (error) {
		console.error('ダッシュボードデータの取得に失敗:', error);
		throw error;
	}
};

fetchDashboardData();
</script>
