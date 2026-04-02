# Step 12: ナンバー一覧ページ

## 目標
- Supabase のネストした select（テーブル結合）を理解する
- 取得したデータをフィルタして必要な情報だけ取り出す

---

## 更新したファイル

```
web/app/numbers/page.tsx  ← 更新: Supabaseからナンバー一覧を取得して表示
```

---

## Supabase のネストした select

通常の SELECT は1つのテーブルから取得するが、
Supabase では外部キーで結びついたテーブルを同時に取得できる。

```ts
supabase
  .from("numbers")
  .select(`
    id,
    name,
    number_members(        ← numbers に紐づく number_members を取得
      is_choreographer,
      members(name)        ← number_members に紐づく members の name を取得
    )
  `)
```

SQL に例えると JOIN に相当するが、ネストしたオブジェクトとして返ってくる。

### 取得結果のイメージ

```ts
[
  {
    id: "uuid-aaa",
    name: "ナンバーA",
    number_members: [
      { is_choreographer: true,  members: { name: "田中花子" } },
      { is_choreographer: false, members: { name: "鈴木太郎" } },
      { is_choreographer: false, members: { name: "佐藤美咲" } },
    ],
  },
  {
    id: "uuid-bbb",
    name: "ナンバーB",
    number_members: [
      { is_choreographer: true,  members: { name: "鈴木太郎" } },
      ...
    ],
  },
]
```

---

## 振り付け者だけ取り出す

取得したデータには全出演者の情報が入っているので、
`filter` と `map` で振り付け者の名前だけ取り出す。

```ts
const choreographers = number.number_members
  .filter((nm) => nm.is_choreographer)   // 振り付け者だけに絞る
  .map((nm) => nm.members.name);          // 名前だけ取り出す
// → ["田中花子"]
```

### join で配列を文字列に変換

振り付け者が複数いる場合もあるので、`join` で1つの文字列にまとめる。

```ts
["田中花子"].join("・")          // → "田中花子"
["田中花子", "山田健太"].join("・") // → "田中花子・山田健太"
```

---

## 動的ルーティングへのリンク

各ナンバーカードは `/numbers/[id]` へのリンクになっている。

```tsx
<Link href={`/numbers/${number.id}`}>
  {number.name}
</Link>
```

テンプレートリテラル（`` ` `` で囲む）を使って URL に id を埋め込む。
タップするとそのナンバーの詳細ページに遷移する。

---

## 完了の確認
- [ ] `/numbers` でナンバー一覧が表示される
- [ ] 各ナンバーに振り付け者名が表示される
- [ ] ナンバーをタップすると `/numbers/[id]` に遷移する
