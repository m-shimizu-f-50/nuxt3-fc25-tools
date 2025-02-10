require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const tournamentsRouter = require('./routes/tournaments');

const app = express();
const port = 8890;

// CORSの設定
app.use(
	cors({
		origin: 'http://localhost:3000', // フロントエンドのオリジンを指定
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // 許可するHTTPメソッド
		credentials: true, // クッキーを含むリクエストを許可する場合
	})
);

// MySQLデータベース接続の設定
const db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
});

// データベース接続
db.connect((err) => {
	if (err) {
		console.error('データベース接続エラー:', err);
		return;
	}
	console.log('データベースに接続されました');
});

// JSONリクエストボディのパース
app.use(express.json());

// 大会ルート
app.use('/api/tournaments', tournamentsRouter);

// サーバーの起動
app.listen(port, () => {
	console.log(`サーバーがポート${port}で起動しました`);
});
