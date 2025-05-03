<template>
	<div class="container mx-auto px-4 py-8">
		<!-- パンくずリスト -->
		<Breadcrumb :items="breadcrumbItems" />
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">新規エボリューション選手登録</h1>
			<button
				@click="navigateTo('/evolution')"
				class="text-gray-600 hover:text-gray-900"
			>
				一覧に戻る
			</button>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<form @submit.prevent="handleSubmit" class="space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700"
						>選手名</label
					>
					<input
						type="text"
						id="name"
						v-model="form.name"
						class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label for="position" class="block text-sm font-medium text-gray-700"
						>ポジション</label
					>
					<select
						id="position"
						v-model="form.position"
						class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					>
						<option value="">選択してください</option>
						<option value="FW">FW</option>
						<option value="MF">MF</option>
						<option value="DF">DF</option>
						<option value="GK">GK</option>
					</select>
				</div>

				<div class="border-t border-gray-200 pt-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">ステータス</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								for="overall"
								class="block text-sm font-medium text-gray-700"
								>総合レート</label
							>
							<input
								type="number"
								id="overall"
								v-model="form.stats.overall"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label for="pace" class="block text-sm font-medium text-gray-700"
								>ペース</label
							>
							<input
								type="number"
								id="pace"
								v-model="form.stats.pace"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label
								for="shooting"
								class="block text-sm font-medium text-gray-700"
								>シュート</label
							>
							<input
								type="number"
								id="shooting"
								v-model="form.stats.shooting"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label
								for="passing"
								class="block text-sm font-medium text-gray-700"
								>パス</label
							>
							<input
								type="number"
								id="passing"
								v-model="form.stats.passing"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label
								for="dribbling"
								class="block text-sm font-medium text-gray-700"
								>ドリブル</label
							>
							<input
								type="number"
								id="dribbling"
								v-model="form.stats.dribbling"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label
								for="defending"
								class="block text-sm font-medium text-gray-700"
								>ディフェンス</label
							>
							<input
								type="number"
								id="defending"
								v-model="form.stats.defending"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
						<div>
							<label
								for="physical"
								class="block text-sm font-medium text-gray-700"
								>フィジカル</label
							>
							<input
								type="number"
								id="physical"
								v-model="form.stats.physical"
								class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
								min="0"
								max="99"
							/>
						</div>
					</div>
				</div>

				<div class="flex justify-end space-x-4">
					<button
						type="button"
						@click="navigateTo('/evolution')"
						class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						キャンセル
					</button>
					<button
						type="submit"
						class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						登録
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_ENDPOINTS } from '~/constants/api';
import { useToast } from 'vue-toastification';

interface PlayerStats {
	overall: number;
	pace: number;
	shooting: number;
	passing: number;
	dribbling: number;
	defending: number;
	physical: number;
}

interface PlayerForm {
	name: string;
	position: string;
	stats: PlayerStats;
}

const router = useRouter();
const toast = useToast();

// パンくずリスト
const breadcrumbItems = [
	{
		name: 'EVO選手一覧',
		path: '/evolutions',
	},
	{
		name: 'EVO選手登録',
	},
];

const form = ref<PlayerForm>({
	name: '',
	position: 'FW',
	stats: {
		overall: 50,
		pace: 50,
		shooting: 50,
		passing: 50,
		dribbling: 50,
		defending: 50,
		physical: 50,
	},
});

const errors = ref<{
	name?: string;
	position?: string;
	stats?: {
		overall?: string;
		pace?: string;
		shooting?: string;
		passing?: string;
		dribbling?: string;
		defending?: string;
		physical?: string;
	};
}>({});

const validateForm = (): boolean => {
	errors.value = {};

	// 名前のバリデーション
	if (!form.value.name) {
		errors.value.name = '選手名は必須です';
	}

	// ポジションのバリデーション
	if (!form.value.position) {
		errors.value.position = 'ポジションは必須です';
	}

	// ステータスのバリデーション
	const stats = form.value.stats;
	if (stats.overall < 0 || stats.overall > 99) {
		errors.value.stats = {
			...errors.value.stats,
			overall: '総合能力は0から99の間で入力してください',
		};
	}
	if (stats.pace < 0 || stats.pace > 99) {
		errors.value.stats = {
			...errors.value.stats,
			pace: 'スピードは0から99の間で入力してください',
		};
	}
	if (stats.shooting < 0 || stats.shooting > 99) {
		errors.value.stats = {
			...errors.value.stats,
			shooting: 'シュートは0から99の間で入力してください',
		};
	}
	if (stats.passing < 0 || stats.passing > 99) {
		errors.value.stats = {
			...errors.value.stats,
			passing: 'パスは0から99の間で入力してください',
		};
	}
	if (stats.dribbling < 0 || stats.dribbling > 99) {
		errors.value.stats = {
			...errors.value.stats,
			dribbling: 'ドリブルは0から99の間で入力してください',
		};
	}
	if (stats.defending < 0 || stats.defending > 99) {
		errors.value.stats = {
			...errors.value.stats,
			defending: 'ディフェンスは0から99の間で入力してください',
		};
	}
	if (stats.physical < 0 || stats.physical > 99) {
		errors.value.stats = {
			...errors.value.stats,
			physical: 'フィジカルは0から99の間で入力してください',
		};
	}

	return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
	if (!validateForm()) {
		return;
	}

	try {
		const response = await axios.post(API_ENDPOINTS.EVOLUTIONS.CREATE, {
			...form.value,
		});
		toast.success('エボリューション選手を登録しました');
		// 一覧画面へ遷移
		router.push('/evolutions');
	} catch (error) {
		console.error('登録エラー:', error);
		// エラー時の処理
	}
};
</script>
