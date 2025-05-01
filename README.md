# FC25 Tools

FC25 のデータを管理・分析するためのツール群

## 機能

- トーナメントデータの管理
- 進化（EVO）データの管理
- ヘッダーの固定表示（スクロール時も常に表示）

## 技術スタック

- **フロントエンド:** [Nuxt.js 3](https://nuxt.com/)
- **バックエンド:** Node.js ver18 系 (Express)
- **データベース:** MySQL
- **スタイリング:** Tailwind CSS ver4.00 [導入手順](https://tailwindcss.com/docs/installation/framework-guides/nuxt)
  カラー：https://tailwindcss.com/docs/colors
- **言語:** TypeScript

## 📚 ライブラリ

- **アイコン:** @iconify/vue
- **カレンダー:** @vuepic/vue-datepicker
- **フォームバリデーション:** vee-validate, yup
- **HTTP 通信:** axios

### バックエンド

- **Web フレームワーク:** express
- **データベース:** mysql2
- **ID 生成:** uuid

## 📌 主な機能

### 大会データ管理

- 大会情報の登録・編集
- 選手データの管理（18 名登録）
  - スターティングメンバー 11 名
  - ベンチメンバー 7 名
- 得点・アシストの記録
- MVP 選手の選定

### 表示機能

- 大会一覧表示
- 選手一覧表示
- 得点ランキング
- アシストランキング

### 今後の拡張予定

- 試合データの統計＆分析
- ハンバーガーメニュー+サイドバー
- その他便利ツールの追加

## 📦 セットアップ

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

### バックエンド

```bash
cd backend
npm install
npm run dev
```

### データベース

MySQL のセットアップが必要です。以下のコマンドでデータベースとテーブルを作成してください：

```sql
-- データベースの作成
CREATE DATABASE fc25_tools;

-- テーブルの作成
-- 詳細なSQLは docs/design/system_design.md を参照
```

## 📝 ドキュメント

詳細な設計ドキュメントは `docs/design/system_design.md` を参照してください。
