# Zodバリデーションガイド

## 概要
このドキュメントでは、TypeScriptで使用できるバリデーションライブラリ「Zod」の使用方法について説明します。特に大会管理システムでの実装例を交えながら、実践的な使用方法を解説します。

## 目次
1. [Zodの基本概念](#zodの基本概念)
2. [基本的な使用方法](#基本的な使用方法)
3. [実践的な実装例](#実践的な実装例)
4. [高度な使用方法](#高度な使用方法)
5. [エラーハンドリング](#エラーハンドリング)
6. [パフォーマンス最適化](#パフォーマンス最適化)

## Zodの基本概念

### Zodとは
Zodは、TypeScriptで使用できるスキーマ宣言とバリデーションライブラリです。主な特徴は以下の通りです：

- **型推論**: スキーマから自動的にTypeScriptの型を生成
- **ランタイムバリデーション**: 実行時のデータ検証
- **カスタマイズ可能**: エラーメッセージやバリデーションルールのカスタマイズ
- **スキーマ合成**: 複数のスキーマを組み合わせて新しいスキーマを作成

### インストール方法
```bash
npm install zod
# または
yarn add zod
```

## 基本的な使用方法

### 1. 基本的なスキーマ定義
```typescript
import { z } from 'zod';

// 文字列のバリデーション
const StringSchema = z.string()
  .min(1, '文字列は必須です')
  .max(100, '100文字以内で入力してください');

// 数値のバリデーション
const NumberSchema = z.number()
  .min(0, '0以上の数値を入力してください')
  .max(100, '100以下の数値を入力してください');

// 日付のバリデーション
const DateSchema = z.string()
  .refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    { message: '有効な日付を入力してください' }
  );

// 列挙型のバリデーション
const EnumSchema = z.enum(['A', 'B', 'C'], {
  errorMap: () => ({ message: '有効な値を選択してください' })
});
```

### 2. オブジェクトスキーマ
```typescript
const UserSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  age: z.number().min(0, '年齢は0以上である必要があります'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
  }).optional(),
});

// 型の推論
type User = z.infer<typeof UserSchema>;
```

### 3. 配列スキーマ
```typescript
const NumberArraySchema = z.array(z.number());
const UserArraySchema = z.array(UserSchema);

// カスタムバリデーション付き配列
const CustomArraySchema = z.array(z.string())
  .min(1, '少なくとも1つの要素が必要です')
  .max(5, '最大5つまで入力できます')
  .refine(
    (items) => new Set(items).size === items.length,
    { message: '重複する値は使用できません' }
  );
```

## 実践的な実装例

### 1. 大会管理システムでの実装

#### 選手スキーマ
```typescript
const PlayerSchema = z.object({
  playerId: z.number().optional(),
  playerName: z.string().min(1, '選手名は必須です'),
  position: z.enum(['GK', 'DF', 'MF', 'FW'], {
    errorMap: () => ({ message: '有効なポジションを選択してください' })
  }),
  team: z.string().min(1, 'チーム名は必須です'),
  isStarter: z.boolean(),
  stats: z.object({
    goals: z.number().min(0, '得点数は0以上である必要があります'),
    assists: z.number().min(0, 'アシスト数は0以上である必要があります'),
  }),
});
```

#### 大会スキーマ
```typescript
const TournamentSchema = z.object({
  tournamentId: z.number().optional(),
  name: z.string().min(1, '大会名は必須です'),
  startDate: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate >= new Date();
    },
    { message: '有効な開催日を入力してください' }
  ),
  players: z.array(PlayerSchema).refine(
    (players) => {
      const starters = players.filter(p => p.isStarter);
      const bench = players.filter(p => !p.isStarter);
      return starters.length === 11 && bench.length === 7;
    },
    { message: 'スターティングメンバー11名、ベンチ7名が必要です' }
  ),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
});
```

### 2. バリデーションの実行
```typescript
// バリデーション関数
const validateTournament = (data: unknown) => {
  try {
    const validatedData = TournamentSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    throw error;
  }
};

// 使用例
const handleSubmit = async (formData: unknown) => {
  const result = validateTournament(formData);
  
  if (result.success) {
    // バリデーション成功時の処理
    await saveTournament(result.data);
  } else {
    // エラーメッセージの表示
    result.errors.forEach(({ field, message }) => {
      console.error(`${field}: ${message}`);
    });
  }
};
```

## 高度な使用方法

### 1. スキーマの合成
```typescript
// 基本スキーマ
const BaseSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
});

// 拡張スキーマ
const ExtendedSchema = BaseSchema.extend({
  email: z.string().email(),
  age: z.number().min(0),
});

// スキーマのマージ
const MergedSchema = BaseSchema.merge(
  z.object({
    address: z.string(),
    phone: z.string(),
  })
);
```

### 2. 条件付きバリデーション
```typescript
const ConditionalSchema = z.object({
  type: z.enum(['A', 'B']),
  value: z.string().refine(
    (val, ctx) => {
      if (ctx.parent.type === 'A') {
        return val.length >= 5;
      }
      return true;
    },
    { message: 'タイプAの場合は5文字以上必要です' }
  ),
});
```

### 3. カスタムバリデーション
```typescript
const CustomValidationSchema = z.object({
  password: z.string()
    .min(8, 'パスワードは8文字以上必要です')
    .refine(
      (val) => /[A-Z]/.test(val),
      { message: '大文字を含める必要があります' }
    )
    .refine(
      (val) => /[0-9]/.test(val),
      { message: '数字を含める必要があります' }
    ),
});
```

## エラーハンドリング

### 1. エラーメッセージのカスタマイズ
```typescript
const CustomErrorSchema = z.object({
  field: z.string().min(1, {
    message: 'このフィールドは必須です',
    path: ['field'],
  }),
});
```

### 2. エラーの集約と表示
```typescript
const handleValidationError = (error: z.ZodError) => {
  const errorMessages = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  // エラーメッセージの表示
  errorMessages.forEach(({ field, message }) => {
    console.error(`${field}: ${message}`);
  });
  
  return errorMessages;
};
```

## パフォーマンス最適化

### 1. スキーマのキャッシュ
```typescript
// スキーマのキャッシュ
const cachedSchema = TournamentSchema.cache();

// バリデーションの実行
const result = cachedSchema.parse(data);
```

### 2. 部分的なバリデーション
```typescript
// 必要なフィールドのみバリデーション
const validateRequiredFields = (data: unknown) => {
  return TournamentSchema.pick({
    startDate: true,
    players: true,
  }).parse(data);
};
```

## まとめ
Zodを使用することで、以下のメリットが得られます：

1. **型安全性の確保**
   - スキーマから自動的に型を生成
   - コンパイル時の型チェック

2. **ランタイムバリデーション**
   - 実行時のデータ検証
   - カスタマイズ可能なバリデーションルール

3. **開発効率の向上**
   - スキーマの再利用
   - エラーメッセージの一元管理

4. **保守性の向上**
   - 型とバリデーションの一元管理
   - コードの可読性向上

### 実装時の注意点
- 適切なエラーメッセージの設定
- スキーマの再利用性の考慮
- パフォーマンスへの配慮
- エラーハンドリングの実装 