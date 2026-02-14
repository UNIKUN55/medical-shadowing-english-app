# Medical English Shadowing App

医療英語専門のシャドウイング学習Webアプリケーション

**本番環境URL:** https://medical-english-shadowing-app.web.app

---

## 機能

- ユーザー登録・ログイン（簡易認証）
- シナリオ別シャドウイング練習（4シナリオ）
- TTS（Text-to-Speech）音声再生
- STT（Speech-to-Text）音声認識
- 発音評価・採点システム
- 進捗管理（ベストスコア保存）
- 単語ブックマーク機能
- 単語リスト・詳細表示

---

## 技術スタック

### フロントエンド
- React 18.2
- Vite 5.0
- Tailwind CSS 3.4
- Web Speech API (TTS/STT)
- Firebase Hosting

### バックエンド
- Node.js 20
- Express 4.18
- PostgreSQL 15
- JWT認証
- Cloud Run

### インフラ
- Docker & Docker Compose（開発環境）
- Google Cloud Platform
  - Cloud Run（バックエンド）
  - Cloud SQL（データベース）
  - Firebase Hosting（フロントエンド）

---

## 本番環境

### アプリケーションURL
```
https://medical-english-shadowing-app.web.app
```

### バックエンドAPI
```
https://medical-english-backend-909768823641.asia-northeast1.run.app
```

### 推奨環境
- **対応ブラウザ**: 
  -  Google Chrome（最新版）
  -  Microsoft Edge（最新版）
  -  Safari（最新版）
- **マイク**: 必須
- **インターネット接続**: 必須

### 動作確認済み
- Windows 10/11: Chrome, Edge
- macOS: Safari, Chrome
- iOS: Safari

---

## ローカル開発環境セットアップ

### 前提条件
- Docker Desktop インストール済み
- Git インストール済み
- Node.js 20以上（オプション）

---

### 1. リポジトリクローン
```bash
git clone https://github.com/UNIKUN55/medical-shadowing-english-app.git
cd medical-shadowing-english-app
```

---

### 2. 環境変数設定

#### バックエンド
```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集：
```env
DATABASE_URL=postgresql://user:password@db:5432/medical_english
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

#### フロントエンド
```bash
cd frontend
cp .env.example .env
```

`.env` ファイル：
```env
VITE_API_URL=http://localhost:3000
```

---

### 3. Docker起動

プロジェクトルートで実行：
```bash
docker-compose up -d --build
```

確認：
```bash
docker-compose ps
```

3つのコンテナ（frontend, backend, db）が **Up** になっていればOK。

---

### 4. データベース初期化
```bash
# マイグレーション実行
docker cp backend/migrations/001_create_tables.sql med-english-db:/tmp/
docker-compose exec db psql -U user -d medical_english -f /tmp/001_create_tables.sql

# シードデータ投入
docker cp backend/seeds/001_initial_data.sql med-english-db:/tmp/
docker-compose exec db psql -U user -d medical_english -f /tmp/001_initial_data.sql
```

---

### 5. 動作確認

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3000/health
- **データベース**: `docker-compose exec db psql -U user -d medical_english`

---

## プロジェクト構造
```
medical-shadowing-english-app/
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── contexts/      # React Context（認証等）
│   │   ├── services/      # API通信
│   │   └── utils/         # ユーティリティ関数
│   ├── Dockerfile
│   └── package.json
├── backend/               # Node.js バックエンド
│   ├── src/
│   │   ├── routes/        # APIルート
│   │   ├── middleware/    # ミドルウェア
│   │   └── utils/         # ユーティリティ関数
│   ├── migrations/        # DBマイグレーション
│   ├── seeds/             # 初期データ
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker構成
├── README.md
└── DEPLOYMENT.md          # デプロイ手順書
```

---

## API確認

### ヘルスチェック
```bash
curl http://localhost:3000/health
```

### ユーザー登録
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### シナリオ一覧取得
```bash
curl http://localhost:3000/api/scenarios \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 本番環境へのデプロイ

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照

### デプロイ概要

1. **Cloud SQL**: PostgreSQLデータベース
2. **Cloud Run**: バックエンドAPI
3. **Firebase Hosting**: フロントエンド

### 必要な手順

1. GCPプロジェクト作成
2. Cloud SQL インスタンス作成
3. データベース初期化
4. Cloud Run デプロイ
5. Firebase Hosting デプロイ
6. CORS設定

---

## 運用コスト

| サービス | プラン | 月額 |
|---------|--------|------|
| Cloud SQL | db-f1-micro | ¥2,200 |
| Cloud Run | ~100req/月 | ¥300 |
| Firebase Hosting | 無料枠 | ¥0 |
| **合計** | | **¥2,500** |

想定ユーザー: 月100人

---

## トラブルシューティング

### Docker起動エラー
```bash
# コンテナ停止
docker-compose down

# キャッシュクリア
docker-compose build --no-cache

# 再起動
docker-compose up -d
```

### ポート競合エラー
```bash
# 使用中のコンテナ確認
docker ps -a

# 停止
docker stop <container_id>
```

### データベース接続エラー
```bash
# コンテナログ確認
docker-compose logs db

# データベース接続確認
docker-compose exec db psql -U user -d medical_english
```

### Cloud SQL接続エラー（本番環境）
```bash
# Cloud SQL Proxy経由で接続確認
cloud-sql-proxy medical-english-shadowing-app:asia-northeast1:medical-english-db
psql -h localhost -U app_user -d medical_english
```

### CORS エラー（本番環境）

`backend/src/server.js` の `ALLOWED_ORIGINS` にフロントエンドURLを追加
```javascript
const ALLOWED_ORIGINS = [
  'https://medical-english-shadowing-app.web.app',
  'https://medical-english-shadowing-app.firebaseapp.com'
];
```

---

## 参考資料

- [Cloud SQL ドキュメント](https://cloud.google.com/sql/docs)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## ライセンス

MIT License

---
