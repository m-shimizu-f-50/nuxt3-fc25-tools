require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8890;

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

// サンプルルート
app.get('/', (req, res) => {
	res.send('Hello, World!');
});

// ユーザー一覧を取得するルート
// app.get('/users', (req, res) => {
// 	const query = 'SELECT * FROM users';
// 	db.query(query, (err, results) => {
// 		if (err) {
// 			console.error('データ取得エラー:', err);
// 			res.status(500).send('サーバーエラー');
// 			return;
// 		}
// 		res.json(results);
// 	});
// });

// サーバーの起動
app.listen(port, () => {
	console.log(`サーバーがポート${port}で起動しました`);
});
