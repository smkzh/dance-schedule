# Step 2: ページとルーティング

## 目標
- App Router のルーティングの仕組みを理解する
- 全ページの雛形を作ってリンクでつなぐ
- `<Link>` コンポーネントの使い方を理解する

---

## 作成したファイル

```
app/
├── page.tsx                ← / ホーム（既存を書き換え）
├── submit/
│   └── page.tsx            ← /submit 日程提出
├── numbers/
│   ├── page.tsx            ← /numbers ナンバー一覧
│   └── [id]/
│       └── page.tsx        ← /numbers/123 ナンバー詳細
└── admin/
    └── upload/
        └── page.tsx        ← /admin/upload CSVアップロード
```

---

## App Router のルール

`app/` フォルダ内に `page.tsx` を置くとページになる。
フォルダ名がそのまま URL になる。

```
app/page.tsx                → /
app/submit/page.tsx         → /submit
app/numbers/page.tsx        → /numbers
app/numbers/[id]/page.tsx   → /numbers/（任意の値）
app/admin/upload/page.tsx   → /admin/upload
```

### `[id]` フォルダとは（動的ルーティング）

`[id]` のように角括弧で囲んだフォルダは「なんでも受け取れる URL」になる。

```
/numbers/abc123   → [id] = "abc123"
/numbers/xyz999   → [id] = "xyz999"
```

ページ内で `params` から値を取り出して使う：

```tsx
// app/numbers/[id]/page.tsx
export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // URL の [id] 部分が取れる
  return <p>ナンバーID: {id}</p>
}
```

---

## `<Link>` コンポーネント

Next.js でページ間を移動するには `<a>` タグではなく `<Link>` を使う。

```tsx
import Link from "next/link";

// NG: <a> タグはページ全体をリロードする
<a href="/submit">日程を提出する</a>

// OK: <Link> はページをリロードせずに移動できる（高速）
<Link href="/submit">日程を提出する</Link>
```

`<Link>` を使うとブラウザがページ全体を読み込み直さず、
差分だけ更新されるため表示が速い。

---

## コードの読み方

### ホームページ（`app/page.tsx`）

```tsx
import Link from "next/link";           // Link コンポーネントを読み込む

export default function Home() {        // Home という関数を export（公開）する
  return (                              // JSX を返す
    <main className="...">             // className で Tailwind のスタイルを当てる
      <h1>ダンススケジュール</h1>
      <Link href="/submit">            // /submit へのリンク
        日程を提出する
      </Link>
    </main>
  );
}
```

### `export default` とは
- そのファイルの「メインの出力」を指定するキーワード
- `page.tsx` では必ずページコンポーネントを `export default` する
- Next.js がこれを見つけてページとして表示する

---

## 完了の確認
- [ ] `http://localhost:3005` でホームページが表示される
- [ ] 「日程を提出する」ボタンで `/submit` に移動できる
- [ ] 「候補日を確認する」ボタンで `/numbers` に移動できる
- [ ] 各ページの「← 戻る」リンクで前のページに戻れる
- [ ] `http://localhost:3005/numbers/test` で「ナンバーID: test」が表示される
- [ ] `http://localhost:3005/admin/upload` でアップロードページが表示される
