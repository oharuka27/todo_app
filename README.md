# Cloudflare TODO Sample

React + TypeScript + Vite で構築した TODO アプリです。
Vitest による自動テスト、GitHub Actions での CI/CD、Cloudflare へのデプロイを含む構成になっています。

## 概要

- TODO の追加
- 完了 / 未完了の切り替え
- 削除と一括削除
- すべて / 未完了 / 完了のフィルタ
- `localStorage` による保存
- Vitest でのユニットテスト
- GitHub Actions でテスト結果をメール通知
- テスト成功時のみ Cloudflare へデプロイ

## ローカルでの起動

```bash
npm install
npm run dev
```

## テスト実行

```bash
npm test
```

監視モード:

```bash
npm run test:watch
```

## ビルド

```bash
npm run build
```

## GitHub Actions での CI/CD

このプロジェクトでは GitHub Actions により、以下のフローを実行します。

- `npm ci` で依存関係をインストール
- `npm test` で Vitest を実行
- 成功時: アプリをビルドして Cloudflare にデプロイ
- 失敗時: メール通知を送信し、Cloudflare デプロイはスキップ

ワークフロー定義は [.github/workflows/ci.yml](.github/workflows/ci.yml) にあります。

### 必須設定

GitHub のリポジトリ設定で、以下を登録してください。

#### Secrets
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

#### Variables
- `NOTIFY_EMAIL`

成功時は指定メールアドレスに「テスト全パス」の通知を送信し、失敗時は「テスト失敗」の通知を送信します。

## Cloudflare へのデプロイ

このプロジェクトには `wrangler.jsonc` があり、デプロイコマンドは次の通りです。

```bash
npx wrangler deploy --assets ./dist
```

build コマンドは:

```bash
npm run build
```

## Cloudflare Access で保護する

必要に応じて Cloudflare Access を利用して、アプリへのアクセスをメール認証で制限できます。

1. Cloudflare Dashboard で Zero Trust → Access → Applications を開く
2. Self-hosted を選択
3. Public hostname を設定
4. Policy で `Emails` を許可
5. One-time PIN などの IdP を設定

この構成により、指定メールアドレス以外のアクセスを遮断できます。

## 補足

このアプリはバックエンドを持たないため、データはブラウザの `localStorage` に保存されます。
そのため、端末やブラウザ間ではデータが同期されません。
