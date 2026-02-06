# HankoSign Digital - クイックスタートガイド

## 🚀 5分で始める

### 1. 環境セットアップ

#### 必要なツール
```bash
# Node.js 18以上をインストール
node --version  # v18.0.0以上

# PostgreSQLのインストール (macOS)
brew install postgresql@14
brew services start postgresql@14

# Redisのインストール (macOS)
brew install redis
brew services start redis
```

#### プロジェクトセットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数のコピー
cp .env.example .env
```

### 2. 環境変数の設定

`.env`ファイルを編集:

```env
# データベース (ローカル開発用)
DATABASE_URL="postgresql://postgres:password@localhost:5432/hankosign_dev"

# NextAuth (ランダムな文字列を生成)
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 (開発環境では一時的にダミー値でOK)
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET_NAME="hankosign-dev"

# Redis
REDIS_URL="redis://localhost:6379"
```

### 3. データベース初期化

```bash
# Prismaマイグレーション
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

---

## 📝 最初の使い方

### ステップ1: アカウント作成
1. トップページの「無料登録」をクリック
2. 以下の情報を入力:
   - 氏名: 山田太郎
   - メール: test@example.com
   - パスワード: password123
3. 「アカウントを作成」をクリック

### ステップ2: ログイン
1. 登録したメールとパスワードでログイン
2. ダッシュボードが表示されます

### ステップ3: デジタル判子を作成
1. サイドバーの「判子を作成」をクリック
2. 判子情報を入力:
   - 判子名: 営業部用認印
   - 種類: 認印
3. デザイナーでテキストを入力: 山田
4. フォントと回転を調整
5. 「判子を保存」をクリック

### ステップ4: 文書をアップロード
1. サイドバーの「文書をアップロード」をクリック
2. PDFまたは画像ファイルを選択
3. 文書情報を入力:
   - タイトル: テスト契約書
   - 種類: 契約書
4. 「文書をアップロード」をクリック

### ステップ5: 署名する
1. 文書一覧から作成した文書を開く
2. 右側のパネルで判子を選択
3. 「文書に署名する」をクリック
4. 署名が追加されます！

### ステップ6: 検証する
1. 文書詳細ページの「検証ページ」リンクをクリック
2. 新しいタブで公開検証ページが開きます
3. 署名の履歴と真正性を確認できます

---

## 🛠️ 開発ツール

### Prisma Studio (データベースGUI)
```bash
npm run db:studio
```
ブラウザで http://localhost:5555 が開きます

### データベースリセット
```bash
npx prisma migrate reset
```

### 新しいマイグレーション
```bash
npx prisma migrate dev --name your_migration_name
```

---

## 🐛 トラブルシューティング

### データベース接続エラー
```bash
# PostgreSQLが起動しているか確認
brew services list

# PostgreSQLを再起動
brew services restart postgresql@14
```

### Redis接続エラー
```bash
# Redisが起動しているか確認
redis-cli ping  # PONGと返ってくればOK

# Redisを再起動
brew services restart redis
```

### ポート3000が使用中
```bash
# 使用しているプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### Prismaエラー
```bash
# Prisma Clientを再生成
npx prisma generate

# データベースをリセット
npx prisma migrate reset
```

---

## 📚 主要コマンド一覧

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# データベースマイグレーション
npm run db:migrate

# Prisma Studio
npm run db:studio

# 型チェック
npx tsc --noEmit

# リント
npm run lint
```

---

## 🌟 次のステップ

1. **複数の判子を作成**: 銀行印、実印も作成してみましょう
2. **複数人での署名**: 他のユーザーアカウントを作成して順次署名
3. **ワークフロー作成**: 承認フローを設定（将来実装）
4. **検証コードの共有**: 検証URLを他の人と共有

---

## 💡 ヒント

- 判子のテキストは1〜4文字が最適
- 文書形式はPDFが推奨
- 検証コードは安全に保管してください
- 本番環境ではAWS S3の設定が必須

---

## 📞 サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。

---

**Happy Coding! 🚀**
