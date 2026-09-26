# ちょっと待った！その付箋

紙の付箋に書く代わりに使う、エコ志向の TODO アプリです。
タスクを書いたり書き直したりするたびに「使わずに済んだ付箋」を数え、削減できた CO₂ の目安を表示します。

React + TypeScript + Vite で構築し、Vitest による自動テスト、GitHub Actions による CI、Cloudflare の Git 連携による自動デプロイを組み合わせています。

## 機能

- **付箋削減カウンター**: タスクの追加・編集を保存するたびに +1 し、削減できた付箋の枚数と CO₂ 削減量（1枚あたり約 0.5g で概算）を葉っぱ型のバッジに表示
- **その場で入力**: ＋ボタンを押すと一覧の先頭に項目ができ、そのまま入力できる（空のまま閉じると自動で破棄）
- **キーボードショートカット**
  - `N`: 新しいタスクを追加（文字入力中は反応しない）
  - `Shift + Enter`: 入力中の項目を確定して、続けて次の項目を追加
- **編集**: タスク名をクリック（タップ）で編集。キーボードでは `Tab` で選んで `Enter`。`Enter` / 入力欄の外をクリックで保存、`Esc` でキャンセル
- **完了管理**: 完了 / 未完了の切り替え、完了済みの一括削除
- **フィルター**: すべて / 未完了 / 完了
- **並び替え**: 項目を長押しで持ち上げ、離した位置に移動（マウスは押したまま動かすだけでも可）。Pointer Events で実装しているため、スマホのタッチでも動作し、一覧の端に近づくと自動スクロール
- **表示切り替え**: 1列 / 2列
- **保存**: タスク・カウンター・表示列数をブラウザの `localStorage` に保存

## 技術スタック

| 分類 | 使用技術 |
|---|---|
| UI | React 19, TypeScript |
| ビルド | Vite |
| テスト | Vitest, jsdom |
| CI | GitHub Actions |
| 実行環境 | Node.js 24（[.node-version](.node-version) で指定） |
| 配信 | Cloudflare Workers（静的アセット）、Workers Builds（Git 連携による自動デプロイ） |

## ディレクトリ構成

```
src/
├── App.tsx                     # 画面全体の組み立てと、編集中の項目・フィルターの状態
├── todoUtils.ts                # TODO 操作の純粋関数（追加・編集・削除・並び替え・集計・保存データ読み込み）
├── todoUtils.test.ts           # todoUtils のユニットテスト
├── layout.ts                   # 1列 / 2列表示の型と読み込み
├── hooks/
│   ├── useTodos.ts             # TODO 一覧と付箋カウンターの状態・操作
│   ├── usePersistentState.ts   # localStorage に保存し続ける useState
│   ├── useDragReorder.ts       # 長押しでの並び替え（マウス・タッチ共通）と自動スクロール
│   └── useKeyboardShortcut.ts  # 文字入力中を除いた1キーのショートカット
└── components/
    ├── LeafCounter.tsx         # 葉っぱ型の付箋削減カウンター
    ├── Toolbar.tsx             # ＋ボタン・フィルター・残り件数・表示列数
    ├── TodoList.tsx            # 一覧と並び替え操作の接続
    ├── TodoItem.tsx            # 1件分の表示
    ├── TodoEditForm.tsx        # タスク名の入力欄
    ├── EmptyState.tsx          # 一覧が空のときの表示
    └── ShortcutHint.tsx        # ショートカットの説明
```

### 設計方針

- **ロジックと UI を分離**: 状態の変化はすべて `todoUtils.ts` の純粋関数で行い、フックとコンポーネントはそれを呼び出すだけにしています。画面が使う処理とテストしている処理が同じなので、テストで本体の正しさを担保できます。
- **状態の置き場所を役割で分ける**: 永続化するデータ（TODO・カウンター）は `useTodos`、画面上だけの状態（編集中の項目・フィルター）は `App`、ドラッグ中の状態は `useDragReorder` が持ちます。
- **保存できない環境でも動く**: `localStorage` への書き込みに失敗しても、画面上の操作はそのまま使えます。

## ローカルでの起動

Node.js 24 が必要です（[.node-version](.node-version)）。nvm や fnm を使っている場合は自動で切り替わります。

```bash
npm install
npm run dev
```

## テスト

```bash
npm test            # 1回実行
npm run test:watch  # 監視モード
```

## ビルド

```bash
npm run build       # 型チェック（tsc）→ Vite ビルド。出力先は dist/
```

## CI（GitHub Actions）

`main` / `master` / `develop` への push と、プルリクエストで実行します。ワークフロー定義は [.github/workflows/ci.yml](.github/workflows/ci.yml) です。

1. [.node-version](.node-version) の Node.js をセットアップ
2. `npm ci` で依存関係をインストール
3. `npm test` で Vitest を実行
4. `npm run build` でビルド
5. 結果をメールで通知（すべて成功 / いずれか失敗で文面を切り替え）

CI ではデプロイを行いません。デプロイは Cloudflare 側の Git 連携で行います（次の章を参照）。

### 必要な設定

GitHub のリポジトリ設定で、以下を登録してください。

- **Secrets**: `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- **Variables**: `NOTIFY_EMAIL`（通知先メールアドレス）

## Cloudflare へのデプロイ

Cloudflare の Git 連携（Workers Builds）で、GitHub リポジトリ `oharuka27/todo_app` と Cloudflare Workers の `todo-app` をつないでいます。
GitHub に push すると、Cloudflare 側でビルドとデプロイが自動で実行されます。

```
git push ─┬─▶ GitHub Actions: テスト・ビルド → 結果をメール通知
          └─▶ Cloudflare Workers Builds: ビルド → main なら本番にデプロイ
                                                   それ以外は新しいバージョンをアップロードのみ
```

### ブランチごとの動き

| push 先 | Cloudflare で実行されるコマンド | 本番への反映 |
|---|---|---|
| `main`（本番ブランチ） | `npm run build` → `npx wrangler deploy --assets ./dist` | される |
| それ以外（`develop` など） | `npm run build` → `npx wrangler versions upload --assets ./dist` | されない（バージョンの登録のみ） |

### Cloudflare 側の設定

Cloudflare ダッシュボードの Workers & Pages → `todo-app` → 設定 → ビルド で設定しています。

| 項目 | 設定値 |
|---|---|
| Git リポジトリ | `oharuka27/todo_app` |
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npx wrangler deploy --assets ./dist` |
| バージョンコマンド | `npx wrangler versions upload --assets ./dist` |
| ルートディレクトリ | `/` |
| プロダクションブランチ | `main` |
| 非本番ブランチのビルド | 有効 |
| 監視パス | すべて（`*`） |
| ビルド変数・シークレット | なし |
| ビルドキャッシュ | 有効 |
| API トークン | `todo-app build token` |

配信の設定は [wrangler.jsonc](wrangler.jsonc) にあり、`dist/` を静的アセットとして配信します。
静的アセットのみの Worker のため、Cron などのトリガーは使えません。

> **注意**: GitHub Actions と Cloudflare のデプロイは独立して動きます。テストが失敗しても `main` への push でデプロイされるため、`develop` で CI が通ったことを確認してから `main` にマージしてください。

### 手動でデプロイする場合

```bash
npm run build
npx wrangler deploy --assets ./dist
```

## Cloudflare Access で保護する

必要に応じて Cloudflare Access を使い、アプリへのアクセスをメール認証で制限できます。

1. Cloudflare Dashboard で Zero Trust → Access → Applications を開く
2. Self-hosted を選択
3. Public hostname を設定
4. Policy で `Emails` を許可
5. One-time PIN などの IdP を設定

## 制約

このアプリはバックエンドを持たないため、データはブラウザの `localStorage` に保存されます。端末やブラウザ間ではデータは同期されません。
