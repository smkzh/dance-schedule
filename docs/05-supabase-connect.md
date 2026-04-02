# Step 5: Next.js から Supabase に接続する

## 目標
- 環境変数とは何かを理解する
- Supabase クライアントの作り方を理解する
- Server Component でデータを取得してページに表示する

---

## 作成・更新したファイル

```
web/
├── .env.local           ← 新規（自分で作る・gitに含めない）
├── .env.local.example   ← 新規（書き方のサンプル）
├── lib/
│   └── supabase.ts      ← 新規: Supabase クライアント
└── app/
    └── page.tsx         ← 更新: Supabase からデータ取得
```

---

## 環境変数とは

アプリの設定値（URLやパスワードなど）をコードの外で管理する仕組み。

**なぜコードに直接書かないか？**
- GitHub にコードを上げると URL やキーが世界中に公開されてしまう
- 環境ごと（開発・本番）で値を変えられる

Next.js では `.env.local` ファイルに書く。
このファイルは `.gitignore` に含まれているので git には絶対に含まれない。

```
# .env.local（このファイルは git に含まれない）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

### `NEXT_PUBLIC_` プレフィックスとは

```
NEXT_PUBLIC_SUPABASE_URL   → ブラウザからも参照できる
SUPABASE_SECRET_KEY        → サーバー側のみ（ブラウザから見えない）
```

今回使う URL と anon key はブラウザに渡してよい公開情報なので
`NEXT_PUBLIC_` をつける。

---

## 手順

### 1. Supabase から接続情報を取得する

1. Supabase のダッシュボードを開く
2. 左メニュー「Project Settings」→「Data API」を開く
3. 以下の2つをコピーしておく
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon key**: `eyJxxxx...`（長い文字列）

### 2. `.env.local` を作成する

`web/` フォルダの直下に `.env.local` ファイルを作成し、以下を記入する
（`.env.local.example` をコピーして使うと便利）。

```
NEXT_PUBLIC_SUPABASE_URL=https://（コピーした Project URL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（コピーした anon key）
```

### 3. 開発サーバーを再起動する

環境変数を追加したあとは、`npm run dev` を一度止めて再起動する必要がある。

```bash
# Ctrl+C で止めてから
npm run dev
```

---

## コードの説明

### `lib/supabase.ts` — クライアントの作成

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- `process.env.XXX` で環境変数を読み込む
- `!` は「この値は必ず存在する」とTypeScriptに伝えるもの
- `createClient` で Supabase との接続を確立したクライアントを作る
- `export` することで他のファイルから `import` して使える

### `app/page.tsx` — データの取得

```ts
const { data: performance } = await supabase
  .from("performances")      // performances テーブルから
  .select("name")            // name カラムだけ取得
  .eq("is_active", true)     // is_active が true の行に絞る
  .single();                 // 1件だけ取得
```

| メソッド | SQLに例えると |
|---|---|
| `.from("performances")` | `FROM performances` |
| `.select("name")` | `SELECT name` |
| `.eq("is_active", true)` | `WHERE is_active = true` |
| `.single()` | 結果を配列でなく1件のオブジェクトで受け取る |

### `??` 演算子（Null 合体演算子）

```tsx
{performance?.name ?? "公演が登録されていません"}
```

- `performance?.name` : `performance` が null なら undefined を返す（エラーにしない）
- `?? "公演が..."` : 左辺が null / undefined のとき右辺を使う

データが取得できた → 公演名を表示
データがない（未登録）→ 「公演が登録されていません」を表示

---

## 完了の確認
- [ ] `.env.local` に URL と anon key を記入した
- [ ] `npm run dev` を再起動した
- [ ] `http://localhost:3005` に Step 4 で登録した公演名が表示される
