# Cloudflare TODO Sample

React + TypeScript + Vite で作った、Cloudflare Pages のデプロイ練習用TODOアプリです。

## ローカルで起動

```bash
npm install
npm run dev
```

## Cloudflare Pages にデプロイ

1. このフォルダを GitHub リポジトリへ push します。
2. Cloudflare Dashboard の **Workers & Pages** → **Create** → **Pages** → **Connect to Git** を選択します。
3. リポジトリを選び、次の設定でデプロイします。
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Save and Deploy** を押します。

以後は対象ブランチへ push するたびに自動で再デプロイされます。

## 機能

- TODOの追加、完了状態の切り替え、削除
- すべて・未完了・完了の絞り込み
- 完了済みTODOの一括削除
- `localStorage` によるブラウザ内保存

このサンプルはバックエンドを使用しないため、データは端末・ブラウザ間で同期されません。
