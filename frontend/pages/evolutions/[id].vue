<template>
	<div class="container mx-auto px-4 py-8">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">エボリューション選手詳細</h1>
			<div class="space-x-4">
				<button
					@click="navigateTo(`/evolution/${id}/training/new`)"
					class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
				>
					トレーニング記録
				</button>
				<button
					@click="navigateTo('/evolution')"
					class="text-gray-600 hover:text-gray-900"
				>
					一覧に戻る
				</button>
			</div>
		</div>

		<!-- 基本情報カード -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h2 class="text-xl font-semibold mb-4">基本情報</h2>
					<dl class="space-y-4">
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
					</dl>
				</div>
				<div>
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
				</div>
			</div>
		</div>

		<!-- エボリューション履歴 -->
		<h2 class="text-xl font-semibold mb-4">エボリューション履歴</h2>
		<div class="space-y-16">
			<div
				v-for="(evolution, index) in player.evolutions"
				:key="evolution.evolutionName"
				class="relative"
			>
				<div
					class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
				>
					<div class="flex justify-between items-start mb-4">
						<h3 class="text-lg font-semibold text-gray-900">
							{{ evolution.evolutionName }}
						</h3>
						<div class="flex items-center space-x-4">
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
						</div>
					</div>
				</div>
				<!-- 矢印アイコン -->
				<div
					v-if="index < player.evolutions.length - 1"
					class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
					style="top: calc(100% + 2rem)"
				>
					<div class="relative w-40 h-40 flex items-center justify-center">
						<svg
							class="w-32 h-20 text-gray-400 opacity-50"
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M12 4l-8 16h16L12 4z"></path>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
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
</script>
