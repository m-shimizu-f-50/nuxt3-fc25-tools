<script setup lang="ts">
import { ref, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useForm, useField, useFieldArray } from 'vee-validate';
import * as yup from 'yup';

interface Player {
	name: string;
	position: 'GK' | 'DF' | 'MF' | 'FW';
	team: string;
	isStarter: boolean;
}

interface FormData {
	startDate: Date | null;
	players: Player[];
}

// 今日の日付を取得（時刻は00:00:00に設定）
const today = new Date();
today.setHours(0, 0, 0, 0);

// バリデーションスキーマの定義
const validationSchema = yup.object({
	startDate: yup.date().required('開始日を選択してください'),
	players: yup.array().of(
		yup.object({
			name: yup.string().required('選手名を入力してください'),
			position: yup
				.string()
				.oneOf(['GK', 'DF', 'MF', 'FW'], '無効なポジションです'),
			team: yup.string(),
			isStarter: yup.boolean(),
		})
	),
});

// `useForm` でバリデーション付きのフォームを作成
const { handleSubmit, errors } = useForm({
	validationSchema,
	initialValues: {
		startDate: null,
		players: [
			{ name: '', position: 'FW', team: '', isStarter: true },
			{ name: '', position: 'FW', team: '', isStarter: true },
			{ name: '', position: 'FW', team: '', isStarter: true },
			{ name: '', position: 'MF', team: '', isStarter: true },
			{ name: '', position: 'MF', team: '', isStarter: true },
			{ name: '', position: 'MF', team: '', isStarter: true },
			{ name: '', position: 'DF', team: '', isStarter: true },
			{ name: '', position: 'DF', team: '', isStarter: true },
			{ name: '', position: 'DF', team: '', isStarter: true },
			{ name: '', position: 'DF', team: '', isStarter: true },
			{ name: '', position: 'GK', team: '', isStarter: true },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
			{ name: '', position: 'FW', team: '', isStarter: false },
		],
	},
});

// 各フィールドの定義
// `startDate` の型を明示的に指定
// `useField` の戻り値は `Ref<T>` ではなく、オブジェクトなので `.value` を適用
const startDate = useField<Date | null>('startDate');
const { fields: players, push, remove } = useFieldArray<Player>('players');

// Datepicker に適合する値を computed で変換
const startDateModel = computed({
	get: () => startDate.value.value as unknown as Date | null, // 型変換
	set: (value: Date | null) => (startDate.value.value = value),
});

const formData = ref<FormData>({
	startDate: null,
	players: [
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'MF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'MF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'MF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'DF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'DF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'DF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'DF',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'GK',
			team: '',
			isStarter: true,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
		{
			name: '',
			position: 'FW',
			team: '',
			isStarter: false,
		},
	],
});

// 選手追加
const addPlayer = () => {
	if (players.value.length >= 18) return;
	push({ name: '', position: 'FW', team: '', isStarter: false });
};
// const addPlayer = () => {
// 	formData.value.players.push({
// 		name: '',
// 		position: 'FW',
// 		team: '',
// 		isStarter: true,
// 	});
// };

// 選手削除
const removePlayer = (index: number) => {
	remove(index);
};
// const removePlayer = (index: number) => {
// 	formData.value.players.splice(index, 1);
// };

// 選手整頓
const arrangementPlayer = () => {
	if (players.value.length <= 1) return;
	console.log('整頓前:', players.value);
	// ポジションの優先順位を定義（FWが最優先、GKが最も後ろ）
	const positionOrder = { FW: 1, MF: 2, DF: 3, GK: 4 };

	// players.value は `FieldArray` 型のため、`value` にアクセスしてデータを取得
	const sortedPlayers = [...players.value].sort((a, b) => {
		// `value` プロパティにアクセスして Player 型として扱う
		const playerA = a.value as Player;
		const playerB = b.value as Player;

		// `positionOrder` のキーが存在するか確認
		const posA = positionOrder[playerA.position] ?? Number.MAX_SAFE_INTEGER;
		const posB = positionOrder[playerB.position] ?? Number.MAX_SAFE_INTEGER;

		// ① スタメン優先（true が前）
		const starterComparison =
			Number(playerB.isStarter) - Number(playerA.isStarter);
		if (starterComparison !== 0) return starterComparison;

		// ② ポジション順（FW > MF > DF > GK）
		return posA - posB;
	});

	// 整頓後のログを出力
	console.log('整頓後:', JSON.stringify(sortedPlayers, null, 2));

	// `splice()` の代わりに直接代入（Vue の reactivity に確実に反映させる）
	// `splice()` を使ってリアクティブな配列を更新
	players.value.splice(0, players.value.length, ...sortedPlayers);

	// players.value.sort((a, b) => {
	// 	// ① スタメン優先
	// 	// isStarter は boolean なので、Number() で 0 or 1 に変換して比較
	// 	// b.isStarter = true (1), a.isStarter = false (0) の場合 1 - 0 = 1 → b を前に
	// 	const starterComparison = Number(b.isStarter) - Number(a.isStarter);

	// 	// スタメンとベンチが異なる場合は、ここでソート決定（true が前）
	// 	if (starterComparison !== 0) return starterComparison;

	// 	// ② ポジション順（FW > MF > DF > GK）
	// 	// positionOrder で定義した数値を比較し、優先順位の低い方を後ろにする
	// 	// 例: FW(1) - MF(2) = -1 → FW が前に
	// 	return positionOrder[a.position] - positionOrder[b.position];
	// });
};

// 登録ボタン
// const handleSubmit = async () => {
// 	try {
// 		if (!formData.value.startDate) {
// 			alert('開始日を選択してください');
// 			return;
// 		}

// 		const submitData = {
// 			...formData.value,
// 			startDate: formData.value.startDate.toISOString().split('T')[0],
// 		};

// 		// TODO: APIリクエストの実装
// 		console.log('送信データ:', submitData);
// 		// 成功時の処理（例：一覧ページへの遷移）
// 	} catch (error) {
// 		console.error('エラー:', error);
// 	}
// };
// 送信ボタン
const submitForm = handleSubmit((values) => {
	console.log('送信データ:', values);
});
</script>

<template>
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<h1 class="text-2xl font-semibold text-gray-900">大会登録</h1>
			<form @submit.prevent="submitForm" class="mt-6 space-y-6">
				<!-- 開始日 -->
				<div>
					<label class="block text-sm font-medium text-gray-700">開始日</label>
					<div class="mt-1">
						<Datepicker
							v-model="startDateModel"
							:min-date="today"
							:enable-time-picker="false"
							locale="ja"
							auto-apply
							text-input
							placeholder="日付を選択"
							input-class-name="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
						<p class="text-red-500 text-sm" v-if="errors.startDate">
							{{ errors.startDate }}
						</p>
					</div>
				</div>

				<!-- 選手一覧 -->
				<div>
					<label class="block text-sm font-medium text-gray-700"
						>選手一覧</label
					>
					<div class="mt-4 space-y-4">
						<div
							v-for="(player, index) in players"
							:key="index"
							class="flex items-center gap-4"
						>
							<div class="flex-1">
								<input
									type="text"
									v-model="player.value.name"
									placeholder="選手名"
									class="block w-full bg-white p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								/>
								<p
									class="text-red-500 text-sm"
									v-if="errors[`players.${index}.name`]"
								>
									{{ errors[`players.${index}.name`] }}
								</p>
							</div>
							<div class="w-32">
								<select
									v-model="player.value.position"
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
									v-model="player.value.isStarter"
									class="block w-full bg-white p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								>
									<option :value="true">スタメン</option>
									<option :value="false">ベンチ</option>
								</select>
							</div>
							<div class="flex-1">
								<input
									type="text"
									v-model="player.value.team"
									placeholder="所属チーム"
									class="block bg-white p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								/>
								<p
									class="text-red-500 text-sm"
									v-if="errors[`players.${index}.team`]"
								>
									{{ errors[`players.${index}.team`] }}
								</p>
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
						class="mt-4 mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
						:disabled="players.length >= 18"
					>
						選手を追加
					</button>
					<button
						type="button"
						@click="arrangementPlayer"
						class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						選手を整頓
					</button>
				</div>

				<!-- 送信ボタン -->
				<div class="flex justify-end">
					<button
						type="submit"
						class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
					>
						登録する
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
