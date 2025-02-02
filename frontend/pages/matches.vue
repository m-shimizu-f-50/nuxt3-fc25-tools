<script setup lang="ts">
import { ref } from 'vue';

const matches = ref([
	{
		id: 1,
		date: '2025-02-03',
		win: 10,
		lose: 5,
		goals: 23,
		scorers: 'Player A (10), Player B (5), Player C (3)',
		mvp: 'Player A',
		rank: 'Gold',
	},
	{
		id: 2,
		date: '2025-02-10',
		win: 3,
		lose: 7,
		goals: 18,
		scorers: 'Player D (6), Player E (5), Player F (4)',
		mvp: 'Player D',
		rank: 'Silver',
	},
]);

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
</script>

<template>
	<div class="container mx-auto p-4">
		<h1 class="text-2xl font-bold mb-4">CF 対戦データ</h1>
		<table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
			<thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
				<tr>
					<th class="py-3 px-6 text-left">対戦日時</th>
					<th class="py-3 px-6 text-center">勝敗 (15試合)</th>
					<th class="py-3 px-6 text-center">勝率</th>
					<th class="py-3 px-6 text-center">得点</th>
					<th class="py-3 px-6 text-center">得点者</th>
					<th class="py-3 px-6 text-center">MVP</th>
					<th class="py-3 px-6 text-center">ランク</th>
					<th class="py-3 px-6 text-center">詳細</th>
				</tr>
			</thead>
			<tbody class="text-gray-700">
				<tr v-for="match in matches" :key="match.id" class="border-b">
					<td class="py-3 px-6">{{ match.date }}</td>
					<td class="py-3 px-6 text-center">
						<div class="flex justify-center">
							{{ match.win }}勝 / {{ match.lose }}敗 ({{
								computeWinRate(match.win, match.lose)
							}})
						</div>
					</td>
					<td class="py-3 px-6 text-center font-bold"></td>
					<td class="py-3 px-6 text-center">{{ match.goals }}</td>
					<td class="py-3 px-6 text-center">{{ match.scorers }}</td>
					<td class="py-3 px-6 text-center font-bold text-blue-500">
						{{ match.mvp }}
					</td>
					<td class="py-3 px-6 text-center font-bold">
						Rank {{ computeRank(match.win) }}
					</td>
					<td class="py-3 px-6 text-center">
						<button
							class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
						>
							詳細
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
