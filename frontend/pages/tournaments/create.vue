<script setup lang="ts">
import { ref } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface Player {
	name: string;
	position: 'GK' | 'DF' | 'MF' | 'FW';
	team: string;
	isStarter: boolean;
}

interface FormData {
	name: string;
	startDate: Date | null;
	players: Player[];
}

// 今日の日付を取得（時刻は00:00:00に設定）
const today = new Date();
today.setHours(0, 0, 0, 0);

const formData = ref<FormData>({
	name: '',
	startDate: null,
	players: [],
});

const addPlayer = () => {
	formData.value.players.push({
		name: '',
		position: 'FW',
		team: '',
		isStarter: true,
	});
};

const removePlayer = (index: number) => {
	formData.value.players.splice(index, 1);
};

const handleSubmit = async () => {
	try {
		if (!formData.value.startDate) {
			alert('開始日を選択してください');
			return;
		}

		const submitData = {
			...formData.value,
			startDate: formData.value.startDate.toISOString().split('T')[0],
		};

		// TODO: APIリクエストの実装
		console.log('送信データ:', submitData);
		// 成功時の処理（例：一覧ページへの遷移）
	} catch (error) {
		console.error('エラー:', error);
	}
};
</script>

<template>
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<h1 class="text-2xl font-semibold text-gray-900">大会登録</h1>
			<form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
				<!-- 開始日 -->
				<div>
					<label class="block text-sm font-medium text-gray-700">開始日</label>
					<div class="mt-1">
						<Datepicker
							v-model="formData.startDate"
							:min-date="today"
							:enable-time-picker="false"
							locale="ja"
							auto-apply
							text-input
							placeholder="日付を選択"
							input-class-name="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>
				</div>

				<!-- 選手一覧 -->
				<div>
					<label class="block text-sm font-medium text-gray-700"
						>選手一覧</label
					>
					<div class="mt-4 space-y-4">
						<div
							v-for="(player, index) in formData.players"
							:key="index"
							class="flex items-center gap-4"
						>
							<div class="flex-1">
								<input
									type="text"
									v-model="player.name"
									placeholder="選手名"
									class="block w-full bg-white p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								/>
							</div>
							<div class="w-32">
								<select
									v-model="player.position"
									class="block w-full bg-white p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								>
									<option value="GK">GK</option>
									<option value="DF">DF</option>
									<option value="MF">MF</option>
									<option value="FW">FW</option>
								</select>
							</div>
							<div class="w-32">
								<select
									v-model="player.isStarter"
									class="block w-full bg-white p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								>
									<option value="true">スタメン</option>
									<option value="false">ベンチ</option>
								</select>
							</div>
							<div class="flex-1">
								<input
									type="text"
									v-model="player.team"
									placeholder="所属チーム"
									class="block bg-white p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								/>
							</div>
							<div class="w-24">
								<button
									type="button"
									@click="removePlayer(index)"
									class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									削除
								</button>
							</div>
						</div>
					</div>
					<button
						type="button"
						@click="addPlayer"
						class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						選手を追加
					</button>
				</div>

				<!-- 送信ボタン -->
				<div class="flex justify-end">
					<button
						type="submit"
						class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						登録する
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
