<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API_ENDPOINTS } from '~/constants/api';

const route = useRoute();

// 大会詳細を取得する関数
const fetchTournament = async () => {
	try {
		const response = await fetch(
			API_ENDPOINTS.TOURNAMENTS.DETAIL(route.params.id as string)
		);
		const data = await response.json();
		console.log('大会詳細:', data);
	} catch (error) {
		console.error('大会詳細取得エラー:', error);
	}
};

onMounted(() => {
	fetchTournament();
});
</script>

<template>
	<div>
		<h1 class="text-2xl font-semibold text-gray-900">大会詳細</h1>
		<NuxtLink
			to="/tournaments"
			class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
		>
			一覧に戻る
		</NuxtLink>
	</div>
</template>
