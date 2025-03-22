import { NextResponse } from 'next/server';
import { z } from 'zod';

// ステータスのスキーマ定義
const playerStatsSchema = z.object({
  overall: z.number().min(50).max(99),
  pace: z.number().min(50).max(99),
  shooting: z.number().min(50).max(99),
  passing: z.number().min(50).max(99),
  dribbling: z.number().min(50).max(99),
  defending: z.number().min(50).max(99),
  physical: z.number().min(50).max(99),
});

// リクエストボディのスキーマ定義
const createEvolutionPlayerSchema = z.object({
  name: z.string().min(1, '選手名は必須です'),
  position: z.enum(['FW', 'MF', 'DF', 'GK'], {
    errorMap: () => ({ message: 'ポジションは必須です' }),
  }),
  stats: playerStatsSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createEvolutionPlayerSchema.parse(body);

    // TODO: データベースに保存する処理を実装
    // 仮のレスポンス
    return NextResponse.json(
      {
        message: 'エボリューション選手を登録しました',
        data: {
          id: '1', // 仮のID
          ...validatedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'バリデーションエラー',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('エボリューション選手登録エラー:', error);
    return NextResponse.json(
      {
        message: 'エボリューション選手の登録に失敗しました',
      },
      { status: 500 }
    );
  }
} 