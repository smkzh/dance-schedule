# Step 8: 名前選択と状態管理

## 目標
- Server Component でデータを取得して Client Component に渡す流れを理解する
- `<select>` ドロップダウンの作り方を理解する
- `useState` で選択中の値を管理する

---

## 作成・更新したファイル

```
web/
├── components/
│   └── NameSelector.tsx   ← 新規: 名前選択ドロップダウン（Client Component）
└── app/submit/
    └── page.tsx           ← 更新: メンバーを取得して NameSelector に渡す
```

---

## Server / Client の役割分担

このステップで重要なのは「データ取得はサーバー、操作はクライアント」という分担。

```
page.tsx（Server Component）
  │
  │  Supabase からメンバー一覧を取得
  │
  └─▶ NameSelector.tsx（Client Component）
        │
        │  props で members を受け取る
        │  useState で選択中の id を管理
        │  ドロップダウンを表示・操作に反応
```

**なぜこう分けるのか**

- データ取得（Supabase へのアクセス）はサーバー側でしかできない
- ドロップダウンの選択状態（`useState`）はブラウザ側でしか管理できない
- 両方を1ファイルに書くことはできないので、役割ごとにファイルを分ける

---

## Server Component 側（page.tsx）

```tsx
export default async function SubmitPage() {
  // Supabase からメンバーを取得
  const { data: performance } = await supabase
    .from("performances")
    .select("id")
    .eq("is_active", true)
    .single();

  const { data: members } = performance
    ? await supabase
        .from("members")
        .select("id, name")
        .eq("performance_id", performance.id)
        .order("name")
    : { data: [] };

  // 取得したデータを props で渡す
  return <NameSelector members={members ?? []} />;
}
```

### 三項演算子（条件 ? 真 : 偽）

```ts
const { data: members } = performance
  ? await supabase.from("members")...   // performance があれば取得する
  : { data: [] };                       // なければ空配列を返す
```

`performance` が null（公演未登録）のときに Supabase を呼ばないためのガード。
`A ? B : C` は「A が truthy なら B、falsy なら C」という意味。

### `.order("name")`

```ts
.order("name")
// SQL: ORDER BY name
```

名前のあいうえお順で取得する。

### `members ?? []`

`members` が null のとき空配列 `[]` にする。
Supabase は失敗時に `data: null` を返すため、null のまま渡さないようにしている。

---

## Client Component 側（NameSelector.tsx）

### useState で選択中の id を管理

```tsx
const [selectedId, setSelectedId] = useState("");
```

初期値は `""` （未選択）。ドロップダウンで選ぶたびに `selectedId` が更新される。

id を保持する理由: 同姓同名のメンバーがいたとき名前だけでは区別できないため。

### `<select>` ドロップダウン

```tsx
<select
  value={selectedId}
  onChange={(e) => setSelectedId(e.target.value)}
>
  <option value="">-- 選択してください --</option>
  {members.map((m) => (
    <option key={m.id} value={m.id}>
      {m.name}
    </option>
  ))}
</select>
```

- `value={selectedId}` : 現在の選択値（状態と連動）
- `onChange` : 選択が変わるたびに `setSelectedId` で状態を更新
- `<option value={m.id}>` : 送信される値は id、表示されるのは name

### `find` で選択中のメンバーを取り出す

```tsx
const selectedMember = members.find((m) => m.id === selectedId);
```

`find` は配列の中から条件に合う最初の要素を返す。

```ts
// selectedId = "uuid-aaa" のとき
members.find((m) => m.id === "uuid-aaa")
// → { id: "uuid-aaa", name: "田中花子" }

// selectedId = "" のとき（未選択）
members.find((m) => m.id === "")
// → undefined
```

`selectedMember` が `undefined` のときはショートサーキットで何も表示しない。

```tsx
{selectedMember && <p>{selectedMember.name} さんの日程を入力してください</p>}
```

---

## 完了の確認
- [ ] `http://localhost:3005/submit` でドロップダウンが表示される
- [ ] ドロップダウンにメンバー名が一覧表示される
- [ ] 名前を選ぶと「〇〇 さんの日程を入力してください」と表示される
