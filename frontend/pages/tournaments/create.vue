<script setup lang="ts">
import { ref, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useForm, useField, useFieldArray } from 'vee-validate';
import * as yup from 'yup';
import axios from 'axios';

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
	// 開始日(startDate)のバリデーションもカスタムチェックで対応
	players: yup.array().of(
		yup.object({
			// nameのバリデーションはカスタムチェックで対応
			position: yup
				.string()
				.oneOf(['GK', 'DF', 'MF', 'FW'], '無効なポジションです'),
			team: yup.string(),
			isStarter: yup.boolean(),
		})
	),
});

// `useForm` でバリデーション付きのフォームを作成
const { handleSubmit, errors, validateField } = useForm({
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

// 選手削除
const removePlayer = (index: number) => {
	remove(index);
};

// 選手整頓
const arrangementPlayer = () => {
	if (players.value.length <= 1) return;

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

	// 一度配列を空にする
	while (players.value.length) {
		remove(0);
	}

	// ソートされた選手を順番に追加
	sortedPlayers.forEach((player) => {
		push({
			name: player.value.name,
			position: player.value.position,
			team: player.value.team,
			isStarter: player.value.isStarter,
		});
	});
};

// 日付データをフォーマット
const formatDate = (isoDate: Date | null) => {
	if (!isoDate) return '';
	const dateObj = new Date(isoDate);
	const year = dateObj.getUTCFullYear();
	const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// フォームエラー管理用の ref を修正
const formErrors = ref<{
	startDate?: string;
	players: string[]; // playersを必須のプロパティとして定義
}>({
	players: [], // 初期値として空配列を設定
});

// 送信ボタン
const submitForm = handleSubmit(async (values) => {
	// エラーをリセット
	formErrors.value = {
		players: [], // ここで配列を初期化
	};

	// 開始日のバリデーション
	if (!startDateModel.value) {
		formErrors.value.startDate = '開始日を選択してください';
	}

	// 選手名のバリデーション
	const emptyNamePlayers = players.value.filter(
		(player) => !player.value.name.trim()
	);
	if (emptyNamePlayers.length > 0) {
		formErrors.value.players.push('選手名の値を入力してください');
	}

	// 選手名の重複チェック
	const playerNames = players.value
		.map((player) => player.value.name.trim())
		.filter((name) => name !== '');
	const duplicateNames = playerNames.filter(
		(name, index) => playerNames.indexOf(name) !== index
	);

	if (duplicateNames.length > 0) {
		formErrors.value.players.push(
			`以下の選手名が重複しています：${Array.from(new Set(duplicateNames)).join(
				', '
			)}`
		);
	}

	// 選手人数のバリデーション（18人）
	const filledPlayers = players.value.filter((player) =>
		player.value.name.trim()
	);
	if (filledPlayers.length !== 18) {
		formErrors.value.players?.push(
			`選手は18人登録してください（現在：${filledPlayers.length}人）`
		);
	}

	// エラーがある場合は送信しない
	if (formErrors.value.startDate || formErrors.value.players.length > 0) {
		console.log('エラーがあるため送信できません');
		return;
	}

	try {
		const formattedStartDate = formatDate(startDateModel.value);
		const response = await axios.post(
			'http://localhost:8890/api/tournaments/create',
			{
				startDate: formattedStartDate,
				players: players.value.map((player) => ({
					name: player.value.name,
					position: player.value.position,
					team: player.value.team,
					isStarter: player.value.isStarter,
				})),
			}
		);
		console.log('登録成功:', response.data);
		// 成功時の処理（例：一覧ページへの遷移）
	} catch (error) {
		console.error('登録エラー:', error);
		// エラー時の処理
	}
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
						<p class="text-red-500 text-sm" v-if="formErrors.startDate">
							{{ formErrors.startDate }}
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
					<!-- 選手一覧のエラーメッセージ -->
					<div v-if="formErrors.players?.length" class="mt-2">
						<p
							v-for="(error, index) in formErrors.players"
							:key="index"
							class="text-sm text-red-600"
						>
							{{ error }}
						</p>
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
