<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">選手一覧</h1>
      <button
        @click="navigateTo('/players/new')"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        新規選手登録
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">選手名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ポジション</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">トレーニング回数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終更新日</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="player in players" :key="player.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ player.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ player.position }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ player.age }}歳</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ player.trainingCount }}回</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(player.lastUpdated) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="navigateTo(`/players/${player.id}`)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                詳細
              </button>
              <button
                @click="navigateTo(`/players/${player.id}/training/new`)"
                class="text-green-600 hover:text-green-900"
              >
                トレーニング記録
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  trainingCount: number;
  lastUpdated: string;
}

const players: Player[] = [
  {
    id: 1,
    name: '山田太郎',
    position: 'FW',
    age: 18,
    trainingCount: 5,
    lastUpdated: '2024-03-13'
  },
  {
    id: 2,
    name: '鈴木一郎',
    position: 'MF',
    age: 19,
    trainingCount: 3,
    lastUpdated: '2024-03-12'
  },
  {
    id: 3,
    name: '佐藤次郎',
    position: 'DF',
    age: 17,
    trainingCount: 2,
    lastUpdated: '2024-03-11'
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP');
};
</script> 