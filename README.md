# Cloudflare TODO Sample

React + TypeScript + Vite で作った、Cloudflare Pages のデプロイ練習用TODOアプリです。

## ローカルで起動

```bash
npm install
npm run dev
```

## Cloudflare Workers にデプロイ

このプロジェクトには `wrangler.jsonc` が含まれているため、次の設定でデプロイできます。

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy --assets ./dist`

デプロイ後のURLは `https://todo-app.oharuka27.workers.dev` です。

## Cloudflare Access で保護する

Access はアプリに到達する前に認証を行うため、React側にログイン処理や秘密情報を追加する必要はありません。

1. Cloudflare Dashboard で **Zero Trust** → **Access** → **Applications** → **Add an application** を開きます。
2. **Self-hosted** を選択します。
3. Application name に `todo-app`、Session duration は任意の期間を指定します。
4. Public hostname に `todo-app.oharuka27.workers.dev` を登録します。
   - subdomain: todo-app
   - domain: oharuka27.workers.dev
   - path: empty
5. Policy を作成し、次のように設定します。
   - Selector: `Emails`
   - Value: `oharuka27@gmail.com`
6. 上記ポリシーを 許可(Allow) に設定する
7. Cloudflare Dashboardで Zero Trust を開く
8. Left side menu > Integrations
9. Identity providers
10. **Your identity providers** > **Add new identity provider**
11. Select **One-time PIN**

以後、アプリURLへアクセスするとメールOTPの入力を求められ、`oharuka27@gmail.com` のみ利用できます。Access設定後は、Cloudflare Dashboardのアプリケーション画面から認証ログと許可ポリシーを確認できます。

以後は対象ブランチへ push するたびに自動で再デプロイされます。

## 機能

- TODOの追加、完了状態の切り替え、削除
- すべて・未完了・完了の絞り込み
- 完了済みTODOの一括削除
- `localStorage` によるブラウザ内保存

このサンプルはバックエンドを使用しないため、データは端末・ブラウザ間で同期されません。
