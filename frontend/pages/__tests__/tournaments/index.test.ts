import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import TournamentsIndex from '~/pages/tournaments/index.vue';
import { API_ENDPOINTS } from '~/constants/api';
import type { ComponentPublicInstance } from 'vue';

// NuxtのコンポジションAPIのモック
const mockRouter = {
	push: vi.fn(),
};

// グローバルなモックを設定
vi.stubGlobal('useRouter', () => mockRouter);

// コンポーネントの型定義
interface TournamentComponent extends ComponentPublicInstance {
	fetchTournaments: () => Promise<void>;
}

// モックデータ
const mockTournaments = [
	{
		tournamentId: 'eabf07ed-2764-4c63-8f7b-6ea8807c9c46',
		startDate: '2025-05-16T15:00:00.000Z',
		wins: 10,
		losses: 4,
		mvpName: null,
		players: [
			{
				playerId: '6ff6a194-c61c-45b8-97e9-c729eb8083a8',
				playerName: 'フドゥリン',
				totalGoals: 33,
				totalAssists: 17,
			},
			{
				playerId: '25d4d5a4-398c-41c8-ad9c-fa05b9f4efb4',
				playerName: 'リベリー',
				totalGoals: 17,
				totalAssists: 6,
			},
			{
				playerId: 'f4ea912b-bb37-4c9f-bf94-73becfb2a28c',
				playerName: 'マラドーナ',
				totalGoals: 9,
				totalAssists: 8,
			},
			{
				playerId: 'b30dab00-0a96-4f5c-9bbf-cd076fd706a6',
				playerName: 'ガソネ',
				totalGoals: 6,
				totalAssists: 10,
			},
			{
				playerId: '49bb8275-a607-498e-af17-d46c5a1cbc0d',
				playerName: 'フェラン・トーレス',
				totalGoals: 1,
				totalAssists: 3,
			},
			{
				playerId: '6e4096c5-899e-4255-9019-456c460660df',
				playerName: 'フリット',
				totalGoals: 1,
				totalAssists: 0,
			},
			{
				playerId: 'd2d160a2-ccb6-43ee-883b-8a889df8d169',
				playerName: 'ムシアラ',
				totalGoals: 1,
				totalAssists: 4,
			},
			{
				playerId: '0493274f-bf0d-4e05-a683-2fa5307571a7',
				playerName: '冨安',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '356d4384-d911-4713-a905-932794f10f54',
				playerName: 'カシージャス',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '37ee9b68-d56c-4922-a7d0-f37819c3835c',
				playerName: 'ダンフリース',
				totalGoals: 0,
				totalAssists: 1,
			},
			{
				playerId: '4aa4fb11-645c-4962-9449-c1591cdcda02',
				playerName: 'ビセック',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '54416d4d-89ca-4abe-b830-22efd99fd836',
				playerName: 'ピナ',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '729544fd-9541-4521-aa1a-c0e6ca53353d',
				playerName: 'トゥーレ',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '820c0c68-1eef-4a25-9499-e758bf751595',
				playerName: 'エトー',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '9c52dd74-4d44-49ae-bfc0-2f6f26b8a1c9',
				playerName: 'ドク',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '9dd79663-3c4d-4282-918b-7d1ccb94351a',
				playerName: 'カンテ',
				totalGoals: 0,
				totalAssists: 3,
			},
			{
				playerId: 'c697b2be-9ee4-4b93-a41e-cdd9dc778a71',
				playerName: 'テオ・エルナンデス',
				totalGoals: 0,
				totalAssists: 1,
			},
			{
				playerId: 'e6b8d7a5-34cc-4b31-bfdd-d307eb67ba1b',
				playerName: 'プテジャス',
				totalGoals: 0,
				totalAssists: 0,
			},
		],
	},
	{
		tournamentId: '8a8bebc4-4421-4bba-9c18-c73179d4f0e4',
		startDate: '2025-05-03T15:00:00.000Z',
		wins: 9,
		losses: 6,
		mvpName: 'ガソネ',
		players: [
			{
				playerId: '7f91fd6d-7c65-4a66-a800-af1dbeb87438',
				playerName: 'ガソネ',
				totalGoals: 25,
				totalAssists: 11,
			},
			{
				playerId: '247bfc74-9793-4ed1-b8b8-5e0ede8619aa',
				playerName: 'ソン・フンミン',
				totalGoals: 10,
				totalAssists: 2,
			},
			{
				playerId: '03618de3-7b7f-48dc-949f-06f1071ef466',
				playerName: 'マラドーナ',
				totalGoals: 8,
				totalAssists: 7,
			},
			{
				playerId: '0a222b73-1c7e-420a-8815-12bad9ca26c9',
				playerName: 'アンリ',
				totalGoals: 4,
				totalAssists: 5,
			},
			{
				playerId: '1ea435aa-f4b2-42ec-aeaa-87d85368f018',
				playerName: 'フリット',
				totalGoals: 4,
				totalAssists: 18,
			},
			{
				playerId: '96554576-be85-4415-8ce7-a797a8eb4a69',
				playerName: 'ビセック',
				totalGoals: 2,
				totalAssists: 0,
			},
			{
				playerId: 'ca294452-691e-42cd-a1ea-3305617d50e3',
				playerName: 'ピナ',
				totalGoals: 1,
				totalAssists: 0,
			},
			{
				playerId: '2e225ae4-a3d3-40fa-8cd4-64bb225c9c84',
				playerName: 'フェルミン',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '5b9dc37d-38c6-4350-8cea-5a9097af7a07',
				playerName: 'トゥーレ',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '5e92f5c3-cb91-439b-beb8-4c59bf3f0257',
				playerName: 'テラシアーノ',
				totalGoals: 0,
				totalAssists: 1,
			},
			{
				playerId: '60448a37-468c-419d-bd03-8fe742e2dee8',
				playerName: 'カシージャス',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '6f84cc47-10d4-46c5-9907-41978705e478',
				playerName: 'クンデ',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '754edc21-bb58-490c-9acf-4a97589b6e1d',
				playerName: 'エトー',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '8c59547b-0949-4478-9084-154cac890135',
				playerName: '冨安',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: '95a08fff-c7d7-4035-8a98-02201ecc5d71',
				playerName: 'カンテ',
				totalGoals: 0,
				totalAssists: 2,
			},
			{
				playerId: 'c19e99c2-7d80-4454-9502-40df9b2478b7',
				playerName: 'テオ・エルナンデス',
				totalGoals: 0,
				totalAssists: 1,
			},
			{
				playerId: 'f69f4b42-9672-4922-8238-754bcad1009d',
				playerName: 'プテジャス',
				totalGoals: 0,
				totalAssists: 0,
			},
			{
				playerId: 'fa58a34a-5c69-43ef-9c8d-01863dcd41e9',
				playerName: 'カイセド',
				totalGoals: 0,
				totalAssists: 2,
			},
		],
	},
];

describe('大会一覧ページ', () => {
	/* グローバルなモックデータを使用してテストを実行（APIの代わり実行）
	 * beforeEach・・・各テストケース（itブロック）が実行される前に、毎回実行される関数
	 * vi.fn()・・・Vitestのモック関数を作成する関数（実際の関数の代わりに使用される「偽物」の関数）
	 * global.fetch・・・実際のAPIリクエストを送信せずに、テスト用のデータを返すように設定（これにより、テストが外部依存（APIサーバー）なしで実行可能）
	 * mockResolvedValue・・・Promiseを返すモック関数を作成するためのメソッド
	 */
	beforeEach(() => {
		global.fetch = vi.fn().mockResolvedValue({
			json: () => Promise.resolve(mockTournaments),
		});
	});

	// 1. 大会一覧の表示テスト
	it('大会一覧が正しく表示されること', async () => {
		const wrapper = mount(TournamentsIndex) as VueWrapper<TournamentComponent>;

		// データが取得されるまで待機
		await wrapper.vm.fetchTournaments();

		// テーブルが存在することを確認
		expect(wrapper.find('table')).toBeTruthy();

		// テーブルヘッダーが正しく表示されていることを確認
		const headers = wrapper.findAll('thead th');
		expect(headers).toHaveLength(8);
		expect(headers[0].text()).toBe('対戦日時');
		expect(headers[1].text()).toBe('勝敗 (15試合)');
		expect(headers[2].text()).toBe('総得点');
		expect(headers[3].text()).toBe('ゴール(上位３名)');
		expect(headers[4].text()).toBe('アシスト(上位３名)');
		expect(headers[5].text()).toBe('MVP');
		expect(headers[6].text()).toBe('ランク');
		expect(headers[7].text()).toBe('操作'); // ボタンエリア（ヘッダー名がない場合は空文字）

		// テーブルボディが存在することを確認
		expect(wrapper.find('tbody')).toBeTruthy();
	});
});
