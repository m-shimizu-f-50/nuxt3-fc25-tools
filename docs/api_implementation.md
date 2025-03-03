# API実装ドキュメント

## 概要
このドキュメントでは、大会管理システムのAPIの実装方法について説明します。

## API エンドポイント構成

### 大会関連 API

#### 1. 大会一覧取得
- **エンドポイント**: `GET /api/tournaments`
- **処理内容**: 全ての大会情報を取得
- **レスポンス**:
```typescript
interface Tournament {
    tournamentId: number;
    startDate: string;    // YYYY-MM-DD形式
    wins: number;
    losses: number;
    mvpName: string;
    players: {
        playerId: number;
        playerName: string;
        totalGoals: number;
        totalAssists: number;
    }[];
}
```

#### 2. 大会詳細取得
- **エンドポイント**: `GET /api/tournaments/:id`
- **処理内容**: 指定されたIDの大会の詳細情報を取得
- **パラメータ**: `id` - 大会ID

#### 3. 大会作成
- **エンドポイント**: `POST /api/tournaments`
- **処理内容**: 新規大会を作成
- **リクエストボディ**:
```typescript
{
    startDate: string;    // YYYY-MM-DD形式
    players: {
        playerName: string;
        position: 'GK' | 'DF' | 'MF' | 'FW';
        team: string;
        isStarter: boolean;
    }[];
}
```

#### 4. 大会更新
- **エンドポイント**: `PUT /api/tournaments/:id`
- **処理内容**: 大会情報を更新
- **パラメータ**: `id` - 大会ID
- **リクエストボディ**:
```typescript
{
    startDate: string;
    comment: string;
    wins: number;
    losses: number;
    mvpPlayerId: number | null;
    players: {
        playerId: number;
        playerName: string;
        position: string;
        team: string;
        isStarter: boolean;
        totalGoals: number;
        totalAssists: number;
    }[];
}
```

#### 5. 大会削除
- **エンドポイント**: `DELETE /api/tournaments/:id`
- **処理内容**: 指定された大会を削除
- **パラメータ**: `id` - 大会ID

## データの流れ

### 1. 大会一覧表示
1. フロントエンドが`GET /api/tournaments`を呼び出し
2. バックエンドがデータベースから大会情報を取得
3. フロントエンドで日付順にソート
4. 各種情報（勝率、ランク等）を計算して表示

### 2. 大会登録フロー
1. フロントエンドでフォーム入力
2. バリデーション（選手数、必須項目等）
3. `POST /api/tournaments`でデータ送信
4. バックエンドでUUID生成
5. データベースに保存
6. 作成完了後、一覧画面へリダイレクト

### 3. 大会更新フロー
1. `GET /api/tournaments/:id`で現在の情報を取得
2. フロントエンドで編集
3. バリデーション
   - 日付の妥当性チェック
   - 選手情報の検証
   - MVP選手の確認
4. `PUT /api/tournaments/:id`でデータ更新
5. 更新結果の表示

### 4. 大会削除フロー
1. 削除確認ダイアログ表示
2. `DELETE /api/tournaments/:id`を実行
3. 成功時は一覧から該当データを削除
4. 一覧の表示を更新

## バリデーションルール

### 大会登録/更新時
1. **日付**
   - 必須
   - YYYY-MM-DD形式
   - 過去の日付は不可

2. **選手情報**
   - スターター11名、ベンチ7名が必須
   - 選手名の重複不可
   - ポジションは GK, DF, MF, FW のいずれか
   - チーム名は必須

3. **試合結果**
   - 勝敗数は0以上の整数
   - 得点・アシストは0以上の整数

## エラーハンドリング

### フロントエンド
```typescript
try {
    // API呼び出し
} catch (error) {
    // エラーメッセージの表示
    console.error('エラー詳細:', error);
    alert('エラーが発生しました');
}
```

### バックエンド
```javascript
// エラーレスポンス例
{
    error: string;
    details?: any;
}
```

## 日付処理
- フロントエンドでの日付フォーマット
```typescript
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
```

## セキュリティ考慮事項
1. 入力値のサニタイズ
2. SQLインジェクション対策
3. CSRF対策
4. レートリミット
5. エラーメッセージでの情報漏洩防止

## パフォーマンス最適化
1. 必要なデータのみを取得
2. キャッシュの活用
3. ページネーションの実装（必要に応じて）
4. インデックスの適切な設定 

## API実装方法

### フロントエンド実装

#### API定数の定義
```typescript
// constants/api.ts
export const API_ENDPOINTS = {
  TOURNAMENTS: {
    LIST: '/api/tournaments',
    DETAIL: (id: string) => `/api/tournaments/${id}`,
    CREATE: '/api/tournaments',
    UPDATE: (id: string) => `/api/tournaments/${id}`,
    DELETE: (id: string) => `/api/tournaments/${id}`,
  },
} as const;
```

#### APIクライアントの実装
```typescript
// utils/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tournamentApi = {
  // 一覧取得
  async getList() {
    const response = await apiClient.get<Tournament[]>(API_ENDPOINTS.TOURNAMENTS.LIST);
    return response.data;
  },

  // 詳細取得
  async getDetail(id: string) {
    const response = await apiClient.get<Tournament>(API_ENDPOINTS.TOURNAMENTS.DETAIL(id));
    return response.data;
  },

  // 作成
  async create(data: CreateTournamentDto) {
    const response = await apiClient.post<Tournament>(API_ENDPOINTS.TOURNAMENTS.CREATE, data);
    return response.data;
  },

  // 更新
  async update(id: string, data: UpdateTournamentDto) {
    const response = await apiClient.put<Tournament>(API_ENDPOINTS.TOURNAMENTS.UPDATE(id), data);
    return response.data;
  },

  // 削除
  async delete(id: string) {
    await apiClient.delete(API_ENDPOINTS.TOURNAMENTS.DELETE(id));
  },
};
```

#### コンポーネントでの使用例
```typescript
// pages/tournaments/index.vue
const tournaments = ref<Tournament[]>([]);

const fetchTournaments = async () => {
  try {
    tournaments.value = await tournamentApi.getList();
  } catch (error) {
    console.error('大会一覧取得エラー:', error);
    alert('大会一覧の取得に失敗しました');
  }
};

// 削除処理
const handleDelete = async (id: string) => {
  if (!confirm('本当に削除しますか？')) return;
  
  try {
    await tournamentApi.delete(id);
    tournaments.value = tournaments.value.filter(t => t.tournamentId !== id);
    alert('削除が完了しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};
```

### バックエンド実装

#### ルーティング
```javascript
// routes/tournaments.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 一覧取得
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id as tournament_id,
        t.start_date,
        t.wins,
        t.losses,
        t.mvp_player_id,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'playerId', p.id,
            'playerName', p.name,
            'totalGoals', p.total_goals,
            'totalAssists', p.total_assists
          )
        ) as players
      FROM tournaments t
      LEFT JOIN players p ON p.tournament_id = t.id
      GROUP BY t.id
      ORDER BY t.start_date DESC
    `;
    
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// 詳細取得
router.get('/:id', async (req, res) => {
  try {
    const [tournament] = await db.query(
      'SELECT * FROM tournaments WHERE id = ?',
      [req.params.id]
    );
    
    if (!tournament) {
      return res.status(404).json({ error: '大会が見つかりません' });
    }
    
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// 新規作成
router.post('/', async (req, res) => {
  const { startDate, players } = req.body;
  
  try {
    // バリデーション
    if (!validateTournamentData(req.body)) {
      return res.status(400).json({ error: '入力データが不正です' });
    }
    
    // トランザクション開始
    await db.beginTransaction();
    
    // 大会の作成
    const [result] = await db.query(
      'INSERT INTO tournaments (start_date) VALUES (?)',
      [startDate]
    );
    
    const tournamentId = result.insertId;
    
    // 選手の登録
    for (const player of players) {
      await db.query(
        `INSERT INTO players (
          tournament_id, name, position, team, is_starter
        ) VALUES (?, ?, ?, ?, ?)`,
        [tournamentId, player.playerName, player.position, player.team, player.isStarter]
      );
    }
    
    await db.commit();
    res.status(201).json({ tournamentId });
  } catch (error) {
    await db.rollback();
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

module.exports = router;
```

#### バリデーション関数の実装例
```javascript
// utils/validation.js
const validateTournamentData = (data) => {
  const { startDate, players } = data;
  
  // 日付のバリデーション
  if (!isValidDate(startDate)) {
    return false;
  }
  
  // 選手数のチェック
  const starters = players.filter(p => p.isStarter);
  const bench = players.filter(p => !p.isStarter);
  
  if (starters.length !== 11 || bench.length !== 7) {
    return false;
  }
  
  // 選手名の重複チェック
  const playerNames = players.map(p => p.playerName);
  if (new Set(playerNames).size !== players.length) {
    return false;
  }
  
  // その他のバリデーション...
  
  return true;
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date >= new Date();
};
```

## データ型定義

### フロントエンド用の型定義
```typescript
// types/tournament.ts

// 大会情報
export interface Tournament {
  tournamentId: number;
  startDate: string;
  wins: number;
  losses: number;
  mvpName: string | null;
  players: Player[];
}

// 選手情報
export interface Player {
  playerId: number;
  playerName: string;
  position: Position;
  team: string;
  isStarter: boolean;
  totalGoals: number;
  totalAssists: number;
}

// ポジション
export type Position = 'GK' | 'DF' | 'MF' | 'FW';

// 大会作成DTO
export interface CreateTournamentDto {
  startDate: string;
  players: CreatePlayerDto[];
}

// 選手作成DTO
export interface CreatePlayerDto {
  playerName: string;
  position: Position;
  team: string;
  isStarter: boolean;
}

// 大会更新DTO
export interface UpdateTournamentDto {
  startDate: string;
  comment: string;
  wins: number;
  losses: number;
  mvpPlayerId: number | null;
  players: UpdatePlayerDto[];
}

// 選手更新DTO
export interface UpdatePlayerDto {
  playerId: number;
  playerName: string;
  position: Position;
  team: string;
  isStarter: boolean;
  totalGoals: number;
  totalAssists: number;
}
```

## 実装の詳細説明

### 1. プロジェクト構成

```
project/
├── frontend/
│   ├── components/        # 再利用可能なコンポーネント
│   ├── pages/            # ページコンポーネント
│   ├── types/            # 型定義
│   ├── utils/            # ユーティリティ関数
│   └── constants/        # 定数定義
└── backend/
    ├── routes/           # APIルート
    ├── utils/            # ユーティリティ関数
    └── db/               # データベース関連
```

### 2. フロントエンド実装の詳細

#### 2.1 APIクライアントの設計思想
- **集中管理**: すべてのAPI呼び出しを`utils/api.ts`に集約
- **型安全性**: TypeScriptの型システムを活用
- **エラーハンドリング**: 統一的なエラー処理
- **再利用性**: 共通のaxiosインスタンスを使用

```typescript
// 実装例：エラーハンドリング付きのAPI呼び出し
const fetchTournamentWithErrorHandling = async (id: string) => {
  try {
    const data = await tournamentApi.getDetail(id);
    return { success: true, data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // APIエラーの場合
      const message = error.response?.data?.error || '不明なエラーが発生しました';
      return { success: false, error: message };
    }
    // その他のエラー
    return { success: false, error: '予期せぬエラーが発生しました' };
  }
};
```

#### 2.2 状態管理の方針
- **ローカルステート**: `ref`/`reactive`を使用
- **コンポーネント間の状態共有**: `provide`/`inject`を活用
- **グローバルステート**: 必要に応じてPiniaを使用

```typescript
// 実装例：状態管理
const tournamentState = reactive({
  tournaments: [] as Tournament[],
  loading: false,
  error: null as string | null,
});

const actions = {
  async fetchTournaments() {
    tournamentState.loading = true;
    tournamentState.error = null;
    try {
      const data = await tournamentApi.getList();
      tournamentState.tournaments = data;
    } catch (error) {
      tournamentState.error = '取得に失敗しました';
    } finally {
      tournamentState.loading = false;
    }
  }
};
```

### 3. バックエンド実装の詳細

#### 3.1 ルーティング設計の原則
1. **リソース指向**: RESTful APIの原則に従う
2. **エンドポイントの一貫性**: 命名規則の統一
3. **適切なHTTPメソッド**: 操作に応じた使い分け
4. **エラーレスポース**: 統一されたフォーマット

```javascript
// 実装例：エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'バリデーションエラー',
      details: err.details
    });
  }
  
  if (err.name === 'DatabaseError') {
    return res.status(500).json({
      error: 'データベースエラー',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  res.status(500).json({
    error: '予期せぬエラーが発生しました'
  });
};
```

#### 3.2 データベース操作の原則
1. **トランザクション管理**: データの整合性確保
2. **プリペアドステートメント**: SQLインジェクション対策
3. **エラーハンドリング**: 適切なロールバック処理
4. **コネクションプール**: 効率的なリソース管理

```javascript
// 実装例：トランザクション処理
const createTournamentWithPlayers = async (tournamentData, playersData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // 大会の作成
    const [tournament] = await connection.query(
      'INSERT INTO tournaments SET ?',
      tournamentData
    );
    
    // 選手の一括登録
    const playerValues = playersData.map(player => [
      tournament.insertId,
      player.name,
      player.position,
      player.team
    ]);
    
    await connection.query(
      'INSERT INTO players (tournament_id, name, position, team) VALUES ?',
      [playerValues]
    );
    
    await connection.commit();
    return tournament.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

### 4. バリデーション実装の詳細

#### 4.1 フロントエンドバリデーション
1. **入力時バリデーション**: リアルタイムチェック
2. **送信時バリデーション**: API呼び出し前の最終チェック
3. **カスタムバリデーションルール**: 業務ロジックに応じた検証

```typescript
// 実装例：バリデーションルール
const validateTournament = (data: CreateTournamentDto): ValidationResult => {
  const errors: string[] = [];
  
  // 日付のバリデーション
  if (!isValidDate(data.startDate)) {
    errors.push('開催日が無効です');
  }
  
  // 選手情報のバリデーション
  const { starters, bench } = validatePlayers(data.players);
  if (!starters) errors.push('スターティングメンバーは11名必要です');
  if (!bench) errors.push('ベンチメンバーは7名必要です');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### 4.2 バックエンドバリデーション
1. **スキーマバリデーション**: データ構造の検証
2. **ビジネスロジック**: 業務ルールの検証
3. **データベース制約**: DB層でのバリデーション

### 5. エラーハンドリングの実装

#### 5.1 フロントエンドのエラー処理
1. **ユーザーフレンドリーなメッセージ**
2. **適切なUI表示**: ローディング状態、エラー状態
3. **リトライメカニズム**: 必要に応じて再試行

#### 5.2 バックエンドのエラー処理
1. **詳細なログ記録**
2. **適切なステータスコード**
3. **セキュアなエラーメッセージ**

### 6. パフォーマンス最適化の実装

#### 6.1 フロントエンド最適化
1. **データのキャッシュ**
2. **必要なデータのみ取得**
3. **ページネーション実装**

#### 6.2 バックエンド最適化
1. **クエリの最適化**
2. **インデックス設計**
3. **キャッシュ戦略** 