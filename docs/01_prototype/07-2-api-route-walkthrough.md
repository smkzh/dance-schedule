# Step 7-2: app/api/upload/route.ts の新しい構文・表現

---

## 分割代入（Destructuring）

Supabase の操作は毎回 `{ data, error }` の形で結果が返ってくる。

```ts
const { data: performance, error: perfError } = await supabase
  .from("performances")
  .insert(...)
  .select("id")
  .single();
```

`{ data: performance }` は「`data` を取り出して `performance` という名前で使う」という意味。
単に `{ data }` と書くと変数名が `data` になるが、複数の操作で `data` が被るため
別名をつけて区別している。

```ts
const { data: performance }    // data → performance という名前で受け取る
const { data: insertedMembers } // data → insertedMembers という名前で受け取る
const { error: perfError }      // error → perfError という名前で受け取る
```

---

## try / catch（エラーハンドリング）

```ts
try {
  // 正常な処理
  const { error } = await supabase.from(...).insert(...)
  if (error) throw error;  // エラーがあれば catch に飛ぶ

  return NextResponse.json({ ok: true });

} catch (error) {
  // try の中で throw されたらここに来る
  return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
}
```

- `throw` : エラーを発生させて `catch` ブロックに処理を移す
- `catch (error)` : `throw` で投げられた値を受け取る
- `{ status: 500 }` : HTTP ステータスコード 500（サーバーエラー）を返す

**なぜ `if (error) throw error` というパターンを使うのか**

Supabase のメソッドは失敗してもプログラムが止まらず、`error` に値が入って返ってくる。
そのまま次の処理に進むと存在しない id を使ってしまうため、
エラーを検知したら即座に `throw` して処理を止める。

---

## Set と スプレッド構文による重複除去

```ts
const uniqueNumberNames = [...new Set(numberMembers.map((r) => r.number_name))];
```

CSV では同じナンバーが出演者の数だけ繰り返し登場する。

```
ナンバーA, 田中花子
ナンバーA, 鈴木太郎   ← 同じナンバーが重複
ナンバーB, 伊藤さくら
```

このままテーブルに insert すると同じナンバーが複数登録されてしまう。

**Step 1: ナンバー名だけ取り出す**
```ts
numberMembers.map((r) => r.number_name)
// → ["ナンバーA", "ナンバーA", "ナンバーB"]
```

**Step 2: Set で重複を除く**
```ts
new Set(["ナンバーA", "ナンバーA", "ナンバーB"])
// → Set { "ナンバーA", "ナンバーB" }
```

`Set` は同じ値を1つしか持たないコレクション。

**Step 3: スプレッド構文（`...`）で配列に戻す**
```ts
[...new Set(...)]
// → ["ナンバーA", "ナンバーB"]
```

`Set` のままでは `map` などの配列メソッドが使えないため、`[...]` で配列に変換する。

---

## Object.fromEntries と map の組み合わせ

「名前 → id のマップ」を作るための定番パターン。

```ts
const memberMap = Object.fromEntries(
  insertedMembers.map((m) => [m.name, m.id])
);
```

**Step 1: `[キー, 値]` のペア配列を作る**
```ts
insertedMembers.map((m) => [m.name, m.id])
// → [["田中花子", "uuid-aaa"], ["鈴木太郎", "uuid-bbb"]]
```

**Step 2: Object.fromEntries でオブジェクトに変換する**
```ts
Object.fromEntries([["田中花子", "uuid-aaa"], ["鈴木太郎", "uuid-bbb"]])
// → { "田中花子": "uuid-aaa", "鈴木太郎": "uuid-bbb" }
```

作ったマップは後で名前から id を引くのに使う。

```ts
memberMap["田中花子"]  // → "uuid-aaa"
```

---

## shorthand プロパティ

```ts
memberNames.map((name) => ({ performance_id: performance.id, name }))
```

`name` だけ書いて `name: name` を省略している。
変数名とプロパティ名が同じときに使える。

```ts
// 省略あり
{ performance_id: performance.id, name }

// 省略なし（同じ意味）
{ performance_id: performance.id, name: name }
```

---

## `string[]` 型

```ts
const memberNames: string[] = body.memberNames;
```

`string[]` は「文字列の配列」という型。
`[]` をつけることで「その型の配列」になる。

```ts
string       // 文字列1つ
string[]     // 文字列の配列
NumberMemberRow[]  // NumberMemberRow オブジェクトの配列
```
