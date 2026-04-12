# Next.js の概要

---

## Next.js とは

Next.js は React をベースにした Web フレームワーク。

```
JavaScript（言語）
  └── React（UI を作るライブラリ）
        └── Next.js（React をもとにした Web アプリ開発フレームワーク）
```

React だけでは「ページ遷移」「データ取得」「サーバーとの通信」などを自分で仕組みを作る必要がある。
Next.js はそれらをまとめて提供してくれる。

---

## React とは

画面を「コンポーネント（部品）」として作る考え方。

```tsx
// ボタンのコンポーネント
function MyButton() {
  return <button>クリック</button>
}

// ページでコンポーネントを使う
function Page() {
  return (
    <div>
      <h1>タイトル</h1>
      <MyButton />   {/* ← 部品を組み合わせる */}
      <MyButton />
    </div>
  )
}
```

- HTML に似た書き方（JSX / TSX）で UI を記述する
- コンポーネントは関数として書く
- `.tsx` ファイルは TypeScript + JSX の拡張子

---

## App Router とは

Next.js のルーティング（URL とページの対応）の仕組み。
`app/` フォルダの構造が URL に対応する。

```
app/
  page.tsx                → /
  submit/
    page.tsx              → /submit
  numbers/
    page.tsx              → /numbers
    [id]/
      page.tsx            → /numbers/123（[id] は任意の値）
  admin/
    upload/
      page.tsx            → /admin/upload
```

**ルールは1つ: `page.tsx` を置いたフォルダが URL になる。**

### 特殊なファイル名

| ファイル名 | 役割 |
|---|---|
| `page.tsx` | そのURLのページ本体 |
| `layout.tsx` | 複数ページで共通のレイアウト（ヘッダーなど） |
| `route.ts` | API エンドポイント（データの取得・保存処理） |

---

## Server Component と Client Component

Next.js のコンポーネントには2種類ある。

### Server Component（デフォルト）
- サーバー側で実行される
- データベースへのアクセスが直接できる
- ユーザーの操作（クリック、入力）には反応できない

```tsx
// app/numbers/page.tsx
// → Server Component（デフォルト）
// → Supabase からデータを取得してHTMLを返す
export default async function NumbersPage() {
  const data = await fetchFromSupabase() // DB アクセスOK
  return <div>{data.name}</div>
}
```

### Client Component（`"use client"` が必要）
- ブラウザ側で実行される
- ユーザーの操作に反応できる（ボタン押下、入力など）
- データベースへの直接アクセスはできない

```tsx
"use client" // ← この行を先頭に書くと Client Component になる

import { useState } from "react"

export default function SubmitButton() {
  const [clicked, setClicked] = useState(false) // ← 状態管理はClientのみ
  return (
    <button onClick={() => setClicked(true)}>
      {clicked ? "送信済み" : "送信する"}
    </button>
  )
}
```

### 使い分けの目安

| やりたいこと | どちらを使う |
|---|---|
| DB からデータを取得して表示 | Server Component |
| ボタンをクリックして何かする | Client Component |
| フォームへの入力を受け付ける | Client Component |
| カレンダーや時間グリッドの操作 | Client Component |

---

## API ルート（route.ts）

ページとは別に、データを受け取って処理を返す「API」を作れる。

```
app/
  api/
    submit/
      route.ts    → POST /api/submit
    upload/
      route.ts    → POST /api/upload
```

```ts
// app/api/submit/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // Supabase にデータを保存する処理
  return Response.json({ ok: true })
}
```

フロントエンド（ページ）からこの API に fetch でデータを送り、
API 側で Supabase に保存する、という流れになる。

---

## このプロジェクトでの使い方まとめ

| ページ | 種類 | 理由 |
|---|---|---|
| `/` ホーム | Server Component | DB から公演名を取得して表示するだけ |
| `/submit` | Client Component | カレンダー操作・スロット選択が必要 |
| `/numbers` | Server Component | ナンバー一覧を DB から取得して表示するだけ |
| `/numbers/[id]` | Server Component | 候補日を DB から計算して表示するだけ |
| `/admin/upload` | Client Component | ファイルアップロード操作が必要 |
| `POST /api/submit` | API ルート | 日程データを Supabase に保存 |
| `POST /api/upload` | API ルート | CSV データを Supabase に保存 |

---

## 開発の流れ

```
1. app/ にフォルダと page.tsx を作る（ページ追加）
2. ページに必要なコンポーネントを書く
3. データが必要なら Supabase から取得する
4. ユーザー操作が必要なら "use client" をつける
5. npm run dev で確認する
```
