# Step 1: 環境構築

## 目標
- Node.js / npm とは何かを理解する
- Next.js プロジェクトを作成し、ブラウザで動かす
- 作成されたファイルの役割を把握する

---

## 前提知識

### Node.js とは
- JavaScript をブラウザの外（PC上）で動かす仕組み
- Next.js などの Web フレームワークを動かすために必要
- `node -v` でバージョン確認できる

### npm とは
- Node.js に付属するパッケージ管理ツール
- `npm install` でライブラリをインストールする
- `npm run dev` で開発サーバーを起動する

### TypeScript とは
- JavaScript に「型」を追加した言語
- 例: `let name: string = "花子"` → name は文字列しか入れられない
- バグを事前に防ぎやすく、エディタの補完も強くなる

### Tailwind CSS とは
- CSS をクラス名で書くスタイリングライブラリ
- 例: `<div className="text-red-500 p-4">` → 赤い文字、padding 4
- CSS ファイルを別途書かずに HTML に直接スタイルを当てられる

---

## 実施内容

### 1. Node.js の確認
今回はすでにインストール済みだった。

```bash
node -v   # → v20.19.0
npm -v    # → 10.8.2
```

### 2. Next.js プロジェクトの作成
`create-next-app` コマンドで雛形を自動生成した。

```bash
npx create-next-app@latest /Users/kazuhasoma/flow-sche/dance-schedule/web \
  --typescript \   # TypeScript を使う
  --tailwind \     # Tailwind CSS を使う
  --eslint \       # コードの品質チェックツールを入れる
  --app \          # App Router を使う（現在の推奨方式）
  --no-src-dir \   # src/ フォルダは作らない（シンプルにする）
  --import-alias "@/*" \  # import のパス省略設定
  --use-npm        # npm を使う
```

ドキュメント（.md ファイル）と Next.js プロジェクトを分けるため、
`web/` サブディレクトリに作成した。

### 3. ディレクトリ構成

```
dance-schedule/
├── docs/                    ← ドキュメント置き場
│   ├── plan.md
│   ├── design.md
│   ├── implementation-plan.md
│   └── 01-setup.md（このファイル）
└── web/                     ← Next.js プロジェクト
    ├── app/                 ← アプリの中心（ページをここに作る）
    │   ├── page.tsx         ← / ホームページ
    │   ├── layout.tsx       ← 全ページ共通レイアウト
    │   └── globals.css      ← 全体 CSS
    ├── public/              ← 画像などの静的ファイル
    ├── package.json         ← 使用ライブラリの一覧
    ├── tsconfig.json        ← TypeScript 設定
    └── next.config.ts       ← Next.js 設定
```

### 4. 開発サーバーの起動

```bash
cd /Users/kazuhasoma/flow-sche/dance-schedule/web
npm run dev
```

`http://localhost:3005` をブラウザで開くと Next.js のデフォルトページが表示される。

#### `npm run dev` が何をしているか
- `package.json` の `scripts.dev` に書かれたコマンドを実行している
- Next.js の開発サーバーが起動し、ファイルを変更すると即座にブラウザに反映される（ホットリロード）
- `Ctrl + C` で停止

---

## 重要な概念: App Router のルーティング

Next.js では **`app/` フォルダの構造が URL に対応する**。

```
app/page.tsx                → http://localhost:3005/
app/submit/page.tsx         → http://localhost:3005/submit
app/numbers/page.tsx        → http://localhost:3005/numbers
app/numbers/[id]/page.tsx   → http://localhost:3005/numbers/123（動的）
app/admin/upload/page.tsx   → http://localhost:3005/admin/upload
```

フォルダを作って `page.tsx` を置くだけで新しいページができる。

---

## 完了の確認
- [ ] `node -v` でバージョンが表示される
- [ ] `npm run dev` で開発サーバーが起動する
- [ ] `http://localhost:3005` でページが表示される
