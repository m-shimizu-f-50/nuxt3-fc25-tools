# パンくずリスト実装ガイド

## 概要
このドキュメントでは、Nuxt3でのパンくずリスト（Breadcrumb）の実装方法について説明します。パンくずリストは、ユーザーが現在のページまでの階層構造を視覚的に理解し、簡単にナビゲーションできるようにする重要なUI要素です。

## 目次
1. [基本実装](#基本実装)
2. [使用方法](#使用方法)
3. [カスタマイズ](#カスタマイズ)
4. [実装例](#実装例)
5. [ベストプラクティス](#ベストプラクティス)

## 基本実装

### コンポーネントの作成
`components/Breadcrumb.vue`にパンくずリストのコンポーネントを作成します。

```vue
<!-- components/Breadcrumb.vue -->
<template>
  <nav class="flex py-3 px-5 text-gray-700 bg-gray-50 rounded-lg" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <!-- ホームリンク -->
      <li class="inline-flex items-center">
        <NuxtLink to="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
          <svg class="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
          </svg>
          ホーム
        </NuxtLink>
      </li>
      
      <!-- パンくずリストアイテム -->
      <li v-for="(item, index) in items" :key="index">
        <div class="flex items-center">
          <!-- 区切り文字 -->
          <svg class="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
          <!-- リンクまたはテキスト -->
          <NuxtLink
            v-if="item.path && index !== items.length - 1"
            :to="item.path"
            class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
          >
            {{ item.name }}
          </NuxtLink>
          <span
            v-else
            class="ml-1 text-sm font-medium text-gray-500 md:ml-2"
          >
            {{ item.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  name: string;   // 表示名
  path?: string;  // パス（オプション）
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>
```

### 型定義
パンくずリストの各項目の型を定義します。

```typescript
interface BreadcrumbItem {
  name: string;   // 表示名（必須）
  path?: string;  // パス（オプション）
}
```

## 使用方法

### 基本的な使用例
各ページでパンくずリストを使用する際の実装例を示します。

```vue
<!-- pages/example.vue -->
<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <!-- ページのコンテンツ -->
  </div>
</template>

<script setup lang="ts">
const breadcrumbItems = [
  {
    name: '親ページ',
    path: '/parent'
  },
  {
    name: '現在のページ'  // 最後の項目にはpathを指定しない
  }
];
</script>
```

### 動的なパンくずリストの例
ルートパラメータを使用する場合の実装例です。

```vue
<!-- pages/tournaments/[id].vue -->
<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <!-- ページのコンテンツ -->
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const breadcrumbItems = [
  {
    name: '大会一覧',
    path: '/tournaments'
  },
  {
    name: '大会詳細'
  }
];
</script>
```

## カスタマイズ

### スタイルのカスタマイズ
Tailwind CSSを使用したスタイルのカスタマイズ例を示します。

```vue
<template>
  <nav class="breadcrumb-nav">
    <!-- カスタムクラスを適用 -->
    <ol class="breadcrumb-list">
      <!-- 項目のスタイリング -->
    </ol>
  </nav>
</template>

<style>
.breadcrumb-nav {
  @apply flex py-3 px-5 bg-white shadow-sm rounded-lg;
}

.breadcrumb-list {
  @apply inline-flex items-center space-x-2;
}

/* ホバー時のスタイル */
.breadcrumb-link:hover {
  @apply text-primary-600 transition-colors duration-200;
}
</style>
```

### アイコンのカスタマイズ
区切り文字やホームアイコンをカスタマイズする例です。

```vue
<!-- カスタム区切り文字 -->
<template>
  <span class="mx-2">/</span>  <!-- スラッシュを使用 -->
</template>

<!-- または -->
<template>
  <span class="mx-2">></span>  <!-- 矢印を使用 -->
</template>
```

## 実装例

### 1. 基本的なページ階層
```typescript
// 通常のページ階層
const breadcrumbItems = [
  {
    name: 'ホーム',
    path: '/'
  },
  {
    name: '現在のページ'
  }
];
```

### 2. 複数階層のページ
```typescript
// 複数階層のページ
const breadcrumbItems = [
  {
    name: 'ホーム',
    path: '/'
  },
  {
    name: 'カテゴリー',
    path: '/category'
  },
  {
    name: 'サブカテゴリー',
    path: '/category/sub'
  },
  {
    name: '現在のページ'
  }
];
```

### 3. 動的ルートでの使用
```typescript
// 動的ルートでの使用例
const route = useRoute();
const breadcrumbItems = [
  {
    name: '大会一覧',
    path: '/tournaments'
  },
  {
    name: `大会ID: ${route.params.id}`,
  }
];
```

## ベストプラクティス

### 1. アクセシビリティ
- 適切な`aria-label`の使用
- セマンティックなHTML構造の維持
- キーボードナビゲーションのサポート

```vue
<nav aria-label="Breadcrumb">
  <ol role="list">
    <!-- パンくずリストの項目 -->
  </ol>
</nav>
```

### 2. レスポンシブデザイン
- モバイル端末での適切な表示
- 長いパンくずリストの折り返し対応
- 適切な文字サイズとタッチターゲットの設定

```vue
<style>
.breadcrumb-nav {
  @apply flex flex-wrap py-2 px-3 md:py-3 md:px-5;
}

.breadcrumb-item {
  @apply text-sm md:text-base;
}
</style>
```

### 3. エラーハンドリング
- 無効なパスの処理
- 存在しないページへの対応
- フォールバックの実装

```typescript
const validatePath = (path: string): boolean => {
  // パスの検証ロジック
  return true;
};

const breadcrumbItems = computed(() => {
  return items.map(item => ({
    ...item,
    path: item.path && validatePath(item.path) ? item.path : undefined
  }));
});
```

### 4. パフォーマンス最適化
- 不要な再レンダリングの防止
- コンポーネントの軽量化
- 適切なキャッシング

```typescript
// computedプロパティの使用
const breadcrumbItems = computed(() => {
  // 計算済みの値をキャッシュ
  return [...];
});
```

## まとめ
パンくずリストの実装により、以下のメリットが得られます：

1. **ユーザビリティの向上**
   - サイト構造の視覚化
   - ナビゲーションの簡素化
   - ユーザーの現在位置の明確化

2. **保守性の向上**
   - コンポーネントの再利用
   - 一貫したデザイン
   - 容易なカスタマイズ

3. **SEOの改善**
   - 適切なHTML構造
   - サイト構造の明確化
   - クローラビリティの向上
</rewritten_file> 