# Step 7-3: Supabase のメソッドと map 関数の意味

---

## Supabase のメソッド一覧

Supabase のクエリはメソッドをチェーン（連鎖）して書く。
SQL に例えると理解しやすい。

### `.from("テーブル名")`

操作するテーブルを指定する。必ず先頭に書く。

```ts
supabase.from("performances")
// SQL: FROM performances
```

---

### `.select("カラム名")`

取得するカラムを指定する。

```ts
.select("id")           // id だけ取得
.select("id, name")     // id と name を取得
.select("*")            // 全カラム取得
```

```sql
-- SQL に例えると
SELECT id FROM performances
SELECT id, name FROM members
```

insert / update と組み合わせると「操作後のデータを返す」という意味になる。

```ts
supabase.from("performances").insert({...}).select("id")
// → insert した行の id を返してほしい
```

---

### `.insert(データ)`

新しい行を追加する。

```ts
.insert({ name: "春公演2026", is_active: true })      // 1件
.insert([{ name: "田中花子" }, { name: "鈴木太郎" }])  // 複数件（配列で渡す）
```

```sql
-- SQL に例えると
INSERT INTO performances (name, is_active) VALUES ('春公演2026', true)
```

---

### `.update(データ)`

既存の行を更新する。`.eq()` と組み合わせて使う。

```ts
.update({ is_active: false })
```

```sql
-- SQL に例えると（.eq() と合わせて）
UPDATE performances SET is_active = false WHERE is_active = true
```

---

### `.eq("カラム名", 値)`

条件を指定する（WHERE 句）。

```ts
.eq("is_active", true)   // is_active = true の行に絞る
```

```sql
-- SQL に例えると
WHERE is_active = true
```

---

### `.single()`

結果を「配列」ではなく「1件のオブジェクト」として受け取る。

```ts
// single() なし → 配列で返る
const { data } = await supabase.from("performances").select("id").eq(...)
// data = [{ id: "uuid-aaa" }]

// single() あり → オブジェクトで返る
const { data } = await supabase.from("performances").select("id").eq(...).single()
// data = { id: "uuid-aaa" }
```

後で `performance.id` のようにドットでアクセスしたいので `.single()` を使っている。
配列のままだと `performance[0].id` と書く必要がある。

---

## route.ts の各 map 関数の意味

### ① メンバーを insert 用のオブジェクト配列に変換（34行目）

```ts
memberNames.map((name) => ({ performance_id: performance.id, name }))
```

**目的**: 名前の配列を、テーブルに insert できる形に変換する

```ts
// 変換前（API から受け取った名前の配列）
["田中花子", "鈴木太郎"]

// 変換後（members テーブルに必要な形）
[
  { performance_id: "uuid-xxx", name: "田中花子" },
  { performance_id: "uuid-xxx", name: "鈴木太郎" },
]
```

全員同じ `performance_id` を持つので、`map` で各名前にくっつけている。

---

### ② 名前 → id のマップを作る（40行目・53行目）

```ts
insertedMembers.map((m) => [m.name, m.id])
```

**目的**: insert 後に返ってきた `{ name, id }` の配列から、名前で id を引けるマップを作る

```ts
// 変換前（Supabase から返ってきたデータ）
[
  { id: "uuid-aaa", name: "田中花子" },
  { id: "uuid-bbb", name: "鈴木太郎" },
]

// .map() 後（[キー, 値] のペア配列）
[
  ["田中花子", "uuid-aaa"],
  ["鈴木太郎", "uuid-bbb"],
]

// Object.fromEntries() 後（マップ完成）
{ "田中花子": "uuid-aaa", "鈴木太郎": "uuid-bbb" }
```

#### Object.fromEntries とは

`[キー, 値]` のペアが並んだ配列をオブジェクトに変換する関数。

```ts
Object.fromEntries([
  ["田中花子", "uuid-aaa"],
  ["鈴木太郎", "uuid-bbb"],
])
// → { "田中花子": "uuid-aaa", "鈴木太郎": "uuid-bbb" }
```

逆の操作（オブジェクト → ペア配列）は `Object.entries()` で行える。

```ts
Object.entries({ "田中花子": "uuid-aaa", "鈴木太郎": "uuid-bbb" })
// → [["田中花子", "uuid-aaa"], ["鈴木太郎", "uuid-bbb"]]
```

このマップを使って⑤で名前から id を取り出す。

---

### ③ ナンバー名だけ取り出す（44行目）

```ts
numberMembers.map((r) => r.number_name)
```

**目的**: ナンバー名だけ抜き出して、重複除去（Set）にかける準備をする

```ts
// 変換前
[
  { number_name: "ナンバーA", choreographer: "田中花子", member_name: "田中花子" },
  { number_name: "ナンバーA", choreographer: "田中花子", member_name: "鈴木太郎" },
  { number_name: "ナンバーB", choreographer: "鈴木太郎", member_name: "鈴木太郎" },
]

// 変換後
["ナンバーA", "ナンバーA", "ナンバーB"]
```

この後 `new Set(...)` で重複を除いて `["ナンバーA", "ナンバーB"]` にする。

---

### ④ ナンバーを insert 用のオブジェクト配列に変換（47行目）

```ts
uniqueNumberNames.map((name) => ({ performance_id: performance.id, name }))
```

**目的**: 重複除去済みのナンバー名を、テーブルに insert できる形に変換する

```ts
// 変換前
["ナンバーA", "ナンバーB"]

// 変換後
[
  { performance_id: "uuid-xxx", name: "ナンバーA" },
  { performance_id: "uuid-xxx", name: "ナンバーB" },
]
```

①のメンバーと同じパターン。

---

### ⑤ 出演者の紐付けを insert 用のオブジェクト配列に変換（60〜65行目）

```ts
numberMembers.map((r) => ({
  number_id: numberMap[r.number_name],
  member_id: memberMap[r.member_name],
  is_choreographer: r.choreographer === r.member_name,
}))
```

**目的**: CSV の各行を `number_members` テーブルに insert できる形に変換する

```ts
// 変換前（CSV の1行）
{ number_name: "ナンバーA", choreographer: "田中花子", member_name: "鈴木太郎" }

// 変換後（number_members テーブルに必要な形）
{
  number_id: "uuid-ナンバーA",   // numberMap["ナンバーA"] で取得
  member_id: "uuid-鈴木太郎",    // memberMap["鈴木太郎"] で取得
  is_choreographer: false,       // "田中花子" === "鈴木太郎" → false
}
```

CSV に書いてある名前を、②で作ったマップを使って uuid に変換している。
これが「マップを事前に作っておく」理由。
